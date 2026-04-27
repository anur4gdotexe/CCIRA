from models.fusion_engine import fuse_results

text = "There is a large pothole near the bus stand and vehicles are getting damaged."

result = fuse_results(text, "sample.jpg")

print(result)