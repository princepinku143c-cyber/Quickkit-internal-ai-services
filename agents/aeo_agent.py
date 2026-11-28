#!/usr/bin/env python3
"""AEO (Answer Engine Optimization) Agent.

OPENCODE_API_KEY is optional. When it is absent, the agent returns an empty
result without making a provider request. Never commit provider credentials
to source control.
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
    provider = _provider_config()
    if provider is None:
        print(
            "AEO agent is disabled or provider configuration is incomplete.",
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
            result = json.loads(resp.read().decode("utf-8"))
        return result["choices"][0]["message"].get("content", "")
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, IndexError) as exc:
        print(f"AEO agent request failed: {type(exc).__name__}", file=sys.stderr)
        return "[]"


if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "AI agents for business"
    print(generate_qa_pairs(keyword))
