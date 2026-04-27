import ollama
import json


def analyze_complaint(text):

    prompt = f"""
You are an AI system for a civic complaint platform.

Analyze the complaint and return JSON with:
- category
- keywords
- urgency

Categories:
Pothole
Garbage
Streetlight
Water Leak
Road Damage
Other

Urgency levels:
Low
Medium
High

Complaint:
{text}

Return ONLY valid JSON.
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}]
    )

    output = response["message"]["content"].strip()

    try:
        data = json.loads(output)
    except:
        data = {
            "category": "Other",
            "keywords": [],
            "urgency": "Low"
        }

    return data