from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.tools import BaseTool, StructuredTool, tool
import yfinance as yf
import re
from typing import List, Dict, Any, Optional

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Load environment variables
load_dotenv()

# Set up Groq API key (you need to set this in your .env file)
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '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')
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please add it to your .env file.")

# Define YFinance tools with better error handling
@tool
def get_stock_price(ticker: str) -> str:
    """Get the current stock price for a single ticker symbol (e.g., 'AAPL')."""
    # Clean ticker input to ensure it's a single ticker
    ticker = ticker.strip().split(',')[0].strip().upper()
    
    try:
        stock = yf.Ticker(ticker)
        price = stock.info.get('currentPrice') or stock.info.get('regularMarketPrice')
        if price:
            return f"The current price of {ticker} is ${price:.2f}"
        else:
            return f"Could not retrieve price for {ticker}"
    except Exception as e:
        return f"Error getting stock price for {ticker}: {str(e)}"

@tool
def get_stock_info(ticker: str) -> str:
    """Get detailed information about a stock for a single ticker symbol (e.g., 'AAPL')."""
    # Clean ticker input to ensure it's a single ticker
    ticker = ticker.strip().split(',')[0].strip().upper()
    
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Extract key metrics
        company_name = info.get('longName', 'N/A')
        sector = info.get('sector', 'N/A')
        industry = info.get('industry', 'N/A')
        market_cap = info.get('marketCap', 'N/A')
        if market_cap != 'N/A':
            market_cap = f"${market_cap:,}"
            
        pe_ratio = info.get('trailingPE', 'N/A')
        dividend_yield = info.get('dividendYield', 'N/A')
        if dividend_yield not in ['N/A', None]:
            dividend_yield = f"{dividend_yield * 100:.2f}%"
            
        return f"""
Company: {company_name}
Ticker: {ticker}
Sector: {sector}
Industry: {industry}
Market Cap: {market_cap}
P/E Ratio: {pe_ratio}
Dividend Yield: {dividend_yield}
        """
    except Exception as e:
        return f"Error getting stock information for {ticker}: {str(e)}"

@tool
def get_analyst_recommendations(ticker: str) -> str:
    """Get analyst recommendations for a given ticker symbol (e.g., 'AAPL')."""
    # Clean ticker input to ensure it's a single ticker
    ticker = ticker.strip().split(',')[0].strip().upper()
    
    try:
        stock = yf.Ticker(ticker)
        recommendations = stock.recommendations
        if recommendations is not None and not recommendations.empty:
            recent_recs = recommendations.tail(5)
            result = f"Recent analyst recommendations for {ticker}:\n\n"
            for index, row in recent_recs.iterrows():
                result += f"Date: {index.date()}\n"
                result += f"Firm: {row.get('Firm', 'N/A')}\n"
                result += f"Action: {row.get('To Grade', 'N/A')}\n"
                result += f"From: {row.get('From Grade', 'N/A')}\n\n"
            return result
        else:
            return f"No analyst recommendations found for {ticker}"
    except Exception as e:
        return f"Error getting analyst recommendations for {ticker}: {str(e)}"

@tool
def get_stock_fundamentals(ticker: str) -> str:
    """Get fundamental data about a stock for a single ticker symbol (e.g., 'AAPL')."""
    # Clean ticker input to ensure it's a single ticker
    ticker = ticker.strip().split(',')[0].strip().upper()
    
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Get key fundamentals
        eps = info.get('trailingEps', 'N/A')
        forward_pe = info.get('forwardPE', 'N/A')
        peg_ratio = info.get('pegRatio', 'N/A')
        book_value = info.get('bookValue', 'N/A')
        price_to_book = info.get('priceToBook', 'N/A')
        debt_to_equity = info.get('debtToEquity', 'N/A')
        return_on_equity = info.get('returnOnEquity', 'N/A')
        revenue_growth = info.get('revenueGrowth', 'N/A')
        
        if revenue_growth not in ['N/A', None]:
            revenue_growth = f"{revenue_growth * 100:.2f}%"
        if return_on_equity not in ['N/A', None]:
            return_on_equity = f"{return_on_equity * 100:.2f}%"
            
        return f"""
Fundamentals for {ticker}:
EPS (Trailing): {eps}
Forward P/E: {forward_pe}
PEG Ratio: {peg_ratio}
Book Value: {book_value}
Price to Book: {price_to_book}
Debt to Equity: {debt_to_equity}
Return on Equity: {return_on_equity}
Revenue Growth: {revenue_growth}
        """
    except Exception as e:
        return f"Error getting stock fundamentals for {ticker}: {str(e)}"

