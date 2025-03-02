from flask import Flask, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
import datetime

# Initialize Flask app
app = Flask(__name__)

# Define symbols and financial hubs
SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN']
FINANCIAL_HUBS = {
    'New York': (40.7128, -74.0060),
    'London': (51.5074, -0.1278),
    'Tokyo': (35.6762, 139.6503),
    'Hong Kong': (22.3193, 114.1694),
    'Mumbai': (19.0760, 72.8777),
    'Sydney': (-33.8688, 151.2093)
}

# Fetch historical stock data
def fetch_stock_data(symbols, days=30):
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=days)
    
    data = yf.download(symbols, start=start_date.strftime('%Y-%m-%d'), 
                       end=end_date.strftime('%Y-%m-%d'), group_by='ticker')
    
    stock_data = []
    for symbol in symbols:
        if symbol in data:
            stock_data.append({
                'symbol': symbol,
                'data': data[symbol]['Close'].reset_index().rename(columns={'Date': 'date', 'Close': symbol}).to_dict('records')
            })
    return stock_data

# Fetch market sentiment (mock data)
def fetch_market_sentiment():
    return {
        'market_cap': 98.7,
        'sentiment': 76.3,
        'prediction': 89.2,
        'signals': 42
    }

# Fetch global market activity (mock data)
def fetch_global_market_activity():
    activity = []
    for city, (lat, lng) in FINANCIAL_HUBS.items():
        activity.append({
            'city': city,
            'lat': lat,
            'lng': lng,
            'activity': np.random.randint(50, 100)  # Random activity score
        })
    return activity

# Fetch news headlines (mock data)
def fetch_news_headlines():
    return [
        {'title': 'Stock Market Hits All-Time High', 'source': 'Bloomberg', 'impact': 'high'},
        {'title': 'Tech Stocks Rally on Strong Earnings', 'source': 'CNBC', 'impact': 'medium'},
        {'title': 'Global Markets React to Fed Announcement', 'source': 'Reuters', 'impact': 'low'}
    ]

# Fetch technical indicators (mock data)
def fetch_technical_indicators(symbol):
    return {
        'symbol': symbol,
        'rsi': np.random.randint(30, 70),
        'macd': np.random.uniform(-1, 1),
        'sma': np.random.uniform(100, 200)
    }

# Main function to fetch all data
def fetch_all_data():
    stock_data = fetch_stock_data(SYMBOLS)
    market_sentiment = fetch_market_sentiment()
    global_market_activity = fetch_global_market_activity()
    news_headlines = fetch_news_headlines()
    technical_indicators = {symbol: fetch_technical_indicators(symbol) for symbol in SYMBOLS}
    
    return {
        'stock_data': stock_data,
        'market_sentiment': market_sentiment,
        'global_market_activity': global_market_activity,
        'news_headlines': news_headlines,
        'technical_indicators': technical_indicators
    }

# Endpoint to fetch all data
@app.route('/api/data', methods=['GET'])
def get_all_data():
    data = fetch_all_data()
    return jsonify(data)

# Endpoint to fetch stock data
@app.route('/api/stock-data', methods=['GET'])
def get_stock_data():
    stock_data = fetch_stock_data(SYMBOLS)
    return jsonify(stock_data)

# Endpoint to fetch market sentiment
@app.route('/api/market-sentiment', methods=['GET'])
def get_market_sentiment():
    market_sentiment = fetch_market_sentiment()
    return jsonify(market_sentiment)

# Endpoint to fetch global market activity
@app.route('/api/global-market-activity', methods=['GET'])
def get_global_market_activity():
    global_market_activity = fetch_global_market_activity()
    return jsonify(global_market_activity)

# Endpoint to fetch news headlines
@app.route('/api/news-headlines', methods=['GET'])
def get_news_headlines():
    news_headlines = fetch_news_headlines()
    return jsonify(news_headlines)

# Endpoint to fetch technical indicators
@app.route('/api/technical-indicators', methods=['GET'])
def get_technical_indicators():
    technical_indicators = {symbol: fetch_technical_indicators(symbol) for symbol in SYMBOLS}
    return jsonify(technical_indicators)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True,port=6003)