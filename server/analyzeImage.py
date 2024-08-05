from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

@app.route('/analyzeImage', methods=['POST'])
def analyze_image(): 
  data = request.get_json()
  photo_url = data['photoUrl']

  openai.api_key = os.getenv('OPENAI_API_KEY')
  
  try: 
    print("calling openai API... ")
    response = openai.ChatCompletion.create(
      model="gpt-4-vision-preview",
            messages=[{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": "Tell the name of the food in the picture"
                }, {
                    "type": "image_url",
                    "image_url": {
                        "url": photo_url,
                        "detail": "low"
                    }
                }]
            }],
            max_tokens=1000
    )
    return jsonify({'name': response.choices[0].message.content}), 200
  except Exception as e: 
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__': 
  app.run(debug=True)
