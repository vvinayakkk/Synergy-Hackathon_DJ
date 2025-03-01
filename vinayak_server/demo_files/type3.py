import pandas as pd
import numpy as np
import streamlit as st
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.neighbors import KNeighborsRegressor
from statsmodels.tsa.arima.model import ARIMA
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping
from newsapi import NewsApiClient
import yfinance as yf
from prophet import Prophet
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.linear_model import LinearRegression
from textblob import TextBlob
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import re

tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)

# Download required NLTK data 
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')
    nltk.download('punkt')


class ComprehensiveTradingScheduler:
    def __init__(self, symbol, historical_data, forecast_horizon=30, confidence_level=0.95):
        """
        Initialize the scheduler with historical data and parameters.
        
        Args:
            symbol (str): Stock symbol (e.g., "AAPL")
            historical_data (pd.DataFrame): Historical stock data from yfinance
            forecast_horizon (int): Number of days to forecast (default: 30)
            confidence_level (float): Confidence level for prediction intervals (default: 0.95)
        """
        self.symbol = symbol
        self.historical_data = historical_data
        self.forecast_horizon = forecast_horizon
        self.confidence_level = confidence_level
        self.current_price = float(historical_data['Close'].iloc[-1]) if not historical_data.empty else None
        self.arima_model = None
        self.forecast = None
        self.conf_int = None

    def train_arima_model(self):
        """Train an ARIMA model on historical closing prices."""
        try:
            # Use pmdarima for auto-ARIMA to find optimal parameters
            from pmdarima import auto_arima
            close_prices = self.historical_data['Close'].dropna()
            if len(close_prices) < 20:
                raise ValueError("Insufficient data for reliable ARIMA forecast (<20 days).")
            
            self.arima_model = auto_arima(
                close_prices,
                start_p=1, start_q=1,
                max_p=5, max_q=5,
                d=1, seasonal=False,
                stepwise=True,
                suppress_warnings=True,
                error_action='ignore',
                max_order=5
            )
            
            # Fit the model
            self.arima_model.fit(close_prices)
            
            # Generate forecast with confidence intervals
            forecast_results = self.arima_model.predict(n_periods=self.forecast_horizon, return_conf_int=True, alpha=1-self.confidence_level)
            self.forecast = forecast_results[0]
            self.conf_int = forecast_results[1]
            
        except Exception as e:
            st.error(f"ARIMA training failed: {str(e)}. Falling back to simple trend.")
            # Fallback to simple linear trend if ARIMA fails
            self.fallback_forecast()

    def fallback_forecast(self):
        """Fallback to a simple linear trend if ARIMA fails."""
        close_prices = self.historical_data['Close'].values
        x = np.arange(len(close_prices)).reshape(-1, 1)
        model = LinearRegression()
        model.fit(x, close_prices)
        
        future_x = np.arange(len(close_prices), len(close_prices) + self.forecast_horizon).reshape(-1, 1)
        self.forecast = model.predict(future_x)
        # Approximate confidence intervals (95% based on historical volatility)
        volatility = np.std(close_prices.pct_change().dropna()) * np.sqrt(252)  # Annualized volatility
        self.conf_int = np.array([
            self.forecast - 1.96 * volatility * self.forecast,
            self.forecast + 1.96 * volatility * self.forecast
        ]).T

    def identify_trading_points(self):
        """Identify optimal buy and sell points based on ARIMA forecast."""
        if self.forecast is None or self.conf_int is None:
            self.train_arima_model()
        
        buy_point = None
        sell_point = None
        buy_price = float('inf')
        sell_price = float('-inf')
        buy_date = None
        sell_date = None
        
        # Generate future dates (business days only)
        last_date = self.historical_data.index[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=self.forecast_horizon, freq='B')
        
        # Look for buy point (local minimum) and sell point (local maximum)
        for i in range(1, len(self.forecast) - 1):
            # Buy point: Price dips below lower confidence and then rises
            if (self.forecast[i] < self.conf_int[i, 0] and self.forecast[i-1] > self.forecast[i] < self.forecast[i+1] and
                self.forecast[i] < buy_price):
                buy_price = self.forecast[i]
                buy_date = future_dates[i]
                buy_point = (buy_date, buy_price)
            
            # Sell point: Price exceeds upper confidence and then falls
            if (self.forecast[i] > self.conf_int[i, 1] and self.forecast[i-1] < self.forecast[i] > self.forecast[i+1] and
                self.forecast[i] > sell_price):
                sell_price = self.forecast[i]
                sell_date = future_dates[i]
                sell_point = (sell_date, sell_price)
        
        # Fallback: If no clear points, use trend direction
        if not buy_point and not sell_point:
            trend = self.forecast[-1] - self.current_price
            if trend > 0:  # Uptrend
                buy_point = (future_dates[0], self.forecast[0])  # Buy at start
                sell_point = (future_dates[-1], self.forecast[-1])  # Sell at end
            else:  # Downtrend
                buy_point = (future_dates[-1], self.forecast[-1])  # Buy at end
                sell_point = (future_dates[0], self.forecast[0])  # Sell at start
        
        return buy_point, sell_point

    def generate_trading_schedule(self):
        """Generate a comprehensive schedule of trading outcomes."""
        if self.forecast is None or self.conf_int is None:
            self.train_arima_model()
        
        buy_point, sell_point = self.identify_trading_points()
        buy_date, buy_price = buy_point
        sell_date, sell_price = sell_point
        
        # Generate future dates
        last_date = self.historical_data.index[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=self.forecast_horizon, freq='B')
        
        # Calculate outcomes
        schedule = []
        position_open = False
        entry_price = None
        max_profit = 0
        max_loss = 0
        
        for i, date in enumerate(future_dates):
            forecast_price = self.forecast[i]
            lower_bound = self.conf_int[i, 0]
            upper_bound = self.conf_int[i, 1]
            
            action = "HOLD"
            profit_loss = 0
            
            if date == buy_date and not position_open:
                action = "BUY"
                entry_price = buy_price
                position_open = True
            elif date == sell_date and position_open:
                action = "SELL"
                profit_loss = (sell_price - entry_price) / entry_price * 100
                position_open = False
            elif position_open:
                profit_loss = (forecast_price - entry_price) / entry_price * 100
                max_profit = max(max_profit, (upper_bound - entry_price) / entry_price * 100)
                max_loss = min(max_loss, (lower_bound - entry_price) / entry_price * 100)
            
            schedule.append({
                'Date': date.strftime('%Y-%m-%d'),
                'Forecast Price': forecast_price,
                'Lower Bound': lower_bound,
                'Upper Bound': upper_bound,
                'Action': action,
                'Profit/Loss (%)': profit_loss if position_open or action == "SELL" else 0,
                'Position': "Open" if position_open else "Closed"
            })
        
        # Summary
        summary = {
            'Buy Date': buy_date.strftime('%Y-%m-%d'),
            'Buy Price': buy_price,
            'Sell Date': sell_date.strftime('%Y-%m-%d'),
            'Sell Price': sell_price,
            'Expected Profit (%)': (sell_price - buy_price) / buy_price * 100,
            'Max Potential Profit (%)': max_profit,
            'Max Potential Loss (%)': max_loss,
            'Confidence Level': self.confidence_level
        }
        
        return schedule, summary

    def get_suggestion(self):
        """Return a concise trading suggestion."""
        schedule, summary = self.generate_trading_schedule()
        suggestion = (
            f"Trading Suggestion for {self.symbol}:\n"
            f"- Buy at ${summary['Buy Price']:.2f} on {summary['Buy Date']}\n"
            f"- Sell at ${summary['Sell Price']:.2f} on {summary['Sell Date']}\n"
            f"- Expected Profit: {summary['Expected Profit (%)']:.2f}% "
            f"(Max Profit: {summary['Max Potential Profit (%)']:.2f}%, "
            f"Max Loss: {summary['Max Potential Loss (%)']:.2f}%)"
        )
        return suggestion, schedule,summary
