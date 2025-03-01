from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
from newsapi import NewsApiClient
from prophet import Prophet
import re
import sys
import os

# Add the atharva_test directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from vinayak_server.demo_files.type1 import MultiAlgorithmStockPredictor
from vinayak_server.demo_files.type1  import fetch_stock_data, get_news_headlines, get_current_price
from vinayak_server.demo_files.type1  import analyze_sentiment, calculate_technical_indicators_for_summary
from vinayak_server.demo_files.type2  import GoverningAIModel
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
from vinayak_server.demo_files.type1 import forecast_with_prophet

app = Flask(__name__)

# API setup
NEWS_API_KEY = '0de37ca8af9748898518daf699189abf'
newsapi = NewsApiClient(api_key=NEWS_API_KEY)

WEIGHT_CONFIGURATIONS = {
    "Default": {
        'LSTM': 0.3,
        'XGBoost': 0.15,
        'Random Forest': 0.15,
        'ARIMA': 0.1,
        'SVR': 0.1,
        'GBM': 0.1,
        'KNN': 0.1
    },
    "Trend-Focused": {
        'LSTM': 0.35,
        'XGBoost': 0.20,
        'Random Forest': 0.15,
        'ARIMA': 0.10,
        'SVR': 0.08,
        'GBM': 0.07,
        'KNN': 0.05
    },
    "Statistical": {
        'LSTM': 0.20,
        'XGBoost': 0.15,
        'Random Forest': 0.15,
        'ARIMA': 0.20,
        'SVR': 0.15,
        'GBM': 0.10,
        'KNN': 0.05
    },
    "Tree-Ensemble": {
        'LSTM': 0.25,
        'XGBoost': 0.25,
        'Random Forest': 0.20,
        'ARIMA': 0.10,
        'SVR': 0.08,
        'GBM': 0.07,
        'KNN': 0.05
    },
    "Balanced": {
        'LSTM': 0.25,
        'XGBoost': 0.20,
        'Random Forest': 0.15,
        'ARIMA': 0.15,
        'SVR': 0.10,
        'GBM': 0.10,
        'KNN': 0.05
    },
    "Volatility-Focused": {
        'LSTM': 0.30,
        'XGBoost': 0.25,
        'Random Forest': 0.20,
        'ARIMA': 0.05,
        'SVR': 0.10,
        'GBM': 0.07,
        'KNN': 0.03
    }
}
@app.route('/api/stock_data', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', 'AAPL')
    display_days = int(request.args.get('display_days', 600))
    
    try:
        df = fetch_stock_data(symbol, display_days)
        current_price_data = get_current_price(symbol)
        
        # Prepare historical data
        df_json = df.to_json(date_format='iso')
        
        # Prepare current price
        if (current_price_data and 'price' in current_price_data):
            current_price = {
                'price': current_price_data['price'],
                'last_updated': current_price_data['last_updated'],
                'is_live': current_price_data['is_live']
            }
        else:
            current_price = {
                'price': float(df['Close'].iloc[-1]),
                'last_updated': df.index[-1].strftime('%Y-%m-%d'),
                'is_live': False
            }
        
        return jsonify({
            'historical_data': json.loads(df_json),
            'current_price': current_price
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    try:
        # Get request parameters
        symbol = request.args.get('symbol', 'AAPL')
        display_days = int(request.args.get('display_days', 600))
        forecast_days = int(request.args.get('forecast_days', 30))
        
        print(f"Processing forecast request for symbol: {symbol}, display_days: {display_days}, forecast_days: {forecast_days}")
        
        # Fetch stock data
        df = fetch_stock_data(symbol, display_days)
        
        # Check if df is valid and has data
        if df is None or df.empty:
            return jsonify({"error": "No data available for the specified symbol"}), 404
        
        # Debug: print DataFrame structure
        print(f"DataFrame columns: {df.columns}")
        print(f"DataFrame head: {df.head()}")
        
        # Handle MultiIndex columns - extract just the Close price for the symbol
        # Since the data has MultiIndex columns with ('Close', symbol) format
        close_col = ('Close', symbol)
        if close_col in df.columns:
            # Create a new DataFrame with just Date and Close price
            forecast_df = pd.DataFrame()
            forecast_df['ds'] = df.index.to_numpy()  # Convert index to datetime column
            forecast_df['y'] = df[close_col].values  # Extract just the Close price values
        else:
            return jsonify({"error": f"Cannot find Close price data for {symbol}"}), 500
        
        # Ensure 'y' column is numeric (should be fine now as we extracted values directly)
        forecast_df['y'] = pd.to_numeric(forecast_df['y'], errors='coerce')
        
        # Drop NaN values
        forecast_df = forecast_df.dropna(subset=['ds', 'y'])
        
        # Ensure we have enough data
        if len(forecast_df) < 30:  # Minimum data points for reasonable Prophet model
            return jsonify({"error": "Not enough historical data available"}), 400
            
        # Fit Prophet model
        model = Prophet()
        model.fit(forecast_df)
        
        # Create future dataframe for prediction
        future_dates = pd.date_range(
            start=forecast_df['ds'].iloc[-1] + pd.Timedelta(days=1),
            periods=forecast_days,
            freq='D'
        )
        future = pd.DataFrame({'ds': future_dates})
        
        # Make prediction
        forecast = model.predict(future)
        
        # Create response with both historical and forecast data
        response = {
            "historical": json.loads(forecast_df.to_json(orient='records', date_format='iso')),
            "forecast": json.loads(forecast.to_json(orient='records', date_format='iso'))
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"Error in forecast API: {error_msg}")
        return jsonify({"error": str(e), "trace": error_msg}), 500

@app.route('/api/predictions', methods=['POST'])
def get_predictions():
    print("hello")
    data = request.get_json()
    symbol = data.get('symbol', 'AAPL')
    weights = data.get('weights', WEIGHT_CONFIGURATIONS['Default'])
    
    predictor = MultiAlgorithmStockPredictor(symbol, weights=weights)
    results = predictor.predict_with_all_models(prediction_days=30)
    
    return jsonify(results)

@app.route('/api/news', methods=['GET'])
def get_news():
    symbol = request.args.get('symbol', 'AAPL')
    headlines = get_news_headlines(symbol)
    sentiment_data = []
    
    for title, description, url in headlines:
        title_analysis = analyze_sentiment(str(title) if title else "")
        desc_analysis = analyze_sentiment(str(description) if description else "")
        combined_score = title_analysis['score'] * 0.6 + desc_analysis['score'] * 0.4
        sentiment_data.append({
            'title': title,
            'description': description,
            'url': url,
            'sentiment_score': combined_score
        })
    
    return jsonify(sentiment_data)

@app.route('/api/technical_analysis', methods=['GET'])
def get_technical_analysis():
    symbol = request.args.get('symbol', 'AAPL')
    display_days = int(request.args.get('display_days', 600))
    
    df = fetch_stock_data(symbol, display_days)
    analysis_df = calculate_technical_indicators_for_summary(df)
    return jsonify(json.loads(analysis_df.tail(2).to_json(date_format='iso')))



@app.route('/api/recommendation', methods=['GET'])
def get_recommendation():
    symbol = request.args.get('symbol', 'AAPL')
    display_days = int(request.args.get('display_days', 600))
    
    try:
        # Fetch historical data
        historical_data = fetch_stock_data(symbol, display_days)
        
        # Fetch Prophet forecast
        prophet_forecast = forecast_with_prophet(historical_data, forecast_days=30)
        
        # Fetch multi-model results
        predictor = MultiAlgorithmStockPredictor(symbol, weights=WEIGHT_CONFIGURATIONS['Default'])
        multi_model_results = predictor.predict_with_all_models(prediction_days=30)
        
        # Fetch news sentiment
        headlines = get_news_headlines(symbol)
        news_sentiment = []
        for title, description, url in headlines:
            title_analysis = analyze_sentiment(str(title) if title else "")
            desc_analysis = analyze_sentiment(str(description) if description else "")
            combined_score = title_analysis['score'] * 0.6 + desc_analysis['score'] * 0.4
            news_sentiment.append((combined_score, title, description, url))
        
        # Fetch technical analysis
        technical_analysis = calculate_technical_indicators_for_summary(historical_data)
        
        # Initialize GoverningAIModel
        governing_model = GoverningAIModel(
            symbol=symbol,
            historical_data=historical_data,
            prophet_forecast=prophet_forecast,
            multi_model_results=multi_model_results,
            news_sentiment=news_sentiment,
            technical_analysis=technical_analysis
        )
        
        # Generate recommendation
        recommendation = governing_model.generate_recommendation()
        
        return jsonify(recommendation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003)