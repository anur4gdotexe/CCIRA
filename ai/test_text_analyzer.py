from models.text_analyzer import analyze_complaint

text = "There is a huge pothole near the main market road and vehicles are getting damaged."

result = analyze_complaint(text)

print(result)