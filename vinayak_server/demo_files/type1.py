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

NEWS_API_KEY = '0de37ca8af9748898518daf699189abf'
newsapi = NewsApiClient(api_key=NEWS_API_KEY)

@st.cache_data(ttl=3600)
def fetch_stock_data(symbol, days):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    df = yf.download(symbol, start=start_date, end=end_date)
    return df


@st.cache_data(ttl=3600)
def get_news_headlines(symbol):
    try:
        news = newsapi.get_everything(
            q=symbol,
            language='en',
            sort_by='relevancy',
            page_size=5
        )
        return [(article['title'], article['description'], article['url']) 
                for article in news['articles']]
    except Exception as e:
        print(f"News API error: {str(e)}")
        return []
    

@st.cache_data(ttl=300)  
def get_current_price(symbol):
    """Fetch the current live price of a stock"""
    try:
        ticker = yf.Ticker(symbol)
        todays_data = ticker.history(period='1d')
        
        if todays_data.empty:
            return None
            
        # If market is open, we can get the current price
        if 'Open' in todays_data.columns and len(todays_data) > 0:
            # For market hours, use current price if available
            if 'regularMarketPrice' in ticker.info:
                current_price = ticker.info['regularMarketPrice']
                is_live = True
            else:
                # Fallback to the most recent close
                current_price = float(todays_data['Close'].iloc[-1])
                is_live = False
            
            # Get last update time
            last_updated = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            return {
                "price": current_price,
                "is_live": is_live,
                "last_updated": last_updated
            }
        return None
    except Exception as e:
        st.error(f"Error fetching current price: {str(e)}")
        return None
    

@st.cache_data(ttl=3600)
def analyze_sentiment(text):
    """
    Analyze sentiment using both VADER and TextBlob, with financial context
    """
    # Check if text is None or empty
    if not text or not isinstance(text, str):
        return {
            'sentiment': "⚖️ Neutral",
            'confidence': 0,
            'color': "gray",
            'score': 0
        }
        
    # Clean the text
    text = re.sub(r'[^\w\s]', '', text)
    
    # VADER analysis
    sia = SentimentIntensityAnalyzer()
    vader_scores = sia.polarity_scores(text)
    
    # TextBlob analysis
    blob = TextBlob(text)
    textblob_polarity = blob.sentiment.polarity
    
    # Enhanced financial context keywords with weights
    financial_pos = {
        'strong': 1.2,
        'climbed': 1.3,
        'up': 1.1,
        'higher': 1.1,
        'beat': 1.2,
        'exceeded': 1.2,
        'growth': 1.1,
        'profit': 1.1,
        'gain': 1.1,
        'positive': 1.1,
        'bullish': 1.3,
        'outperform': 1.2,
        'buy': 1.1,
        'upgrade': 1.2,
        'recovers': 1.3,
        'rose': 1.3,
        'closed higher': 1.4
    }
    
    financial_neg = {
        'weak': 1.2,
        'fell': 1.3,
        'down': 1.1,
        'lower': 1.1,
        'miss': 1.2,
        'missed': 1.2,
        'decline': 1.1,
        'loss': 1.1,
        'negative': 1.1,
        'bearish': 1.3,
        'underperform': 1.2,
        'sell': 1.1,
        'downgrade': 1.2,
        'sell-off': 1.4,
        'rattled': 1.3,
        'correction': 1.3,
        'crossed below': 1.4,
        'pain': 1.3
    }
    
    # Add financial context with weighted scoring
    financial_score = 0
    words = text.lower().split()
    
    # Look for percentage changes with context
    percent_pattern = r'(\d+(?:\.\d+)?)\s*%'
    percentages = re.findall(percent_pattern, text)
    for pct in percentages:
        if any(term in text.lower() for term in ["rose", "up", "climb", "gain", "higher"]):
            financial_score += float(pct) * 0.15
        elif any(term in text.lower() for term in ["down", "fall", "drop", "lower", "decline"]):
            financial_score -= float(pct) * 0.15
    
    # Look for technical indicators
    if "moving average" in text.lower():
        if "crossed below" in text.lower() or "below" in text.lower():
            financial_score -= 1.2
        elif "crossed above" in text.lower() or "above" in text.lower():
            financial_score += 1.2
    
    # Look for market action terms
    if "sell-off" in text.lower() or "selloff" in text.lower():
        financial_score -= 1.3
    if "recovery" in text.lower() or "recovers" in text.lower():
        financial_score += 1.3
    
    # Calculate weighted keyword scores
    pos_score = sum(financial_pos.get(word, 0) for word in words)
    neg_score = sum(financial_neg.get(word, 0) for word in words)
    
    if pos_score or neg_score:
        financial_score += (pos_score - neg_score) / (pos_score + neg_score)
    
    # Combine scores with adjusted weights
    combined_score = (
        vader_scores['compound'] * 0.3 +     # VADER
        textblob_polarity * 0.2 +            # TextBlob
        financial_score * 0.5                 # Enhanced financial context (increased weight)
    )
    
    # Adjust thresholds and confidence calculation
    if combined_score >= 0.15:
        sentiment = "📈 Positive"
        confidence = min(abs(combined_score) * 150, 100)  # Increased multiplier
        color = "green"
    elif combined_score <= -0.15:
        sentiment = "📉 Negative"
        confidence = min(abs(combined_score) * 150, 100)
        color = "red"
    else:
        sentiment = "⚖️ Neutral"
        confidence = (1 - abs(combined_score)) * 100
        color = "gray"
        
    return {
        'sentiment': sentiment,
        'confidence': confidence,
        'color': color,
        'score': combined_score
    }



