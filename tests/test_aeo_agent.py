import json
import os
import unittest
from io import BytesIO
from urllib.error import HTTPError
from unittest.mock import patch

from agents.aeo_agent import DEFAULT_API_URL, DEFAULT_MODEL, generate_qa_pairs


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode()


class AeoAgentTests(unittest.TestCase):
    @patch.dict(os.environ, {}, clear=True)
    def test_missing_key_fails_closed(self):
        with self.assertRaisesRegex(RuntimeError, "OPENCODE_API_KEY"):
            generate_qa_pairs("test")

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "test-secret"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_request_uses_supported_defaults(self, mocked):
        mocked.return_value = FakeResponse({"choices": [{"message": {"content": "[]"}}]})
        self.assertEqual(generate_qa_pairs("real estate"), "[]")
        req = mocked.call_args.args[0]
        body = json.loads(req.data)
        self.assertEqual(req.full_url, DEFAULT_API_URL)
        self.assertEqual(body["model"], DEFAULT_MODEL)
        self.assertEqual(req.get_header("Authorization"), "Bearer test-secret")
        self.assertEqual(mocked.call_args.kwargs["timeout"], 45)

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "test-secret", "OPENCODE_API_URL": "https://example.test/v1/chat/completions", "OPENCODE_MODEL": "custom-model"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_endpoint_and_model_are_configurable(self, mocked):
        mocked.return_value = FakeResponse({"choices": [{"message": {"content": "ok"}}]})
        self.assertEqual(generate_qa_pairs("test"), "ok")
        req = mocked.call_args.args[0]
        self.assertEqual(req.full_url, "https://example.test/v1/chat/completions")
        self.assertEqual(json.loads(req.data)["model"], "custom-model")

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "test-secret"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_http_errors_are_sanitized(self, mocked):
        mocked.side_effect = HTTPError("https://example.test", 403, "Forbidden", {}, BytesIO(b"secret response"))
        with self.assertRaisesRegex(RuntimeError, "HTTP 403") as ctx:
            generate_qa_pairs("test")
        self.assertNotIn("secret response", str(ctx.exception))

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "test-secret"}, clear=True)
    @patch("agents.aeo_agent.urllib.request.urlopen")
    def test_empty_completion_rejected(self, mocked):
        mocked.return_value = FakeResponse({"choices": [{"message": {"content": ""}}]})
        with self.assertRaisesRegex(RuntimeError, "empty completion"):
            generate_qa_pairs("test")

    @patch.dict(os.environ, {"OPENCODE_API_KEY": "test-secret"}, clear=True)
    def test_count_bounds(self):
        with self.assertRaises(ValueError):
            generate_qa_pairs("test", 0)
        with self.assertRaises(ValueError):
            generate_qa_pairs("test", 21)


if __name__ == "__main__":
    unittest.main()
