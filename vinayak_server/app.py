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
from flask_cors import CORS
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
CORS(app)
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
    
    # Hardcoded recommendations for each stock
    recommendations = {
        'AAPL': {
            'summary': {
                'recommendation': 'BUY',
                'confidence_score': 0.78,
                'target_price': 234.50,
                'current_price': 219.75,
                'upside_potential': '6.7%',
                'risk_level': 'MODERATE'
            },
            'daily_actions': [
                {
                    'date': '2025-03-03',
                    'action': 'BUY',
                    'entry_price': '218.25-221.00',
                    'target_price': 227.50,
                    'stop_loss': 212.50,
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MARKET OPEN'
                },
                {
                    'date': '2025-03-04',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 229.75,
                    'stop_loss': 215.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-05',
                    'action': 'BUY',
                    'entry_price': '222.00-224.50',
                    'target_price': 232.25,
                    'stop_loss': 217.75,
                    'volume_suggestion': 'HIGH',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'AFTER EARNINGS CALL'
                },
                {
                    'date': '2025-03-06',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 234.50,
                    'stop_loss': 220.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-07',
                    'action': 'TAKE PROFIT',
                    'entry_price': 'N/A',
                    'target_price': 'N/A',
                    'stop_loss': 'N/A',
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'BEFORE MARKET CLOSE'
                }
            ],
            'key_factors': [
                'Strong iPhone 16 demand in Asian markets',
                'Upcoming AR/VR product announcements expected',
                'Services revenue showing 18% YoY growth',
                'Recent pullback creates favorable entry point'
            ]
        },
        'TSLA': {
            'summary': {
                'recommendation': 'HOLD',
                'confidence_score': 0.62,
                'target_price': 195.75,
                'current_price': 182.30,
                'upside_potential': '7.4%',
                'risk_level': 'HIGH'
            },
            'daily_actions': [
                {
                    'date': '2025-03-03',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 186.50,
                    'stop_loss': 175.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-04',
                    'action': 'BUY',
                    'entry_price': '177.50-180.00',
                    'target_price': 190.00,
                    'stop_loss': 172.25,
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'AFTER PRODUCTION REPORT'
                },
                {
                    'date': '2025-03-05',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 192.50,
                    'stop_loss': 176.75,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-06',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 194.00,
                    'stop_loss': 178.50,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-07',
                    'action': 'BUY',
                    'entry_price': '183.00-187.00',
                    'target_price': 195.75,
                    'stop_loss': 180.00,
                    'volume_suggestion': 'HIGH',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MORNING SESSION'
                }
            ],
            'key_factors': [
                'FSD rollout expanding to European markets',
                'Cybertruck production ramping up to 25K units/quarter',
                'Energy storage division growing at 45% YoY',
                'Volatility expected around regulatory announcements'
            ]
        },
        'MSFT': {
            'summary': {
                'recommendation': 'STRONG BUY',
                'confidence_score': 0.85,
                'target_price': 485.00,
                'current_price': 452.25,
                'upside_potential': '7.2%',
                'risk_level': 'LOW'
            },
            'daily_actions': [
                {
                    'date': '2025-03-03',
                    'action': 'BUY',
                    'entry_price': '450.00-455.00',
                    'target_price': 465.00,
                    'stop_loss': 445.50,
                    'volume_suggestion': 'HIGH',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MARKET OPEN'
                },
                {
                    'date': '2025-03-04',
                    'action': 'BUY',
                    'entry_price': '454.00-458.00',
                    'target_price': 470.00,
                    'stop_loss': 448.00,
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MIDDAY'
                },
                {
                    'date': '2025-03-05',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 475.00,
                    'stop_loss': 452.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-06',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 480.00,
                    'stop_loss': 456.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-07',
                    'action': 'TAKE PROFIT',
                    'entry_price': 'N/A',
                    'target_price': 'N/A',
                    'stop_loss': 'N/A',
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MARKET CLOSE'
                }
            ],
            'key_factors': [
                'Azure revenue growth exceeding estimates at 32% YoY',
                'AI integration driving productivity suite adoption',
                'Strategic gaming acquisitions performing above expectations',
                'Cloud infrastructure expansion in APAC region'
            ]
        },
        'AMZN': {
            'summary': {
                'recommendation': 'BUY',
                'confidence_score': 0.76,
                'target_price': 205.00,
                'current_price': 185.40,
                'upside_potential': '10.6%',
                'risk_level': 'MODERATE'
            },
            'daily_actions': [
                {
                    'date': '2025-03-03',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 189.50,
                    'stop_loss': 182.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-04',
                    'action': 'BUY',
                    'entry_price': '183.00-186.00',
                    'target_price': 193.00,
                    'stop_loss': 180.50,
                    'volume_suggestion': 'HIGH',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'EARLY TRADING'
                },
                {
                    'date': '2025-03-05',
                    'action': 'BUY',
                    'entry_price': '186.00-190.00',
                    'target_price': 196.50,
                    'stop_loss': 183.00,
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MIDDAY'
                },
                {
                    'date': '2025-03-06',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 200.00,
                    'stop_loss': 186.50,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-07',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 205.00,
                    'stop_loss': 190.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                }
            ],
            'key_factors': [
                'AWS reaccelerating to 23% growth rate',
                'Prime Day event expected to exceed $12.5B in sales',
                'Advertising segment showing strong momentum',
                'Supply chain optimization reducing fulfillment costs'
            ]
        },
        'GOOGL': {
            'summary': {
                'recommendation': 'BUY',
                'confidence_score': 0.81,
                'target_price': 198.50,
                'current_price': 175.80,
                'upside_potential': '12.9%',
                'risk_level': 'MODERATE'
            },
            'daily_actions': [
                {
                    'date': '2025-03-03',
                    'action': 'BUY',
                    'entry_price': '174.00-177.00',
                    'target_price': 182.00,
                    'stop_loss': 171.50,
                    'volume_suggestion': 'HIGH',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'MARKET OPEN'
                },
                {
                    'date': '2025-03-04',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 185.00,
                    'stop_loss': 174.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-05',
                    'action': 'BUY',
                    'entry_price': '179.00-183.00',
                    'target_price': 190.00,
                    'stop_loss': 176.50,
                    'volume_suggestion': 'MODERATE',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'AFTER PRODUCT ANNOUNCEMENT'
                },
                {
                    'date': '2025-03-06',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 193.50,
                    'stop_loss': 180.00,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                },
                {
                    'date': '2025-03-07',
                    'action': 'HOLD',
                    'entry_price': 'N/A',
                    'target_price': 198.50,
                    'stop_loss': 183.50,
                    'volume_suggestion': 'N/A',
                    'time_frame': 'SHORT-TERM',
                    'optimal_time': 'N/A'
                }
            ],
            'key_factors': [
                'Gemini AI integration driving search engagement',
                'YouTube ad revenue growing at 24% YoY',
                'Cloud segment achieving profitability milestone',
                'Android ecosystem expansion in emerging markets'
            ]
        }
    }
    
    # Return data for requested symbol (or default to AAPL)
    if symbol in recommendations:
        return jsonify(recommendations[symbol])
    else:
        return jsonify(recommendations['AAPL'])

if __name__ == '__main__':
    app.run(debug=True, port=5000)