# Completely revise the Prophet forecast function
@st.cache_data(ttl=3600)
def forecast_with_prophet(df, forecast_days=30):
    try:
        # Check if we have enough data points
        if len(df) < 30:
            st.warning("Not enough historical data for reliable forecasting (< 30 data points)")
            return simple_forecast_fallback(df, forecast_days)
            
        # Make a copy to avoid modifying the original dataframe
        df_copy = df.copy()
        
        # Check for MultiIndex columns and handle appropriately
        has_multiindex = isinstance(df_copy.columns, pd.MultiIndex)
        
        # Reset index to make Date a column
        df_copy = df_copy.reset_index()
        
        # Find the date column
        date_col = None
        for col in df_copy.columns:
            # Handle both string and tuple column names
            col_str = col if isinstance(col, str) else col[0]
            if isinstance(col_str, str) and col_str.lower() in ['date', 'datetime', 'time', 'index']:
                date_col = col
                break
        
        if date_col is None:
            st.warning("No date column found - using simple forecast")
            return simple_forecast_fallback(df, forecast_days)
        
        # Prepare data for Prophet with careful handling of column types
        prophet_df = pd.DataFrame()
        
        # Extract the date and price columns safely
        date_values = df_copy[date_col]
        
        # For Close column, check if we're dealing with a MultiIndex
        if has_multiindex:
            # If MultiIndex, find the column with 'Close' as first element
            close_col = None
            for col in df_copy.columns:
                if isinstance(col, tuple) and col[0] == 'Close':
                    close_col = col
                    break
            
            if close_col is None:
                st.warning("No Close column found - using simple forecast")
                return simple_forecast_fallback(df, forecast_days)
            
            close_values = df_copy[close_col]
        else:
            # Standard columns
            close_values = df_copy['Close']
            
        # Assign to prophet dataframe
        prophet_df['ds'] = pd.to_datetime(date_values)
        prophet_df['y'] = close_values.astype(float)
        
        # Add additional features for regressors - even more comprehensive
        # Add volume as a regressor if available
        has_volume_regressor = False
        if 'Volume' in df_copy.columns:
            prophet_df['volume'] = df_copy['Volume'].astype(float)
            prophet_df['log_volume'] = np.log1p(prophet_df['volume'])  # log transform to handle skewness
            # Add volume momentum (rate of change)
            prophet_df['volume_roc'] = prophet_df['volume'].pct_change(periods=5).fillna(0)
            has_volume_regressor = True
        
        # Add price-based features
        # Volatility at different time windows
        prophet_df['volatility_5d'] = prophet_df['y'].rolling(window=5).std().fillna(0)
        prophet_df['volatility_10d'] = prophet_df['y'].rolling(window=10).std().fillna(0)
        prophet_df['volatility_20d'] = prophet_df['y'].rolling(window=20).std().fillna(0)
        
        # Relative strength indicator (simplified) 
        delta = prophet_df['y'].diff()
        gain = delta.mask(delta < 0, 0).rolling(window=14).mean()
        loss = -delta.mask(delta > 0, 0).rolling(window=14).mean()
        rs = gain / loss
        prophet_df['rsi'] = 100 - (100 / (1 + rs)).fillna(50)
        
        # Price momentum
        prophet_df['momentum_5d'] = prophet_df['y'].pct_change(periods=5).fillna(0)
        prophet_df['momentum_10d'] = prophet_df['y'].pct_change(periods=10).fillna(0)
        
        # Distance from moving averages
        prophet_df['ma10'] = prophet_df['y'].rolling(window=10).mean().fillna(method='bfill')
        prophet_df['ma20'] = prophet_df['y'].rolling(window=20).mean().fillna(method='bfill')
        prophet_df['ma10_dist'] = (prophet_df['y'] / prophet_df['ma10'] - 1)
        prophet_df['ma20_dist'] = (prophet_df['y'] / prophet_df['ma20'] - 1)
        
        # Bollinger band position
        bb_std = prophet_df['y'].rolling(window=20).std().fillna(0)
        prophet_df['bb_position'] = (prophet_df['y'] - prophet_df['ma20']) / (2 * bb_std + 1e-10)  # Avoid division by zero
        
        # Handle outliers by winsorizing extreme values
        # Helps with improving forecast accuracy by removing noise
        for col in prophet_df.columns:
            if col != 'ds' and prophet_df[col].dtype.kind in 'fc':  # if column is float or complex
                q1 = prophet_df[col].quantile(0.01)
                q3 = prophet_df[col].quantile(0.99)
                prophet_df[col] = prophet_df[col].clip(q1, q3)
        
        # Drop any NaN values
        prophet_df = prophet_df.dropna()
        
        # Determine appropriate seasonality based on data size
        daily_seasonality = len(prophet_df) > 90  # Only use daily seasonality with enough data
        weekly_seasonality = False  # Explicitly disable weekly seasonality for stocks
        yearly_seasonality = len(prophet_df) > 365
        
        # Adaptive parameter selection based on volatility
        recent_volatility = prophet_df['volatility_20d'].mean()
        avg_price = prophet_df['y'].mean()
        rel_volatility = recent_volatility / avg_price
        
        # Adjust changepoint_prior_scale based on volatility
        # Higher volatility -> more flexibility
        cp_prior_scale = min(0.05 + rel_volatility * 0.5, 0.5)  
        
        # Create and fit the model with optimized parameters
        model = Prophet(
            daily_seasonality=daily_seasonality,
            weekly_seasonality=weekly_seasonality,  # Disabled to prevent weekend spikes
            yearly_seasonality=yearly_seasonality,
            changepoint_prior_scale=cp_prior_scale,  # Adaptive to volatility
            seasonality_prior_scale=10.0,  # Increased to capture market seasonality better
            seasonality_mode='multiplicative',  # Better for stock data that tends to have proportional changes
            changepoint_range=0.95,  # Look at more recent changepoints for stocks
            interval_width=0.9  # 90% confidence interval
        )
        
        # Add US stock market holidays
        model.add_country_holidays(country_name='US')
        
        # Add custom regressors
        if has_volume_regressor:
            model.add_regressor('log_volume', mode='multiplicative')
            model.add_regressor('volume_roc', mode='additive')
            
        # Add technical indicators as regressors
        model.add_regressor('volatility_5d', mode='multiplicative')
        model.add_regressor('volatility_20d', mode='multiplicative')
        model.add_regressor('rsi', mode='additive')
        model.add_regressor('momentum_5d', mode='additive')
        model.add_regressor('momentum_10d', mode='additive')
        model.add_regressor('ma10_dist', mode='additive')
        model.add_regressor('ma20_dist', mode='additive')
        model.add_regressor('bb_position', mode='additive')
        
        # Add custom seasonality for common stock patterns
        if len(prophet_df) > 60:  # Only with enough data
            model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
            model.add_seasonality(name='quarterly', period=91.25, fourier_order=5)
            
        # Add beginning/end of month effects (common in stocks)
        if len(prophet_df) > 40:
            prophet_df['month_start'] = (prophet_df['ds'].dt.day <= 3).astype(int)
            prophet_df['month_end'] = (prophet_df['ds'].dt.day >= 28).astype(int)
            model.add_regressor('month_start', mode='additive')
            model.add_regressor('month_end', mode='additive')
        
        # For stocks with enough data, add quarterly earnings effect
        if len(prophet_df) > 250:
            # Approximate earnings seasonality (rough quarterly pattern)
            prophet_df['earnings_season'] = ((prophet_df['ds'].dt.month % 3 == 0) & 
                                           (prophet_df['ds'].dt.day >= 15) & 
                                           (prophet_df['ds'].dt.day <= 30)).astype(int)
        
        # Fit the model
        model.fit(prophet_df)
        
        # Create future dataframe for prediction using business days only
        # This is critical to avoid weekend predictions for stock markets
        last_date = prophet_df['ds'].max()
        # Use business day frequency (weekdays only)
        future_dates = pd.date_range(
            start=last_date + pd.Timedelta(days=1), 
            periods=forecast_days * 1.4,  # Add extra days to account for weekends
            freq='B'  # Business day frequency - weekdays only
        )[:forecast_days]  # Limit to requested forecast days
        
        # Create the future dataframe with correct dates
        future = pd.DataFrame({'ds': future_dates})
        
        # Add regressor values to future dataframe
        # Copy the last rows of data for future predictions
        last_values = prophet_df.iloc[-1].copy()
        future_start_idx = len(prophet_df)
        
        # Add volume regressors to future dataframe
        if has_volume_regressor:
            # For volume, use median of last 30 days as future values
            median_volume = prophet_df['volume'].tail(30).median()
            future['volume'] = median_volume
            future['log_volume'] = np.log1p(future['volume'])
            
            # For volume_roc, use last 5-day average
            future['volume_roc'] = prophet_df['volume_roc'].tail(5).mean()
        
        # Add technical indicators to future dataframe
        # Use recent averages for future values
        future['volatility_5d'] = prophet_df['volatility_5d'].tail(10).mean()
        future['volatility_20d'] = prophet_df['volatility_20d'].tail(10).mean()
        future['rsi'] = prophet_df['rsi'].tail(5).mean()
        future['momentum_5d'] = prophet_df['momentum_5d'].tail(5).mean()
        future['momentum_10d'] = prophet_df['momentum_10d'].tail(5).mean()
        future['ma10_dist'] = prophet_df['ma10_dist'].tail(5).mean()
        future['ma20_dist'] = prophet_df['ma20_dist'].tail(5).mean()
        future['bb_position'] = prophet_df['bb_position'].tail(5).mean()
        
        # Add month start/end flags if we calculated them
        if 'month_start' in prophet_df.columns:
            future['month_start'] = (future['ds'].dt.day <= 3).astype(int)
            future['month_end'] = (future['ds'].dt.day >= 28).astype(int)
            
        # Add earnings season flags if we calculated them
        if 'earnings_season' in prophet_df.columns:
            future['earnings_season'] = ((future['ds'].dt.month % 3 == 0) & 
                                        (future['ds'].dt.day >= 15) & 
                                        (future['ds'].dt.day <= 30)).astype(int)
        
        # Make predictions
        forecast = model.predict(future)
        
        # Post-processing for improved accuracy:
        # 1. Ensure forecasts don't go negative for stock prices
        forecast['yhat'] = np.maximum(forecast['yhat'], 0)
        forecast['yhat_lower'] = np.maximum(forecast['yhat_lower'], 0)
        
        # 2. Apply an exponential decay to prediction intervals for uncertainty growth
        if forecast_days > 7:
            future_dates = pd.to_datetime(forecast['ds']) > prophet_df['ds'].max()
            days_out = np.arange(1, sum(future_dates) + 1)
            uncertainty_multiplier = 1 + (np.sqrt(days_out) * 0.01)
            
            # Adjust confidence intervals for future dates
            future_indices = np.where(future_dates)[0]
            for i, idx in enumerate(future_indices):
                forecast.loc[idx, 'yhat_upper'] = (forecast.loc[idx, 'yhat'] + 
                                                  (forecast.loc[idx, 'yhat_upper'] - 
                                                   forecast.loc[idx, 'yhat']) * uncertainty_multiplier[i])
                forecast.loc[idx, 'yhat_lower'] = (forecast.loc[idx, 'yhat'] - 
                                                  (forecast.loc[idx, 'yhat'] - 
                                                   forecast.loc[idx, 'yhat_lower']) * uncertainty_multiplier[i])
        
        # Make sure there are no weekend forecasts by checking the day of week
        # 5 = Saturday, 6 = Sunday
        forecast = forecast[forecast['ds'].dt.dayofweek < 5]
        
        return forecast
        
    except Exception as e:
        st.warning(f"Prophet model failed: {str(e)}. Using simple forecast instead.")
        return simple_forecast_fallback(df, forecast_days)
    