@tool
def compare_stocks(tickers: str) -> str:
    """Compare basic information for multiple stocks. Provide comma-separated tickers (e.g., 'AAPL,MSFT,GOOGL')."""
    ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]
    if not ticker_list:
        return "Please provide at least one valid ticker symbol."
    
    if len(ticker_list) > 5:
        ticker_list = ticker_list[:5]  # Limit to 5 tickers to avoid overwhelming results
    
    result = "Stock Comparison:\n\n"
    comparison_data = []
    
    for ticker in ticker_list:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # Basic metrics for comparison
            company_name = info.get('longName', 'N/A')
            price = info.get('currentPrice') or info.get('regularMarketPrice') or 'N/A'
            market_cap = info.get('marketCap', 'N/A')
            if market_cap not in ['N/A', None]:
                market_cap = f"${market_cap:,}"
            pe_ratio = info.get('trailingPE', 'N/A')
            
            comparison_data.append({
                'Ticker': ticker,
                'Company': company_name,
                'Price': f"${price:.2f}" if price not in ['N/A', None] else 'N/A',
                'Market Cap': market_cap,
                'P/E Ratio': pe_ratio
            })
        except Exception as e:
            comparison_data.append({
                'Ticker': ticker,
                'Company': 'Error retrieving data',
                'Price': 'N/A',
                'Market Cap': 'N/A',
                'P/E Ratio': 'N/A'
            })
    
    # Format as a table in markdown-friendly text
    result += "| Ticker | Company | Price | Market Cap | P/E Ratio |\n"
    result += "| ------ | ------- | ----- | ---------- | --------- |\n"
    
    for stock in comparison_data:
        result += f"| {stock['Ticker']} | {stock['Company']} | {stock['Price']} | {stock['Market Cap']} | {stock['P/E Ratio']} |\n"
    
    return result

# Initialize Groq model
llm = ChatGroq(
    model_name="llama3-8b-8192",  # Options include: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768, etc.
    temperature=0.2,
    groq_api_key=GROQ_API_KEY
)

# Initialize memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# List of custom tools
tools = [
    get_stock_price,
    get_stock_info,
    get_analyst_recommendations,
    get_stock_fundamentals,
    compare_stocks
]

# Custom agent executor to capture observations
class ObservationCapturingAgentExecutor:
    def __init__(self, agent):
        self.agent = agent
        self.last_observation = None
        
    def run(self, query):
        # Patch the agent's _call method to capture observations
        original_call = self.agent._call
        observations = []
        
        def patched_call(inputs):
            result = original_call(inputs)
            
            # Extract observations from the agent's log
            if hasattr(self.agent, 'callback_manager') and hasattr(self.agent.callback_manager, 'handlers'):
                for handler in self.agent.callback_manager.handlers:
                    if hasattr(handler, 'logs') and 'agent' in handler.logs:
                        agent_logs = handler.logs['agent']
                        for log in agent_logs:
                            if 'Observation' in log:
                                observation = log.split('Observation: ')[1].strip()
                                observations.append(observation)
            
            return result
        
        # Apply the patch
        self.agent._call = patched_call
        
        try:
            # Run the agent
            result = self.agent.run(query)
            
            # Store the last observation
            if observations:
                self.last_observation = observations[-1]
                
            # Restore the original method
            self.agent._call = original_call
            
            # Combine observation with result if available
            if self.last_observation:
                if not result.startswith("```") and self.last_observation.strip():
                    # Format the observation as markdown if it appears to be a table
                    if "|" in self.last_observation and "---------" in self.last_observation:
                        result = f"```markdown\n{self.last_observation}\n```\n\n**Analysis:**\n\n{result}"
                    else:
                        result = f"**Data:**\n\n{self.last_observation}\n\n**Analysis:**\n\n{result}"
            
            return result
        except Exception as e:
            # Restore the original method in case of error
            self.agent._call = original_call
            raise e

# Initialize the agent
agent = initialize_agent(
    tools=tools, 
    llm=llm, 
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=4
)

# Wrap the agent with our custom executor
observation_capturing_agent = ObservationCapturingAgentExecutor(agent)

@app.route('/analyze', methods=['POST'])
def analyze_stock():
    data = request.json
    query = data.get('query', '')
    
    # Add financial analyst system message with clear instructions about tool usage
    system_message = """You are a financial analyst that researches stock prices, analyst recommendations, and stock fundamentals.
    Format your response using markdown and use tables to display data where possible.
    
    IMPORTANT INSTRUCTIONS:
    1. When calling tools, only pass a single ticker symbol to functions that process individual stocks.
    2. For comparing multiple stocks, use the compare_stocks function.
    3. Read the tool descriptions carefully before using them.
    4. ALWAYS include both the raw data and your interpretation in your responses.
    5. Format tables using proper markdown.
    """
    
    # Update the agent's system message
    agent.agent.llm_chain.prompt.messages[0].prompt.template = system_message + "\n{chat_history}\nHuman: {input}\nAI: "
    
    try:
        # Use our custom executor that captures observations
        response = observation_capturing_agent.run(query)
        return jsonify({"response": response})
    except Exception as e:
        error_msg = str(e)
        # Provide a more user-friendly error message
        return jsonify({
            "response": f"I encountered an issue while processing your request about stocks. Please try asking in a different way or specify a single stock ticker. Technical details: {error_msg}",
            "error": True
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)