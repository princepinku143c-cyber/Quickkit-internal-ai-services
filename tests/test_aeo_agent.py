import contextlib
import io
import json
import os
import re
import sys
import unittest
from pathlib import Path
from urllib.error import HTTPError
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents.aeo_agent import generate_qa_pairs


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class AeoAgentCredentialTests(unittest.TestCase):
    @patch.dict(os.environ, {}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_missing_key_fails_closed_without_network_call(self, mocked_urlopen):
        stderr = io.StringIO()
        with contextlib.redirect_stderr(stderr):
            result = generate_qa_pairs("real estate lead qualification")

        self.assertEqual(result, "[]")
        mocked_urlopen.assert_not_called()
        self.assertIn("OPENCODE_API_KEY", stderr.getvalue())

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "unit-test-only"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_request_uses_environment_key_and_expected_provider(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeResponse(
            {"choices": [{"message": {"content": "[]"}}]}
        )

        self.assertEqual(generate_qa_pairs("real estate"), "[]")
        request = mocked_urlopen.call_args.args[0]
        payload = json.loads(request.data)

        self.assertEqual(
            request.full_url,
            "https://opencode.ai/zen/v1/chat/completions",
        )
        self.assertEqual(request.get_header("Authorization"), "Bearer unit-test-only")
        self.assertEqual(payload["model"], "deepseek-v4-flash-free")
        self.assertEqual(mocked_urlopen.call_args.kwargs["timeout"], 30)

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "unit-test-only"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_provider_error_body_is_not_written_to_stderr(self, mocked_urlopen):
        mocked_urlopen.side_effect = HTTPError(
            "https://opencode.ai/zen/v1/chat/completions",
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

    def test_agent_source_has_no_hardcoded_bearer_api_key(self):
        source = (Path(__file__).resolve().parents[1] / "agents" / "aeo_agent.py").read_text()
        self.assertIsNone(re.search(r"Bearer\s+sk-[A-Za-z0-9]", source))

    def test_production_template_documents_aeo_agent_key(self):
        template = (Path(__file__).resolve().parents[1] / ".env.production.example").read_text()
        self.assertRegex(template, r"(?m)^OPENCODE_API_KEY=your_opencode_api_key$")


if __name__ == "__main__":
    unittest.main()
