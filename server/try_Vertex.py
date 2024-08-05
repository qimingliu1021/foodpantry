import vertexai

from vertexai.generative_models import GenerativeModel, Part

# TODO(developer): Update and un-comment below line
project_id = "panetryfood"

vertexai.init(project=project_id, location="us-central1")

model = GenerativeModel("gemini-1.5-flash-001")

image_file = Part.from_uri(
    "gs://panetryfood.appspot.com/photos/1722820361059.png", "image/png"
)

# Query the model
response = model.generate_content([image_file, "what is this image?"])
print(response.text)