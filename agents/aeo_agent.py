#!/usr/bin/env python3
"""Generate AEO Q&A content using the configured OpenCode-compatible API."""
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_API_URL = "https://opencode.ai/zen/v1/chat/completions"
DEFAULT_MODEL = "deepseek-v4-flash"


def generate_qa_pairs(keyword, count=5):
    api_key = os.environ.get("OPENCODE_API_KEY")
    if not api_key:
        raise RuntimeError("OPENCODE_API_KEY is not configured")
    if not isinstance(count, int) or count < 1 or count > 20:
        raise ValueError("count must be an integer between 1 and 20")
    api_url = os.environ.get("OPENCODE_API_URL", DEFAULT_API_URL).rstrip("/")
    model = os.environ.get("OPENCODE_MODEL", DEFAULT_MODEL)
    prompt = (
        f'Generate {count} Q&A pairs about "{keyword}" for answer-engine '
        "optimization. Return a JSON array with question and answer fields."
    )
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
        "temperature": 0.2,
    }
    request = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "QuickKitAI-AEO-Agent/1.1",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # Do not echo provider response bodies; they can contain sensitive details.
        raise RuntimeError(f"OpenCode API returned HTTP {exc.code}") from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("OpenCode API request failed or returned invalid JSON") from exc

    choices = result.get("choices") or []
    if not choices:
        raise RuntimeError("OpenCode API returned no completion choices")
    content = choices[0].get("message", {}).get("content")
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("OpenCode API returned an empty completion")
    return content


if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "AI agents for business"
    try:
        print(generate_qa_pairs(keyword))
    except (RuntimeError, ValueError) as error:
        print(f"AEO agent error: {error}", file=sys.stderr)
        sys.exit(1)
