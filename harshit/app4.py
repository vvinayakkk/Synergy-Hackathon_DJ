from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import datetime
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GOOGLE_API_KEY = 'AIzaSyAkMx2otqG0OvazUsg2rcVq3hntbAqrUD8'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/nifty-chart-data', methods=['GET'])
def nifty_chart_data():
    try:
        # Prompt for Gemini to get NIFTY data
        prompt = """
        Generate NIFTY 50 daily closing price data for the last 12 months in JSON format.
        Include date and value for each entry.
        Format the response as: [{"date": "MMM 'YY", "value": XXXX.XX}, ...]
        Make the data realistic and consistent with NIFTY's historical range (17000-20000).
        """

        # Get response from Gemini
        response = model.generate_content(prompt)
        data_str = response.text
        
        # Extract JSON data from the response
        try:
            # Find the JSON array in the response
            start_idx = data_str.find('[')
            end_idx = data_str.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = data_str[start_idx:end_idx]
                chart_data = json.loads(json_str)
            else:
                raise ValueError("No JSON array found in response")
        except Exception as json_err:
            print(f"Error parsing JSON: {json_err}")
            print("Raw response:", data_str)
            raise

        print("\nFormatted chart data:")
        print(chart_data[:5])
        
        return jsonify(chart_data)
    except Exception as e:
        print(f"Error fetching NIFTY chart data: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Failed to fetch NIFTY chart data"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6004)
