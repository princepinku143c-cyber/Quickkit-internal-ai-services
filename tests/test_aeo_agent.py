import contextlib
import io
import json
import os
import sys
import unittest
import urllib.request
from pathlib import Path
from urllib.error import HTTPError
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents.aeo_agent import MAX_PROVIDER_RESPONSE_BYTES, _NoRedirectHandler, generate_qa_pairs


class FakeResponse:
    def __init__(self, payload, headers=None):
        self.payload = payload
        self.headers = headers or {}
        self.read_sizes = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, size=-1):
        self.read_sizes.append(size)
        body = json.dumps(self.payload).encode("utf-8")
        return body if size is None or size < 0 else body[:size]


PROVIDER_ENV = {
    "AEO_API_ENABLED": "true",
    "OPENCODE_API_KEY": "unit-test-only",
    "OPENCODE_API_ENDPOINT": "https://opencode.ai/inference/openai/v1/chat/completions",
    "OPENCODE_MODEL": "test-model",
}


class AeoAgentCredentialTests(unittest.TestCase):
    @patch.dict(os.environ, {}, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_missing_key_fails_closed_without_network_call(self, mocked_build_opener):
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            result = generate_qa_pairs("real estate lead qualification")

        self.assertEqual(result, "[]")
        mocked_build_opener.assert_not_called()
        self.assertIn("OPENCODE_API_KEY", stderr.getvalue())

    def test_redirect_handler_rejects_cross_origin_redirects(self):
        handler = _NoRedirectHandler()
        request = urllib.request.Request(
            "https://opencode.ai/inference/openai/v1/chat/completions",
            data=b"{}",
            headers={"Authorization": "Bearer unit-test-only"},
            method="POST",
        )
        redirected = handler.redirect_request(
            request, None, 302, "Found", {}, "https://attacker.example/collect"
        )
        self.assertIsNone(redirected)

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_request_uses_environment_key_and_expected_provider(self, mocked_build_opener):
        mocked_build_opener.return_value.open.return_value = FakeResponse(
            {"choices": [{"message": {"content": "[]"}}]}
        )

        self.assertEqual(generate_qa_pairs("real estate"), "[]")
        handler = mocked_build_opener.call_args.args[0]
        self.assertIsInstance(handler, _NoRedirectHandler)
        request = mocked_build_opener.return_value.open.call_args.args[0]
        payload = json.loads(request.data)

        self.assertEqual(
            request.full_url,
            "https://opencode.ai/inference/openai/v1/chat/completions",
        )
        self.assertEqual(request.get_header("Authorization"), "Bearer unit-test-only")
        self.assertEqual(payload["model"], "test-model")
        self.assertEqual(mocked_build_opener.return_value.open.call_args.kwargs["timeout"], 30)
        self.assertEqual(mocked_build_opener.return_value.open.return_value.read_sizes, [MAX_PROVIDER_RESPONSE_BYTES + 1])

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_provider_error_body_is_not_written_to_stderr(self, mocked_build_opener):
        mocked_build_opener.return_value.open.side_effect = HTTPError(
            "https://opencode.ai/inference/openai/v1/chat/completions",
            403,
            "Forbidden",
            {},
            io.BytesIO(b"provider-secret-response"),
        )
        stderr = io.StringIO()

        with contextlib.redirect_stderr(stderr):
            result = generate_qa_pairs("real estate")

        self.assertEqual(result, "[]")
        self.assertNotIn("provider-secret-response", stderr.getvalue())
        self.assertIn("HTTPError", stderr.getvalue())

    @patch.dict(os.environ, {**PROVIDER_ENV, "AEO_API_ENABLED": "false"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_disabled_flag_fails_closed_even_when_key_is_present(self, mocked_build_opener):
        self.assertEqual(generate_qa_pairs("real estate"), "[]")
        mocked_build_opener.assert_not_called()

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_invalid_provider_configuration_fails_closed(self, mocked_build_opener):
        invalid_configs = [
            {"OPENCODE_API_ENDPOINT": ""},
            {"OPENCODE_MODEL": ""},
            {"OPENCODE_API_ENDPOINT": "https://attacker.example/inference/openai/v1/chat/completions"},
            {"OPENCODE_API_ENDPOINT": "https://opencode.ai/zen/v1/chat/completions"},
            {"OPENCODE_MODEL": "deepseek-v4-flash-free"},
            {"OPENCODE_MODEL": "bad model id"},
            {"OPENCODE_MODEL": "unapproved-free"},
        ]
        for overrides in invalid_configs:
            with self.subTest(overrides=overrides), patch.dict(os.environ, {**PROVIDER_ENV, **overrides}, clear=True):
                self.assertEqual(generate_qa_pairs("real estate"), "[]")
        mocked_build_opener.assert_not_called()

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_provider_response_without_content_length_is_bounded(self, mocked_build_opener):
        response = FakeResponse({"choices": [{"message": {"content": "x" * MAX_PROVIDER_RESPONSE_BYTES}}]})
        mocked_build_opener.return_value = response
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            result = generate_qa_pairs("real estate")

        self.assertEqual(result, "[]")
        self.assertEqual(response.read_sizes, [MAX_PROVIDER_RESPONSE_BYTES + 1])
        self.assertIn("ValueError", stderr.getvalue())

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_declared_oversized_provider_response_is_rejected_before_read(self, mocked_build_opener):
        response = FakeResponse(
            {"choices": [{"message": {"content": "small"}}]},
            headers={"Content-Length": str(MAX_PROVIDER_RESPONSE_BYTES + 1)},
        )
        mocked_build_opener.return_value = response
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            result = generate_qa_pairs("real estate")

        self.assertEqual(result, "[]")
        self.assertEqual(response.read_sizes, [])
        self.assertIn("ValueError", stderr.getvalue())

    @patch.dict(os.environ, PROVIDER_ENV, clear=True)
    @patch("agents.aeo_agent.urllib.request.build_opener")
    def test_invalid_keyword_and_count_are_rejected_before_network_call(self, mocked_build_opener):
        invalid_requests = [
            (None, 5),
            ("", 5),
            ("   ", 5),
            ("x" * 161, 5),
            ("bad\nkeyword", 5),
            ("real estate", 0),
            ("real estate", 6),
            ("real estate", True),
            ("real estate", "5"),
        ]
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            for keyword, count in invalid_requests:
                with self.subTest(keyword=repr(keyword)[:24], count=repr(count)):
                    self.assertEqual(generate_qa_pairs(keyword, count), "[]")
        mocked_build_opener.assert_not_called()

    def test_agent_source_has_no_hardcoded_bearer_api_key(self):
        source = (Path(__file__).resolve().parents[1] / "agents" / "aeo_agent.py").read_text()
        self.assertNotIn("Bearer sk-", source)
        self.assertNotIn("/zen/v1/chat/completions", source)
        self.assertNotIn('"model": "deepseek-v4-flash-free"', source)

    def test_production_template_marks_aeo_key_optional_and_disabled_by_default(self):
        root = Path(__file__).resolve().parents[1]
        template = (root / ".env.production.example").read_text()
        dev_template = (root / ".env.example").read_text()

        self.assertIn("AEO Python agent (optional", template)
        self.assertRegex(template, r"(?m)^# OPENCODE_API_KEY=your_opencode_api_key$")
        self.assertNotRegex(template, r"(?m)^OPENCODE_API_KEY=")
        self.assertIn("without network access", template)
        self.assertIn("Optional AEO agent provider key", dev_template)
        self.assertRegex(dev_template, r"(?m)^# OPENCODE_API_KEY=$")
        self.assertIn("# OPENCODE_API_ENDPOINT=https://opencode.ai/inference/openai/v1/chat/completions", template)
        self.assertIn("# OPENCODE_MODEL=your_approved_paid_or_go_model_id", template)
        self.assertIn("# OPENCODE_API_ENDPOINT=https://opencode.ai/inference/openai/v1/chat/completions", dev_template)
        self.assertIn("# OPENCODE_MODEL=your_approved_paid_or_go_model_id", dev_template)


if __name__ == "__main__":
    unittest.main()
