import torch
import clip
from PIL import Image


# Load model once
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Civic complaint labels
labels = [
    "pothole on road",
    "garbage pile",
    "broken streetlight",
    "water leakage on road",
    "damaged road marking"
]


def classify_image(image_path):

    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)

    text = clip.tokenize(labels).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text)

        logits_per_image, _ = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    index = probs.argmax()

    result = {
        "category": labels[index],
        "confidence": float(probs[0][index])
    }

    return result