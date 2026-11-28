#!/usr/bin/env python3
"""AEO (Answer Engine Optimization) Agent.

AEO_API_ENABLED, OPENCODE_API_KEY, OPENCODE_API_ENDPOINT, and OPENCODE_MODEL
must all be explicitly configured. Missing or invalid configuration returns an
empty result without making a provider request. Never commit credentials to source control.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit


OPEN_CODE_ENDPOINT_PATHS = {
    "/inference/openai/v1/chat/completions",
    "/inference/go/openai/v1/chat/completions",
}
OPEN_CODE_MODEL_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")
MAX_PROVIDER_RESPONSE_BYTES = 64 * 1024
MAX_KEYWORD_LENGTH = 160


def _provider_config():
    api_key = os.environ.get("OPENCODE_API_KEY", "").strip()
    endpoint = os.environ.get("OPENCODE_API_ENDPOINT", "").strip()
    model = os.environ.get("OPENCODE_MODEL", "").strip()
    if os.environ.get("AEO_API_ENABLED", "").strip() != "true" or not api_key or not endpoint or not model:
        return None
    if not OPEN_CODE_MODEL_PATTERN.fullmatch(model) or model.lower() == "deepseek-v4-flash-free":
        return None
    try:
        parsed = urlsplit(endpoint)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "opencode.ai"
            or parsed.port is not None
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or parsed.path not in OPEN_CODE_ENDPOINT_PATHS
        ):
            return None
    except ValueError:
        return None
    if parsed.path == "/inference/openai/v1/chat/completions" and model.lower().endswith("-free"):
        return None
    return api_key, endpoint, model


def generate_qa_pairs(keyword, count=5):
    if (
        not isinstance(keyword, str)
        or not keyword.strip()
        or len(keyword) > MAX_KEYWORD_LENGTH
        or re.search(r"[\x00-\x1f\x7f]", keyword)
        or type(count) is not int
        or count < 1
        or count > 5
    ):
        print("AEO agent received an invalid topic or Q&A count.", file=sys.stderr)
        return "[]"
    keyword = keyword.strip()

    provider = _provider_config()
    if provider is None:
        print(
            "AEO agent is disabled or provider configuration is incomplete (AEO_API_ENABLED, OPENCODE_API_KEY, OPENCODE_API_ENDPOINT, OPENCODE_MODEL).",
            file=sys.stderr,
        )
        return "[]"
    api_key, endpoint, model = provider

    prompt = f'Generate {count} Q&A pairs about "{keyword}" for LLM training. Return JSON array.'
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "QuickKitAI-AEO/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            headers = getattr(resp, "headers", None)
            declared_length = headers.get("Content-Length") if headers is not None else None
            if (
                isinstance(declared_length, str)
                and re.fullmatch(r"\d+", declared_length)
                and int(declared_length) > MAX_PROVIDER_RESPONSE_BYTES
            ):
                raise ValueError("AEO provider response is too large.")
            response_body = resp.read(MAX_PROVIDER_RESPONSE_BYTES + 1)
            if not isinstance(response_body, (bytes, bytearray)) or len(response_body) > MAX_PROVIDER_RESPONSE_BYTES:
                raise ValueError("AEO provider response is too large or invalid.")
            result = json.loads(bytes(response_body).decode("utf-8"))
        return result["choices"][0]["message"].get("content", "")
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, IndexError) as exc:
        print(f"AEO agent request failed: {type(exc).__name__}", file=sys.stderr)
        return "[]"


if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "AI agents for business"
    print(generate_qa_pairs(keyword))