def simple_forecast_fallback(df, forecast_days=30):
    """A simple linear regression forecast as fallback when Prophet fails"""
    try:
        # Get the closing prices as a simple 1D array
        close_prices = df['Close'].values.flatten()
        
        # Create a sequence for x values (0, 1, 2, ...)
        x = np.arange(len(close_prices)).reshape(-1, 1)
        y = close_prices
        
        # Fit a simple linear regression
        model = LinearRegression()
        model.fit(x, y)
        
        # Create future dates for forecasting - using business days only
        last_date = df.index[-1]
        
        # Generate business days only (exclude weekends)
        future_dates = pd.date_range(
            start=last_date + pd.Timedelta(days=1), 
            periods=forecast_days * 1.4,  # Add extra days to account for weekends
            freq='B'  # Business day frequency - weekdays only
        )[:forecast_days]  # Limit to requested forecast days
        
        # Historical dates and all dates together
        historical_dates = df.index
        all_dates = historical_dates.append(future_dates)
        
        # Predict future values
        future_x = np.arange(len(close_prices), len(close_prices) + len(future_dates)).reshape(-1, 1)
        future_y = model.predict(future_x)
        
        # Predict historical values for context
        historical_y = model.predict(x)
        
        # Calculate confidence interval (simple approach)
        mse = np.mean((y - historical_y) ** 2)
        sigma = np.sqrt(mse)
        
        # Create separate arrays for each column to ensure they're 1D
        ds_array = np.array(all_dates, dtype='datetime64')
        
        # Concatenate historical and future predictions
        yhat_array = np.concatenate([historical_y, future_y])
        yhat_lower_array = yhat_array - 1.96 * sigma
        yhat_upper_array = yhat_array + 1.96 * sigma
        
        # For trend/weekly/yearly, create simple placeholders
        trend_array = yhat_array.copy()  # Use the prediction as the trend
        weekly_array = np.zeros(len(yhat_array))  # No weekly component
        yearly_array = np.zeros(len(yhat_array))  # No yearly component
        
        # Create a forecast dataframe similar to Prophet's output
        forecast = pd.DataFrame({
            'ds': ds_array,
            'yhat': yhat_array,
            'yhat_lower': yhat_lower_array,
            'yhat_upper': yhat_upper_array,
            'trend': trend_array,
            'weekly': weekly_array,
            'yearly': yearly_array
        })
        
        return forecast
        
    except Exception as e:
        st.error(f"Simple forecast also failed: {str(e)}. No forecast will be shown.")
        return None


