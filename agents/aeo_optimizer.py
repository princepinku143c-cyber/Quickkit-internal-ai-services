#!/usr/bin/env python3
"""AEO Content Optimizer"""
import json

def add_faq_schema(content, keyword, qa_pairs=None):
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": f"What is {keyword}?",
             "acceptedAnswer": {"@type": "Answer", "text": content[:200]}}
        ]
    }
    if qa_pairs:
        schema["mainEntity"] = [
            {"@type": "Question", "name": q.get("question",""),
             "acceptedAnswer": {"@type": "Answer", "text": q.get("answer","")}}
            for q in qa_pairs
        ]
    return f"\n<script type=\"application/ld+json\">\n{json.dumps(schema, indent=2)}\n</script>"

def optimize_content(content, keyword):
    return f"<!-- AEO-OPTIMIZED: {keyword} -->\n{content}\n{add_faq_schema(content, keyword)}"

if __name__ == "__main__":
    print("AEO Optimizer v1.0 - QuickKitAI")
