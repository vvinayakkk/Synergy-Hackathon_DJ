chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displaySentiment") {
    showPopup(message.text, message.sentiment, message.error, message.stockPrice, message.stockSymbol, message.chartData);
  }
});

function showPopup(text, sentiment, error, stockPrice, stockSymbol, chartData) {
  const existingPopup = document.getElementById('sentiment-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'sentiment-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    border-radius: 12px;
    z-index: 10000;
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    max-width: 400px;
    font-family: 'Arial', sans-serif;
    transform: translateX(100%);
    animation: slideIn 0.5s ease-out forwards;
  `;

  const sentimentColor = error ? '#ff4444' : 
                        sentiment === 'positive' ? '#00cc00' : 
                        sentiment === 'negative' ? '#ff4444' : '#666';
  const sentimentGradient = error ? 'linear-gradient(to right, #ff4444, #ff8787)' :
                           sentiment === 'positive' ? 'linear-gradient(to right, #00cc00, #66ff66)' :
                           sentiment === 'negative' ? 'linear-gradient(to right, #ff4444, #ff8787)' :
                           'linear-gradient(to right, #666, #999)';

  popup.innerHTML = `
    <style>
      @keyframes slideIn {
        to { transform: translateX(0); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .sentiment-badge { animation: pulse 1.5s infinite; }
      .chart-container { animation: bounce 0.5s ease-out; }
      .loader {
        width: 40px;
        height: 40px;
        border: 5px solid ${sentimentColor};
        border-top: 5px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
    </style>
    <div class="loader"></div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.innerHTML = `
      <style>
        @keyframes slideIn { to { transform: translateX(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        .sentiment-badge { animation: pulse 1.5s infinite; }
        .chart-container { animation: bounce 0.5s ease-out; }
      </style>
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <span id="sentiment-label" style="font-size: 22px; font-weight: bold; color: ${sentimentColor}; margin-right: 12px;"></span>
        ${!error ? `<span id="sentiment-badge" class="sentiment-badge" style="background: ${sentimentGradient}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px;"></span>` : ''}
      </div>
      <p id="text-content" style="margin: 0 0 12px; font-size: 16px; color: #333; line-height: 1.4;"></p>
      ${error ? `<p id="error-content" style="color: #ff4444; margin: 0 0 12px; font-size: 14px;"></p>` : ''}
      ${stockPrice && stockSymbol ? `
        <p id="stock-content" style="margin: 0 0 12px; font-size: 16px; color: #333;"></p>` : stockSymbol ? `
        <p id="stock-content" style="margin: 0 0 12px; font-size: 14px; color: #666;"></p>` : ''}
      ${chartData && stockSymbol ? `
        <div class="chart-container" style="margin-top: 15px;">
          <canvas id="stockChart" height="100"></canvas>
        </div>` : chartData === null && stockSymbol ? `
        <p id="chart-unavailable" style="margin: 0 0 12px; font-size: 14px; color: #666;"></p>` : ''}
      ${!error ? `
        <p id="insight-content" style="margin: 0 0 12px; font-size: 13px; color: #555; font-style: italic;"></p>
        <button id="more-info-btn" style="background: ${sentimentGradient}; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; transition: transform 0.2s;">
          More Info
        </button>` : ''}
    `;

    typeText(popup.querySelector('#sentiment-label'), error ? '⚠ Error' : 'Sentiment', 50);
    if (!error) typeText(popup.querySelector('#sentiment-badge'), sentiment, 50, 500);
    typeText(popup.querySelector('#text-content'), `<strong>Text:</strong> ${text}`, 30, 800);
    if (error) typeText(popup.querySelector('#error-content'), error, 30, 1200);
    if (stockSymbol) {
      const stockText = stockPrice ? 
        `<strong>Stock (${stockSymbol}):</strong> <span style="color: ${sentimentColor}; font-weight: bold;">$${stockPrice}</span> <span style="font-size: 12px; color: #666;">(Real-time)</span>` :
        `<strong>Stock (${stockSymbol}):</strong> Price unavailable`;
      typeText(popup.querySelector('#stock-content'), stockText, 30, 1500);
    }
    if (chartData === null && stockSymbol) {
      typeText(popup.querySelector('#chart-unavailable'), `Chart unavailable for ${stockSymbol}`, 30, 1800);
    }
    if (!error) {
      typeText(popup.querySelector('#insight-content'), `<strong>Insight:</strong> ${getSentimentInsight(sentiment, text)}`, 30, chartData ? 1800 : 2000);
    }

    if (chartData && stockSymbol && window.Chart) {
      const ctx = popup.querySelector('#stockChart').getContext('2d');
      try {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: `${stockSymbol} (Last 7 Days)`,
              data: chartData.data,
              borderColor: sentimentColor,
              backgroundColor: `${sentimentColor}33`,
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            scales: { x: { display: false }, y: { beginAtZero: false } },
            plugins: { legend: { display: false } },
            elements: { point: { radius: 0 } }
          }
        });
        console.log(`Chart rendered for ${stockSymbol}`);
      } catch (e) {
        console.error('Chart rendering error:', e);
      }
    }

    if (!error) {
      const btn = popup.querySelector('#more-info-btn');
      btn.addEventListener('click', () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(text + ' news')}`, '_blank');
      });
      btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseout', () => btn.style.transform = 'scale(1)');
    }
  }, 1500);

  setTimeout(() => {
    popup.style.transform = 'translateX(100%)';
    setTimeout(() => popup.remove(), 500);
  }, 10000);
}

function typeText(element, text, speed = 50, delay = 0) {
  if (!element) return;
  element.innerHTML = '';
  let i = 0;
  const html = text.includes('<') && text.includes('>');

  setTimeout(() => {
    const interval = setInterval(() => {
      if (i < text.length) {
        if (html) {
          element.innerHTML = text.slice(0, i + 1);
        } else {
          element.textContent += text.charAt(i);
        }
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }, delay);
}

function getSentimentInsight(sentiment, text) {
  if (sentiment === 'positive') return 'This text radiates optimism—maybe a big win or bullish news!';
  if (sentiment === 'negative') return 'This text hints at gloom—could be bad news or market jitters.';
  return 'This text is chill—no strong vibes either way.';
}
