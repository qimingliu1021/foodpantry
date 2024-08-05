import google.generativeai as genai

genai.configure(api_key='AIzaSyBQSkYr_9KgPDY1gccPepkNoHnr93vNKd0')

# sample_file = genai.upload_file(path="jetpack.jpg", display_name="Jetpack drawing")
sample_file = genai.upload_file("https://firebasestorage.googleapis.com/v0/b/panetryfood.appspot.com/o/photos%2F1722738490069.png?alt=media&token=fb439b58-ae92-4b38-ac02-134e0836c7f4")

# print(f"Uploaded file '{sample_file.display_name}' as: {sample_file.uri}")

file = genai.get_file(name=sample_file.name)
# print(f"Retrieved file '{file.display_name}' as: {sample_file.uri}")

model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")

# Prompt the model with text and the previously uploaded image.
response = model.generate_content([sample_file, "Describe the appearance of the main character in the picture"])

print(response.text)