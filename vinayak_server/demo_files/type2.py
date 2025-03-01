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



class GoverningAIModel:
    def __init__(self, symbol, historical_data, prophet_forecast, multi_model_results, news_sentiment, technical_analysis):
        self.symbol = symbol
        self.historical_data = historical_data
        self.prophet_forecast = prophet_forecast
        self.multi_model_results = multi_model_results
        self.news_sentiment = news_sentiment
        self.technical_analysis = technical_analysis
        self.current_price = float(historical_data['Close'].iloc[-1]) if not historical_data.empty else None

    def synthesize_insights(self):
        """Synthesize insights from all sources with probabilistic weighting"""
        insights = {}

        # Prophet Forecast Insights
        if self.prophet_forecast is not None and len(self.prophet_forecast) > 0:
            last_date = self.historical_data.index[-1]
            future_mask = pd.to_datetime(self.prophet_forecast['ds']) > last_date
            if any(future_mask):
                next_date_idx = future_mask.argmax()
                short_term_price = float(self.prophet_forecast['yhat'].iloc[min(next_date_idx + 7, len(self.prophet_forecast) - 1)])
                medium_term_price = float(self.prophet_forecast['yhat'].iloc[min(next_date_idx + 30, len(self.prophet_forecast) - 1)])
                insights['prophet_short_term'] = (short_term_price - self.current_price) / self.current_price
                insights['prophet_medium_term'] = (medium_term_price - self.current_price) / self.current_price
                insights['prophet_confidence'] = 1 - np.mean((self.prophet_forecast['yhat_upper'] - self.prophet_forecast['yhat_lower']) / self.prophet_forecast['yhat'])

        # Multi-Model Predictions
        if self.multi_model_results is not None:
            insights['multi_model_pred'] = (self.multi_model_results['prediction'] - self.current_price) / self.current_price
            insights['multi_model_confidence'] = self.multi_model_results['confidence_score']
            insights['multi_model_consensus'] = len([p for p in self.multi_model_results['individual_predictions'].values() if p > self.current_price]) / len(self.multi_model_results['individual_predictions'])

        # News Sentiment
        if self.news_sentiment:
            total_weight = sum(1 for _ in self.news_sentiment)
            weighted_sentiment = sum(s[0] * 1 for s in self.news_sentiment) / total_weight if total_weight > 0 else 0
            insights['news_sentiment'] = weighted_sentiment
            insights['news_confidence'] = min(abs(weighted_sentiment) * 100, 100) / 100

        # Technical Analysis
        if self.technical_analysis is not None and len(self.technical_analysis) >= 2:
            latest = self.technical_analysis.iloc[-1]
            insights['technical_trend'] = 1 if float(latest['MA20']) > float(latest['MA50']) else -1
            rsi = float(latest['RSI'])
            insights['technical_rsi'] = 1 if rsi < 30 else -1 if rsi > 70 else 0
            insights['technical_confidence'] = 0.8  # Default confidence for technical signals

        return insights

    def apply_trading_strategies(self, insights):
        """Apply predefined trading strategies"""
        strategies = {
            'momentum': self.momentum_strategy(insights),
            'mean_reversion': self.mean_reversion_strategy(insights),
            'sentiment_driven': self.sentiment_strategy(insights),
            'hold': ('hold', 0.5, 0)  # Default hold strategy
        }
        return strategies

    def momentum_strategy(self, insights):
        """Momentum-based strategy: Buy if upward trend, sell if downward"""
        score = 0
        confidence = 0
        if 'prophet_medium_term' in insights and insights['prophet_medium_term'] > 0.05:
            score += insights['prophet_medium_term'] * insights.get('prophet_confidence', 0.5)
            confidence += insights.get('prophet_confidence', 0.5)
        if 'multi_model_pred' in insights and insights['multi_model_pred'] > 0.03:
            score += insights['multi_model_pred'] * insights.get('multi_model_confidence', 0.5)
            confidence += insights.get('multi_model_confidence', 0.5)
        if 'technical_trend' in insights and insights['technical_trend'] > 0:
            score += 0.5 * insights.get('technical_confidence', 0.5)
            confidence += insights.get('technical_confidence', 0.5)
        confidence = confidence / 3 if confidence > 0 else 0.5
        return 'buy' if score > 0.5 else 'sell' if score < -0.5 else 'hold', confidence, score

    def mean_reversion_strategy(self, insights):
        """Mean-reversion: Buy if oversold, sell if overbought"""
        score = 0
        confidence = 0
        if 'technical_rsi' in insights:
            score += insights['technical_rsi'] * insights.get('technical_confidence', 0.5)
            confidence += insights.get('technical_confidence', 0.5)
        if 'multi_model_pred' in insights:
            score += -insights['multi_model_pred'] * insights.get('multi_model_confidence', 0.5) if abs(insights['multi_model_pred']) > 0.05 else 0
            confidence += insights.get('multi_model_confidence', 0.5)
        confidence = confidence / 2 if confidence > 0 else 0.5
        return 'buy' if score > 0.5 else 'sell' if score < -0.5 else 'hold', confidence, score

    def sentiment_strategy(self, insights):
        """Sentiment-driven: Buy if positive news, sell if negative"""
        score = 0
        confidence = 0
        if 'news_sentiment' in insights:
            score += insights['news_sentiment'] * insights.get('news_confidence', 0.5)
            confidence += insights.get('news_confidence', 0.5)
        if 'multi_model_pred' in insights and abs(insights['news_sentiment']) > 0.2:
            score += insights['multi_model_pred'] * insights.get('multi_model_confidence', 0.5) * 0.5
            confidence += insights.get('multi_model_confidence', 0.5) * 0.5
        confidence = confidence / 2 if confidence > 0 else 0.5
        return 'buy' if score > 0.3 else 'sell' if score < -0.3 else 'hold', confidence, score

    def generate_recommendation(self):
        """Generate final recommendation with probabilistic consistency"""
        insights = self.synthesize_insights()
        strategies = self.apply_trading_strategies(insights)

        # Probabilistic consistency scoring
        decisions = [strat[0] for strat in strategies.values()]
        confidences = [strat[1] for strat in strategies.values()]
        scores = [strat[2] for strat in strategies.values()]
        
        # Weighted voting with confidence
        buy_score = sum(c * s for d, c, s in zip(decisions, confidences, scores) if d == 'buy') / sum(confidences) if 'buy' in decisions else 0
        sell_score = sum(c * s for d, c, s in zip(decisions, confidences, scores) if d == 'sell') / sum(confidences) if 'sell' in decisions else 0
        hold_score = sum(c * s for d, c, s in zip(decisions, confidences, scores) if d == 'hold') / sum(confidences) if 'hold' in decisions else 0

        final_decision = max([('buy', buy_score), ('sell', sell_score), ('hold', hold_score)], key=lambda x: x[1])[0]
        final_confidence = max(buy_score, sell_score, hold_score)

        # Narrative generation with logical consistency check
        narrative = self.generate_narrative(final_decision, insights, strategies)
        return {
            'decision': final_decision,
            'confidence': final_confidence,
            'narrative': narrative,
            'strategies': strategies,
            'insights': insights
        }

    def generate_narrative(self, decision, insights, strategies):
        """Generate a coherent narrative for the recommendation"""
        reasons = []
        if decision == 'buy':
            if 'prophet_medium_term' in insights and insights['prophet_medium_term'] > 0:
                reasons.append(f"Prophet forecasts a {insights['prophet_medium_term']*100:.1f}% increase in 30 days.")
            if 'multi_model_pred' in insights and insights['multi_model_pred'] > 0:
                reasons.append(f"Multi-model ensemble predicts a {insights['multi_model_pred']*100:.1f}% rise.")
            if 'news_sentiment' in insights and insights['news_sentiment'] > 0:
                reasons.append(f"Positive news sentiment with {insights['news_sentiment']*100:.1f}% confidence.")
            if 'technical_trend' in insights and insights['technical_trend'] > 0:
                reasons.append("Technical indicators show a bullish trend.")
        elif decision == 'sell':
            if 'prophet_medium_term' in insights and insights['prophet_medium_term'] < 0:
                reasons.append(f"Prophet forecasts a {insights['prophet_medium_term']*100:.1f}% decrease in 30 days.")
            if 'multi_model_pred' in insights and insights['multi_model_pred'] < 0:
                reasons.append(f"Multi-model ensemble predicts a {insights['multi_model_pred']*100:.1f}% drop.")
            if 'news_sentiment' in insights and insights['news_sentiment'] < 0:
                reasons.append(f"Negative news sentiment with {insights['news_sentiment']*100:.1f}% confidence.")
            if 'technical_trend' in insights and insights['technical_trend'] < 0:
                reasons.append("Technical indicators show a bearish trend.")
        else:
            reasons.append("Mixed signals from models and indicators suggest a neutral stance.")

        return f"Recommendation: {decision.upper()} with {strategies[decision][1]*100:.1f}% confidence. " + " ".join(reasons)

    def simulate_trade(self, decision, confidence):
        """Simulate a mock trade based on the recommendation"""
        if self.current_price is None:
            return None
        
        position_size = min(1.0, confidence * 2)  # Risk-adjusted sizing (max 100% of capital)
        stop_loss = 0.95 if decision == 'buy' else 1.05  # 5% stop loss
        take_profit = 1.10 if decision == 'buy' else 0.90  # 10% take profit

        trade = {
            'symbol': self.symbol,
            'action': decision,
            'entry_price': self.current_price,
            'position_size': position_size,
            'stop_loss': self.current_price * stop_loss,
            'take_profit': self.current_price * take_profit,
            'confidence': confidence,
            'potential_profit': (self.current_price * take_profit - self.current_price) * position_size if decision == 'buy' else (self.current_price - self.current_price * take_profit) * position_size,
            'potential_loss': (self.current_price - self.current_price * stop_loss) * position_size if decision == 'buy' else (self.current_price * stop_loss - self.current_price) * position_size
        }
        return trade




