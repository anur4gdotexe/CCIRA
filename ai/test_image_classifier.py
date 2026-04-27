from models.image_classifier import classify_image

image_path = "sample.jpg"

result = classify_image(image_path)

print(result)