#!/usr/bin/env python3
"""AEO (Answer Engine Optimization) Agent.

Configure OPENCODE_API_KEY in the server environment. Never commit provider
credentials to source control.
"""
import json
import os
import sys
import urllib.error
import urllib.request


def generate_qa_pairs(keyword, count=5):
    api_key = os.environ.get("OPENCODE_API_KEY", "").strip()
    if not api_key:
        print("AEO agent is not configured: OPENCODE_API_KEY is missing.", file=sys.stderr)
        return "[]"

    prompt = f'Generate {count} Q&A pairs about "{keyword}" for LLM training. Return JSON array.'
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://opencode.ai/zen/v1/chat/completions",
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "OpenCode/1.0 (Zen Client)",
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
