from models.text_analyzer import analyze_complaint
from models.image_classifier import classify_image


def compute_priority(urgency, confidence):

    urgency_score = {
        "Low": 10,
        "Medium": 25,
        "High": 40
    }

    score = urgency_score.get(urgency, 10) + (confidence * 40)

    return min(100, int(score))

def normalize_category(category, keywords=None):

    category = category.strip().lower()

    mapping = {
        "pothole": "ROAD",
        "road damage": "ROAD",
        "garbage": "WASTE",
        "water leak": "WATER",
        "streetlight": "ROAD",
    }

    # 1. Direct mapping
    if category in mapping:
        return mapping[category]

    # 2. If category is "other", use keywords
    if category == "other" and keywords:
        k = " ".join(keywords).lower()

        if "pothole" in k or "road" in k:
            return "ROAD"
        if "garbage" in k:
            return "WASTE"
        if "water" in k:
            return "WATER"
        if "drain" in k or "sewage" in k:
            return "SEWAGE"

    # 3. fallback
    return "OTHER"

def fuse_results(text, image_path=None):

    text_result = analyze_complaint(text)

    image_result = None

    if image_path:
        image_result = classify_image(image_path)

    raw_category = text_result["category"]
    final_category = normalize_category(raw_category, text_result.get("keywords", []))

    source = "text"
    confidence = 0.6

    if image_result and image_result["confidence"] > 0.65:

        image_label = image_result["category"]

        if "pothole" in image_label:
            final_category = "ROAD"
        elif "garbage" in image_label:
            final_category = "WASTE"
        elif "streetlight" in image_label:
            final_category = "ROAD"
        elif "water" in image_label:
            final_category = "WATER"
        elif "road" in image_label:
            final_category = "ROAD"

        source = "image"
        confidence = image_result["confidence"]

    urgency = text_result["urgency"]

    priority = compute_priority(urgency, confidence)

    return {
        "category": final_category,
        "source": source,
        "confidence": confidence,
        "urgency": urgency,
        "priority_score": priority,
        "keywords": text_result["keywords"]
    }