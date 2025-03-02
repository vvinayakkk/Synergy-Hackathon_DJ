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

# Function to fetch stock market data
def get_stock_market_data(num_stocks=10):
    """
    Fetch top gainers, losers, most active stocks, and market indices.
    """
    print("Fetching stock market data...")
    
    # Get S&P 500 components
    try:
        sp500 = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0]
        tickers = sp500['Symbol'].tolist()
        tickers = [ticker.replace(".", "-") for ticker in tickers if not (ticker == "BF.B" or ticker == "BRK.B")]
        tickers.extend(["BRK-B", "BF-B"])
    except Exception as e:
        print(f"Error fetching S&P 500 list: {e}")
        tickers = ["AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "NVDA", "JPM", "V", "JNJ"]
        
    # Add major indices
    indices = ['^GSPC', '^DJI', '^IXIC', '^RUT']
    
    # Fetch data
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=5)
    
    print(f"Downloading data for {len(tickers)} stocks...")
    data = yf.download(tickers, start=start_date.strftime('%Y-%m-%d'), 
                      end=end_date.strftime('%Y-%m-%d'), auto_adjust=True, progress=False)
    
    results = {}
    if len(data) > 1:
        last_two_days = data['Close'].iloc[-2:].dropna(axis=1, how='any')
        if len(last_two_days) == 2:
            prev_day = last_two_days.iloc[0]
            last_day = last_two_days.iloc[1]
            daily_returns = ((last_day / prev_day) - 1) * 100
            daily_returns = daily_returns.replace([np.inf, -np.inf], np.nan).dropna()
            
            if len(daily_returns) > 0:
                top_gainers = daily_returns.nlargest(min(num_stocks, len(daily_returns))).reset_index()
                top_gainers.columns = ['Ticker', 'Change (%)']
                top_gainers['Change (%)'] = top_gainers['Change (%)'].round(2)
                
                top_losers = daily_returns.nsmallest(min(num_stocks, len(daily_returns))).reset_index()
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
    
    # Most active stocks
    if 'Volume' in data.columns:
        last_day_volume = data['Volume'].iloc[-1].dropna()
        if len(last_day_volume) > 0:
            most_active = last_day_volume.nlargest(min(num_stocks, len(last_day_volume))).reset_index()
            most_active.columns = ['Ticker', 'Volume']
            results['most_active'] = most_active.to_dict('records')
        else:
            results['most_active'] = []
    else:
        results['most_active'] = []
    
    # Market indices
    indices_data = yf.download(indices, start=start_date.strftime('%Y-%m-%d'), 
                               end=end_date.strftime('%Y-%m-%d'), auto_adjust=True, progress=False)
    
    if len(indices_data) > 1:
        last_two_days_indices = indices_data['Close'].iloc[-2:].dropna(axis=1, how='any')
        if len(last_two_days_indices) == 2:
            prev_day = last_two_days_indices.iloc[0]
            last_day = last_two_days_indices.iloc[1]
            indices_returns = ((last_day / prev_day) - 1) * 100
            
            index_names = {
                '^GSPC': 'S&P 500',
                '^DJI': 'Dow Jones',
                '^IXIC': 'NASDAQ',
                '^RUT': 'Russell 2000'
            }
            
            indices_df = pd.DataFrame({
                'Index': [f"{idx} ({index_names.get(idx, '')})" for idx in indices_returns.index],
                'Change (%)': indices_returns.values.round(2)
            })
            results['indices'] = indices_df.to_dict('records')
        else:
            results['indices'] = []
    else:
        results['indices'] = []
    
    return results

# API endpoint to fetch stock market data
@app.route('/api/stock-market-data', methods=['GET'])
def stock_market_data():
    num_stocks = request.args.get('num_stocks', default=10, type=int)
    data = get_stock_market_data(num_stocks)
    return jsonify(data)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6001)