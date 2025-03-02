from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

class Stock:
    def __init__(self, symbol, price, quantity):
        self.symbol = symbol
        self.price = price
        self.quantity = quantity

    def update_price(self):
        self.price = round(self.price * (1 + random.uniform(-0.05, 0.05)), 2)

    def buy(self, quantity):
        if self.quantity < quantity:
            raise ValueError("Insufficient stock available for purchase")
        self.quantity -= quantity

    def sell(self, quantity):
        self.quantity += quantity

    def __str__(self):
        return f"{self.symbol} - ${self.price} - {self.quantity} shares available"


class Portfolio:
    def __init__(self):
        self.stocks = {}
        self.balance = 0

    def add_stock(self, stock):
        self.stocks[stock.symbol] = stock

    def remove_stock(self, symbol):
        del self.stocks[symbol]

    def buy_stock(self, symbol, quantity):
        if symbol not in self.stocks:
            raise ValueError("Stock not found in portfolio")
        stock = self.stocks[symbol]
        cost = stock.price * quantity
        if self.balance < cost:
            raise ValueError("Insufficient balance for purchase")
        self.balance -= cost
        stock.buy(quantity)

    def sell_stock(self, symbol, quantity):
        if symbol not in self.stocks:
            raise ValueError("Stock not found in portfolio")
        stock = self.stocks[symbol]
        if stock.quantity < quantity:
            raise ValueError("Insufficient stock available for sale")
        revenue = stock.price * quantity
        self.balance += revenue
        stock.sell(quantity)
        if stock.quantity == 0:
            self.remove_stock(symbol)

    def update_stocks(self):
        for stock in self.stocks.values():
            stock.update_price()

    def __str__(self):
        return f"Portfolio:\nBalance: ${self.balance}\n" + "\n".join(str(stock) for stock in self.stocks.values())


# Create a global portfolio instance
portfolio = Portfolio()

# Initialize with some sample stocks
initial_stocks = [
    Stock("AAPL", 130.64, 100),
    Stock("GOOG", 1922.44, 50),
    Stock("MSFT", 235.99, 75)
]

for stock in initial_stocks:
    portfolio.add_stock(stock)

@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    return jsonify({
        'balance': portfolio.balance,
        'stocks': {symbol: {'price': stock.price, 'quantity': stock.quantity} 
                  for symbol, stock in portfolio.stocks.items()}
    })

@app.route('/update', methods=['POST'])
def update_prices():
    portfolio.update_stocks()
    return jsonify({'message': 'Prices updated successfully'})

@app.route('/buy', methods=['POST'])
def buy_stock():
    data = request.get_json()
    try:
        portfolio.buy_stock(data['symbol'], data['quantity'])
        return jsonify({'message': 'Purchase successful'})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/sell', methods=['POST'])
def sell_stock():
    data = request.get_json()
    try:
        portfolio.sell_stock(data['symbol'], data['quantity'])
        return jsonify({'message': 'Sale successful'})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)