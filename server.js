const http = require("http");

let marketData = {};
let lastUpdate = null;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const url = req.url.split("?")[0];

  if (req.method === "POST" && url === "/webhook") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const ticker = (data.ticker || "").toUpperCase().trim();
        if (!ticker) {
          res.writeHead(400, CORS);
          res.end(JSON.stringify({ error: "No ticker provided" }));
          return;
        }
        marketData[ticker] = {
          ticker,
          price:      parseFloat(data.price)      || marketData[ticker]?.price || 0,
          rsi:        parseFloat(data.rsi)         || marketData[ticker]?.rsi || 50,
          ema9:       parseFloat(data.ema9)        || marketData[ticker]?.ema9 || 0,
          ema20:      parseFloat(data.ema20)       || marketData[ticker]?.ema20 || 0,
          vwap:       parseFloat(data.vwap)        || marketData[ticker]?.vwap || 0,
          volume:     parseFloat(data.volume)      || marketData[ticker]?.volume || 0,
          avgVolume:  parseFloat(data.avgVolume)   || marketData[ticker]?.avgVolume || 0,
          pdHigh:     parseFloat(data.pdHigh)      || marketData[ticker]?.pdHigh || 0,
          pdLow:      parseFloat(data.pdLow)       || marketData[ticker]?.pdLow || 0,
          aboveEma9:  data.aboveEma9  === "true"   || data.aboveEma9  === true,
          aboveEma20: data.aboveEma20 === "true"   || data.aboveEma20 === true,
          aboveVwap:  data.aboveVwap  === "true"   || data.aboveVwap  === true,
          volSpike:   data.volSpike   === "true"   || data.volSpike   === true,
          trend:      data.trend      || marketData[ticker]?.trend || "neutral",
          signal:     data.signal     || marketData[ticker]?.signal || "",
          updatedAt:  new Date().toISOString(),
        };
        lastUpdate = new Date().toISOString();
        console.log(`Updated: ${ticker} @ $${marketData[ticker].price}`);
        res.writeHead(200, CORS);
        res.end(JSON.stringify({ ok: true, ticker, price: marketData[ticker].price }));
      } catch (e) {
        res.writeHead(400, CORS);
        res.end(JSON.stringify({ error: "Invalid JSON: " + e.message }));
      }
    });
    return;
  }

  if (req.method === "GET" && url === "/data") {
    res.writeHead(200, CORS);
    res.end(JSON.stringify({ data: marketData, lastUpdate, count: Object.keys(marketData).length }));
    return;
  }

  if (req.method === "GET" && url.startsWith("/data/")) {
    const ticker = url.split("/data/")[1].toUpperCase();
    if (marketData[ticker]) {
      res.writeHead(200, CORS);
      res.end(JSON.stringify(marketData[ticker]));
    } else {
      res.writeHead(404, CORS);
      res.end(JSON.stringify({ error: "No data for " + ticker }));
    }
    return;
  }

  if (req.method === "GET" && url === "/health") {
    res.writeHead(200, CORS);
    res.end(JSON.stringify({ status: "ok", tickers: Object.keys(marketData).length, lastUpdate }));
    return;
  }

  if (req.method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html style="background:#060608;color:#00ff9d;font-family:monospace;padding:40px">
      <h1>WEEKLY OPTIONS WEBHOOK SERVER</h1>
      <p>Status: LIVE</p>
      <p>Tickers: ${Object.keys(marketData).length}</p>
      <p>Last update: ${lastUpdate || "No data yet"}</p>
    </html>`);
    return;
  }

  res.writeHead(404, CORS);
  res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Webhook server running on port " + PORT);
});
Once pasted click Commit changes at the bottom. Then tell me and we'll add package.json next.
