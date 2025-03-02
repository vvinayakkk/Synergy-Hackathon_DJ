# Import libraries
from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import datetime
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Function to fetch Indian market data
def get_indian_market_data():
    """
    Fetch NIFTY, SENSEX, top gainers, top losers, and FII/DII data for the Indian market.
    
    Returns:
    dict: Dictionary containing NIFTY, SENSEX, top gainers, top losers, and FII/DII data.
    """
    print("Fetching Indian market data...")
    
    # Define Indian market indices and stocks
    indices = {'^NSEI': 'NIFTY 50', '^BSESN': 'SENSEX'}
    stocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HDFC.NS']  # Example stocks
    
    # Fetch data for the last 5 days
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=5)
    
    # Fetch indices data
    indices_data = yf.download(list(indices.keys()), start=start_date.strftime('%Y-%m-%d'), 
                          end=end_date.strftime('%Y-%m-%d'), auto_adjust=True, progress=False)
    
    # Fetch stock data
    stocks_data = yf.download(stocks, start=start_date.strftime('%Y-%m-%d'), 
                          end=end_date.strftime('%Y-%m-%d'), auto_adjust=True, progress=False)
    
    # Process indices data
    results = {}
    if len(indices_data) > 1:
        last_two_days_indices = indices_data['Close'].iloc[-2:].dropna(axis=1, how='any')
        if len(last_two_days_indices) == 2:
            prev_day = last_two_days_indices.iloc[0]
            last_day = last_two_days_indices.iloc[1]
            indices_returns = ((last_day / prev_day) - 1) * 100
            
            indices_df = pd.DataFrame({
                'Index': [f"{idx} ({indices.get(idx, '')})" for idx in indices_returns.index],
                'Change (%)': indices_returns.values.round(2)
            })
            results['indices'] = indices_df.to_dict('records')
        else:
            results['indices'] = []
    else:
        results['indices'] = []
    
    # Process stock data for top gainers and losers
    if len(stocks_data) > 1:
        last_two_days_stocks = stocks_data['Close'].iloc[-2:].dropna(axis=1, how='any')
        if len(last_two_days_stocks) == 2:
            prev_day = last_two_days_stocks.iloc[0]
            last_day = last_two_days_stocks.iloc[1]
            daily_returns = ((last_day / prev_day) - 1) * 100
            daily_returns = daily_returns.replace([np.inf, -np.inf], np.nan).dropna()
            
            if len(daily_returns) > 0:
                top_gainers = daily_returns.nlargest(5).reset_index()
                top_gainers.columns = ['Ticker', 'Change (%)']
                top_gainers['Change (%)'] = top_gainers['Change (%)'].round(2)
                
                top_losers = daily_returns.nsmallest(5).reset_index()
                top_losers.columns = ['Ticker', 'Change (%)']
                top_losers['Change (%)'] = top_losers['Change (%)'].round(2)
                
                results['top_gainers'] = top_gainers.to_dict('records')
                results['top_losers'] = top_losers.to_dict('records')
            else:
                results['top_gainers'] = []
                results['top_losers'] = []
        else:
            results['top_gainers'] = []
            results['top_losers'] = []
    else:
        results['top_gainers'] = []
        results['top_losers'] = []
    
    # Mock FII/DII data (since Yahoo Finance does not provide this)
    results['fii_dii_data'] = [
        {'date': 'Feb 28, 2025', 'fiiBuy': 39239.44, 'fiiSell': 50878.46, 'fiiNet': -11639.02, 'diiBuy': 28065.55, 'diiSell': 15756.92, 'diiNet': 12308.63},
        {'date': 'Feb 27, 2025', 'fiiBuy': 19055.23, 'fiiSell': 19611.79, 'fiiNet': -556.56, 'diiBuy': 13530.17, 'diiSell': 11803.06, 'diiNet': 1727.11},
        {'date': 'Feb 25, 2025', 'fiiBuy': 12500.37, 'fiiSell': 16029.47, 'fiiNet': -3529.10, 'diiBuy': 11278.09, 'diiSell': 8247.31, 'diiNet': 3030.78},
        {'date': 'Feb 24, 2025', 'fiiBuy': 7905.53, 'fiiSell': 14192.23, 'fiiNet': -6286.70, 'diiBuy': 12552.14, 'diiSell': 7366.49, 'diiNet': 5185.65},
        {'date': 'Feb 21, 2025', 'fiiBuy': 10144.33, 'fiiSell': 13593.48, 'fiiNet': -3449.15, 'diiBuy': 12889.44, 'diiSell': 10004.83, 'diiNet': 2884.61},
    ]
    
    return results

# API endpoint to fetch Indian market data
@app.route('/api/indian-market-data', methods=['GET'])
def indian_market_data():
    data = get_indian_market_data()
    return jsonify(data)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6002)