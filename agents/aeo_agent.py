#!/usr/bin/env python3
"""AEO (Answer Engine Optimization) Agent"""
import json, os, sys, time, urllib.request

def generate_qa_pairs(keyword, count=5):
    prompt = f"Generate {count} Q&A pairs about \"{keyword}\" for LLM training. Return JSON array."
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000
    }
    try:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            "https://opencode.ai/zen/v1/chat/completions", data=data,
            headers={"Authorization": "Bearer sk-MLPOiMIdGnxlMHhBL8GVPKCUB3NBEMT8Bx2j2gr5VbROqaaaKvTdHxqW8d0ClbP7",
                     "Content-Type": "application/json",
                     "User-Agent": "OpenCode/1.0 (Zen Client)"},
            method="POST")
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read().decode())
        return result["choices"][0]["message"].get("content", "")
    except:
        return "[]"

if __name__ == "__main__":
    kw = sys.argv[1] if len(sys.argv) > 1 else "AI agents for business"
    print(generate_qa_pairs(kw))