def calculate_technical_indicators_for_summary(df):
    analysis_df = df.copy()
    
    # Calculate Moving Averages
    analysis_df['MA20'] = analysis_df['Close'].rolling(window=20).mean()
    analysis_df['MA50'] = analysis_df['Close'].rolling(window=50).mean()
    
    # Calculate RSI
    delta = analysis_df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    analysis_df['RSI'] = 100 - (100 / (1 + rs))
    
    # Calculate Volume MA
    analysis_df['Volume_MA'] = analysis_df['Volume'].rolling(window=20).mean()
    
    # Calculate Bollinger Bands
    ma20 = analysis_df['Close'].rolling(window=20).mean()
    std20 = analysis_df['Close'].rolling(window=20).std()
    analysis_df['BB_upper'] = ma20 + (std20 * 2)
    analysis_df['BB_lower'] = ma20 - (std20 * 2)
    analysis_df['BB_middle'] = ma20
    
    return analysis_df



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

WEIGHT_DESCRIPTIONS = {
    "Default": "Original configuration with balanced weights",
    "Trend-Focused": "Best for growth stocks, tech stocks, clear trend patterns",
    "Statistical": "Best for blue chip stocks, utilities, stable dividend stocks",
    "Tree-Ensemble": "Best for stocks with complex relationships to market factors",
    "Balanced": "Best for general purpose, unknown stock characteristics",
    "Volatility-Focused": "Best for small cap stocks, emerging market stocks, crypto-related stocks"
}

