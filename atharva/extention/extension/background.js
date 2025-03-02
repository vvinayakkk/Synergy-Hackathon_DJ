// Create context menu item
chrome.contextMenus.create({
  id: "analyze-sentiment",
  title: "Analyze Sentiment",
  contexts: ["selection"]
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-sentiment") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzeSelectedText,
      args: [info.selectionText]
    });
  }
});

// Handle sentiment analysis and stock data requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeSentiment") {
    const text = message.text;
    Promise.all([
      fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      }).then(res => res.json()).catch(err => ({ error: 'Sentiment fetch failed: ' + err.message })),
      fetchStockPrice(text),
      fetchStockChartData(text)
    ])
      .then(([sentimentData, stockData, chartData]) => {
        console.log('Sentiment Data:', sentimentData);
        console.log('Stock Price Data:', stockData);
        console.log('Chart Data:', chartData);
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displaySentiment",
          text,
          sentiment: sentimentData.sentiment || 'Error',
          error: sentimentData.error,
          stockPrice: stockData.price,
          stockSymbol: stockData.symbol,
          chartData: chartData
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending to content script:', chrome.runtime.lastError.message);
          }
        });
      })
      .catch(error => {
        console.error('Promise.all Error:', error);
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displaySentiment",
          text,
          error: 'Could not connect to server or fetch stock data: ' + error.message
        });
      });
  }
});

async function fetchStockPrice(text) {
  const apiKey = '9KLHOUZWOKMJSEUC'; // Your Alpha Vantage key
  const symbol = extractStockSymbol(text);
  if (!symbol) {
    console.log('No symbol found for price:', text);
    return { price: null, symbol: null };
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await response.json();
    console.log('Stock Price Raw Response:', data);
    if (data['Error Message'] || data['Information']) {
      console.error('Stock Price API Issue:', data['Error Message'] || data['Information']);
      return { price: null, symbol };
    }
    const price = data['Global Quote']?.['05. price'];
    return { price: price ? parseFloat(price).toFixed(2) : null, symbol };
  } catch (error) {
    console.error('Stock Price Fetch Error:', error);
    return { price: null, symbol };
  }
}

async function fetchStockChartData(text) {
  const apiKey = '9KLHOUZWOKMJSEUC';
  const symbol = extractStockSymbol(text);
  if (!symbol) {
    console.log('No symbol found for chart:', text);
    return null;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`
    );
    const data = await response.json();
    console.log('Chart Raw Response:', data);
    if (data['Error Message'] || data['Information']) {
      console.error('Chart API Issue:', data['Error Message'] || data['Information']);
      return null;
    }
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      console.error('No time series data in response:', data);
      return null;
    }

    const dates = Object.keys(timeSeries).slice(0, 7).reverse();
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
    return { labels: dates, data: prices };
  } catch (error) {
    console.error('Chart Fetch Error:', error);
    return null;
  }
}

function extractStockSymbol(text) {
  const match = text.match(/\b[A-Z]{1,5}\b(?!\w)/);
  return match ? match[0] : null;
}

function analyzeSelectedText(text) {
  chrome.runtime.sendMessage({
    action: "analyzeSentiment",
    text: text
  });
}