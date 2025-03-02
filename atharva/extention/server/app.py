from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask_cors import CORS  # To handle CORS for browser requests

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the extension

# Load the model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("fuchenru/Trading-Hero-LLM")
model = AutoModelForSequenceClassification.from_pretrained("fuchenru/Trading-Hero-LLM")

# Preprocess function
def preprocess(text, max_length=128):
    inputs = tokenizer(text, truncation=True, padding='max_length', max_length=max_length, return_tensors='pt')
    return inputs

# Prediction function
def predict_sentiment(input_text):
    inputs = preprocess(input_text)
    with torch.no_grad():
        outputs = model(**inputs)
    predicted_label = torch.argmax(outputs.logits, dim=1).item()
    label_map = {0: 'neutral', 1: 'positive', 2: 'negative'}
    return label_map[predicted_label]

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        sentiment = predict_sentiment(text)
        print(sentiment)
        return jsonify({'sentiment': sentiment})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)