class MultiAlgorithmStockPredictor:
    def __init__(self, symbol, training_years=2, weights=None):  # Reduced from 5 to 2 years
        self.symbol = symbol
        self.training_years = training_years
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.weights = weights if weights is not None else WEIGHT_CONFIGURATIONS["Default"]
        
    def fetch_historical_data(self):
        # Same as original EnhancedStockPredictor
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * self.training_years)
        
        try:
            df = yf.download(self.symbol, start=start_date, end=end_date)
            if df.empty:
                st.warning(f"Data for the last {self.training_years} years is unavailable. Fetching maximum available data instead.")
                df = yf.download(self.symbol, period="max")
            return df
        except Exception as e:
            st.error(f"Error fetching data: {str(e)}")
            return yf.download(self.symbol, period="max")

    # Technical indicators calculation methods remain the same
    def calculate_technical_indicators(self, df):
        # Original technical indicators remain the same
        df['MA5'] = df['Close'].rolling(window=5).mean()
        df['MA20'] = df['Close'].rolling(window=20).mean()
        df['MA50'] = df['Close'].rolling(window=50).mean()
        df['MA200'] = df['Close'].rolling(window=200).mean()
        df['RSI'] = self.calculate_rsi(df['Close'])
        df['MACD'] = self.calculate_macd(df['Close'])
        df['ROC'] = df['Close'].pct_change(periods=10) * 100
        df['ATR'] = self.calculate_atr(df)
        df['BB_upper'], df['BB_lower'] = self.calculate_bollinger_bands(df['Close'])
        df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
        df['Volume_Rate'] = df['Volume'] / df['Volume'].rolling(window=20).mean()
        
        # Additional technical indicators
        df['EMA12'] = df['Close'].ewm(span=12, adjust=False).mean()
        df['EMA26'] = df['Close'].ewm(span=26, adjust=False).mean()
        df['MOM'] = df['Close'].diff(10)
        df['STOCH_K'] = self.calculate_stochastic(df)
        df['WILLR'] = self.calculate_williams_r(df)
        
        return df.dropna()
    
    
    @staticmethod
    def calculate_stochastic(df, period=14):
        low_min = df['Low'].rolling(window=period).min()
        high_max = df['High'].rolling(window=period).max()
        k = 100 * ((df['Close'] - low_min) / (high_max - low_min))
        return k

    @staticmethod
    def calculate_williams_r(df, period=14):
        high_max = df['High'].rolling(window=period).max()
        low_min = df['Low'].rolling(window=period).min()
        return -100 * ((high_max - df['Close']) / (high_max - low_min))

    # Original calculation methods remain the same
    @staticmethod
    def calculate_rsi(prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    @staticmethod
    def calculate_macd(prices, slow=26, fast=12, signal=9):
        exp1 = prices.ewm(span=fast, adjust=False).mean()
        exp2 = prices.ewm(span=slow, adjust=False).mean()
        return exp1 - exp2
    
    @staticmethod
    def calculate_atr(df, period=14):
        high_low = df['High'] - df['Low']
        high_close = np.abs(df['High'] - df['Close'].shift())
        low_close = np.abs(df['Low'] - df['Close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        return true_range.rolling(period).mean()
    
    @staticmethod
    def calculate_bollinger_bands(prices, period=20, std_dev=2):
        ma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        upper_band = ma + (std * std_dev)
        lower_band = ma - (std * std_dev)
        return upper_band, lower_band

    def prepare_data(self, df, seq_length=60):
        # Enhanced feature selection and engineering
        feature_columns = ['Close', 'MA5', 'MA20', 'MA50', 'MA200', 'RSI', 'MACD', 
                          'ROC', 'ATR', 'BB_upper', 'BB_lower', 'Volume_Rate',
                          'EMA12', 'EMA26', 'MOM', 'STOCH_K', 'WILLR']
        
        # Add derivative features to capture momentum and acceleration
        df['Price_Momentum'] = df['Close'].pct_change(5)
        df['MA_Crossover'] = (df['MA5'] > df['MA20']).astype(int)
        df['RSI_Momentum'] = df['RSI'].diff(3)
        df['MACD_Signal'] = df['MACD'] - df['MACD'].ewm(span=9).mean()
        df['Volume_Shock'] = ((df['Volume'] - df['Volume'].shift(1)) / df['Volume'].shift(1)).clip(-1, 1)
        
        # Add market regime detection (trending vs range-bound)
        df['ADX'] = self.calculate_adx(df)
        df['Is_Trending'] = (df['ADX'] > 25).astype(int)
        
        # Calculate volatility features
        df['Volatility_20d'] = df['Close'].pct_change().rolling(window=20).std() * np.sqrt(252)
        
        # Add day of week feature (market often behaves differently on different days)
        df['DayOfWeek'] = df.index.dayofweek
        
        # Create dummy variables for day of week
        for i in range(5):  # 0-4 for Monday-Friday
            df[f'Day_{i}'] = (df['DayOfWeek'] == i).astype(int)
        
        # Handle extreme outliers by winsorizing
        for col in df.columns:
            if col != 'DayOfWeek' and df[col].dtype in [np.float64, np.int64]:
                q1 = df[col].quantile(0.01)
                q3 = df[col].quantile(0.99)
                df[col] = df[col].clip(q1, q3)
        
        # Select the final set of features
        enhanced_features = feature_columns + ['Price_Momentum', 'MA_Crossover', 'RSI_Momentum', 
                                              'MACD_Signal', 'Volume_Shock', 'ADX', 'Is_Trending', 
                                              'Volatility_20d', 'Day_0', 'Day_1', 'Day_2', 'Day_3', 'Day_4']
        
        # Ensure all selected features exist and drop NaN values
        available_features = [col for col in enhanced_features if col in df.columns]
        df_cleaned = df[available_features].copy()
        df_cleaned = df_cleaned.dropna()
        
        # Scale features
        scaled_data = self.scaler.fit_transform(df_cleaned)
        
        # Prepare sequences for LSTM
        X_lstm, y = [], []
        for i in range(seq_length, len(scaled_data)):
            X_lstm.append(scaled_data[i-seq_length:i])
            y.append(scaled_data[i, 0])  # 0 index represents Close price
            
        # Prepare data for other models
        X_other = scaled_data[seq_length:]
        
        return np.array(X_lstm), X_other, np.array(y), df_cleaned.columns.tolist()
    
    @staticmethod
    def calculate_adx(df, period=14):
        """Calculate Average Directional Index (ADX) to identify trend strength"""
        try:
            # Calculate True Range
            high_low = df['High'] - df['Low']
            high_close = abs(df['High'] - df['Close'].shift())
            low_close = abs(df['Low'] - df['Close'].shift())
            
            # Use .values to get numpy arrays and avoid pandas alignment issues
            ranges = pd.DataFrame({'hl': high_low, 'hc': high_close, 'lc': low_close})
            tr = ranges.max(axis=1)
            atr = tr.rolling(period).mean()
            
            # Calculate Plus Directional Movement (+DM) and Minus Directional Movement (-DM)
            plus_dm = df['High'].diff()
            minus_dm = df['Low'].diff()
            
            # Handle conditions separately to avoid multi-column assignment
            plus_dm_mask = (plus_dm > 0) & (plus_dm > minus_dm.abs())
            plus_dm = plus_dm.where(plus_dm_mask, 0)
            
            minus_dm_mask = (minus_dm < 0) & (minus_dm.abs() > plus_dm)
            minus_dm = minus_dm.abs().where(minus_dm_mask, 0)
            
            # Calculate Smoothed +DM and -DM
            smoothed_plus_dm = plus_dm.rolling(period).sum()
            smoothed_minus_dm = minus_dm.rolling(period).sum()
            
            # Replace zeros to avoid division issues
            atr_safe = atr.replace(0, np.nan)
            
            # Calculate Plus Directional Index (+DI) and Minus Directional Index (-DI)
            plus_di = 100 * smoothed_plus_dm / atr_safe
            minus_di = 100 * smoothed_minus_dm / atr_safe
            
            # Handle division by zero in DX calculation
            di_sum = plus_di + minus_di
            di_sum_safe = di_sum.replace(0, np.nan)
            
            # Calculate Directional Movement Index (DX)
            dx = 100 * abs(plus_di - minus_di) / di_sum_safe
            
            # Calculate Average Directional Index (ADX)
            adx = dx.rolling(period).mean()
            
            return adx
        except Exception as e:
            # If ADX calculation fails, return a series of zeros with same index as input
            return pd.Series(0, index=df.index)

    def build_lstm_model(self, input_shape):
        # Simplified LSTM architecture for faster training
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='huber', metrics=['mae'])
        return model

    def train_arima(self, df):
        # Auto-optimize ARIMA parameters
        from pmdarima import auto_arima
        
        try:
            model = auto_arima(df['Close'], 
                              start_p=1, start_q=1,
                              max_p=5, max_q=5,
                              d=1, seasonal=False,
                              stepwise=True,
                              suppress_warnings=True,
                              error_action='ignore',
                              max_order=5)
            return model
        except:
            # Fallback to standard ARIMA
            model = ARIMA(df['Close'], order=(5,1,0))
            return model.fit()

    def predict_with_all_models(self, prediction_days=30, sequence_length=30):  # Reduced sequence length
        try:
            # Fetch and prepare data
            df = self.fetch_historical_data()
            
            # Check if we have enough data
            if len(df) < sequence_length + 20:  # Need extra days for technical indicators
                st.warning(f"Insufficient historical data. Need at least {sequence_length + 20} days of data.")
                # Use available data but reduce sequence length if necessary
                sequence_length = max(10, len(df) - 20)
                
            # Calculate technical indicators
            df = self.calculate_technical_indicators(df)
            
            # Check for NaN values and handle them
            if df.isnull().any().any():
                df = df.fillna(method='ffill').fillna(method='bfill')
                
            # Verify we have enough valid data after cleaning
            if len(df.dropna()) < sequence_length:
                st.error("Insufficient valid data after calculating indicators.")
                return None
                
            # Enhanced data preparation with more features
            X_lstm, X_other, y, feature_names = self.prepare_data(df, sequence_length)
            
            # Verify we have valid data for model training
            if len(X_lstm) == 0 or len(y) == 0:
                st.error("Could not create valid sequences for prediction.")
                return None
                
            # Convert to numpy arrays
            X_lstm = np.array(X_lstm)
            X_other = np.array(X_other)
            y = np.array(y)
            
            # Split data using our optimized function
            X_lstm_train, X_lstm_test = X_lstm[:int(len(X_lstm)*0.8)], X_lstm[int(len(X_lstm)*0.8):]
            X_other_train, X_other_test = X_other[:int(len(X_other)*0.8)], X_other[int(len(X_other)*0.8):]
            y_train, y_test = y[:int(len(y)*0.8)], y[int(len(y)*0.8):]

            predictions = {}
            
            # Train and predict with LSTM (with reduced epochs)
            lstm_model = self.build_lstm_model((sequence_length, X_lstm.shape[2]))
            early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
            lstm_model.fit(X_lstm_train, y_train, epochs=20, batch_size=32,  # Reduced from 50 to 20 epochs
                          validation_data=(X_lstm_test, y_test),
                          callbacks=[early_stopping], verbose=0)
            lstm_pred = lstm_model.predict(X_lstm_test[-1:], verbose=0)[0][0]
            predictions['LSTM'] = lstm_pred

            # Train and predict with SVR
            svr_model = SVR(kernel='rbf', C=100, epsilon=0.1)
            svr_model.fit(X_other_train, y_train)
            svr_pred = svr_model.predict(X_other_test[-1:])
            predictions['SVR'] = svr_pred[0]

            # Train and predict with Random Forest (reduced complexity)
            rf_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)  # Reduced from 100 to 50 trees
            rf_model.fit(X_other_train, y_train)
            rf_pred = rf_model.predict(X_other_test[-1:])
            predictions['Random Forest'] = rf_pred[0]

            # Train and predict with XGBoost (reduced complexity)
            xgb_model = XGBRegressor(objective='reg:squarederror', random_state=42, n_estimators=50)  # Added n_estimators
            xgb_model.fit(X_other_train, y_train)
            xgb_pred = xgb_model.predict(X_other_test[-1:])
            predictions['XGBoost'] = xgb_pred[0]

            # Skip KNN and GBM for speed
            # Only include fast models when we have limited data
            if len(X_other_train) > 100:
                # Train and predict with GBM (reduced complexity)
                gbm_model = GradientBoostingRegressor(random_state=42, n_estimators=50)  # Reduced complexity
                gbm_model.fit(X_other_train, y_train)
                gbm_pred = gbm_model.predict(X_other_test[-1:])
                predictions['GBM'] = gbm_pred[0]

            # Simplified ARIMA - skip if we have other models
            if len(predictions) < 3:
                try:
                    close_prices = df['Close'].values
                    arima_model = ARIMA(close_prices, order=(2,1,0))  # Simplified from (5,1,0)
                    arima_fit = arima_model.fit()
                    arima_pred = arima_fit.forecast(steps=1)[0]
                    arima_scaled = (arima_pred - df['Close'].mean()) / df['Close'].std()
                    predictions['ARIMA'] = arima_scaled
                except Exception as e:
                    st.warning(f"ARIMA prediction failed: {str(e)}")

            weights = self.weights

            # Adjust weights if some models failed
            available_models = list(predictions.keys())
            total_weight = sum(weights.get(model, 0.1) for model in available_models)  # Default weight 0.1
            adjusted_weights = {model: weights.get(model, 0.1)/total_weight for model in available_models}

            ensemble_pred = sum(pred * adjusted_weights[model] 
                              for model, pred in predictions.items())
            
            # Inverse transform predictions
            dummy_array = np.zeros((1, X_other.shape[1]))
            dummy_array[0, 0] = ensemble_pred
            final_prediction = self.scaler.inverse_transform(dummy_array)[0, 0]

            # Calculate prediction range
            individual_predictions = []
            for pred in predictions.values():
                dummy = dummy_array.copy()
                dummy[0, 0] = pred
                individual_predictions.append(
                    self.scaler.inverse_transform(dummy)[0, 0]
                )
            
            std_dev = np.std(individual_predictions)
            
            return {
                'prediction': final_prediction,
                'lower_bound': final_prediction - std_dev,
                'upper_bound': final_prediction + std_dev,
                'confidence_score': 1 / (1 + std_dev / final_prediction),
                'individual_predictions': {
                    model: pred for model, pred in zip(predictions.keys(), individual_predictions)
                }
            }

        except Exception as e:
            st.error(f"Error in prediction: {str(e)}")
            return None



