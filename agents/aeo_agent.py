#!/usr/bin/env python3
"""Generate AEO question-and-answer content using the configured OpenCode API."""
import json
import os
import sys
import urllib.error
import urllib.request


API_URL = "https://opencode.ai/zen/v1/chat/completions"
MODEL = "deepseek-v4-flash-free"


def generate_qa_pairs(keyword, count=5):
    api_key = os.environ.get("OPENCODE_API_KEY")
    if not api_key:
        raise RuntimeError("OPENCODE_API_KEY is not configured")

    prompt = (
        f'Generate {count} Q&A pairs about "{keyword}" for answer-engine '
        "optimization. Return a JSON array with question and answer fields."
    )
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "QuickKitAI-AEO-Agent/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("AEO provider request failed") from exc

    choices = result.get("choices") or []
    if not choices:
        raise RuntimeError("AEO provider returned no completion")
    return choices[0].get("message", {}).get("content", "")


if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "AI agents for business"
    try:
        print(generate_qa_pairs(keyword))
    except RuntimeError as error:
        print(f"AEO agent error: {error}", file=sys.stderr)
        sys.exit(1)
