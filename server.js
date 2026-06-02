const http = require("http");
let marketData = {};
let lastUpdate = null;
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization","Content-Type":"application/json"};
const server = http.createServer((req, res) => {
if (req.method === "OPTIONS") { res.writeHead(204, CORS); res.end(); return; }
const url = req.url.split("?")[0];
if (req.method === "POST" && url === "/webhook") {
let body = "";
req.on("data", chunk => body += chunk);
req.on("end", () => {
try {
const data = JSON.parse(body);
const ticker = (data.ticker || "").toUpperCase().trim();
if (!ticker) { res.writeHead(400, CORS); res.end(JSON.stringify({error:"No ticker"})); return; }
marketData[ticker] = {ticker,price:parseFloat(data.price)||0,rsi:parseFloat(data.rsi)||50,ema9:parseFloat(data.ema9)||0,ema20:parseFloat(data.ema20)||0,vwap:parseFloat(data.vwap)||0,volume:parseFloat(data.volume)||0,avgVolume:parseFloat(data.avgVolume)||0,pdHigh:parseFloat(data.pdHigh)||0,pdLow:parseFloat(data.pdLow)||0,aboveEma9:data.aboveEma9==="true"||data.aboveEma9===true,aboveEma20:data.aboveEma20==="true"||data.aboveEma20===true,aboveVwap:data.aboveVwap==="true"||data.aboveVwap===true,volSpike:data.volSpike==="true"||data.volSpike===true,trend:data.trend||"neutral",signal:data.signal||"",updatedAt:new Date().toISOString()};
lastUpdate = new Date().toISOString();
res.writeHead(200, CORS);
res.end(JSON.stringify({ok:true,ticker,price:marketData.price}));
} catch(e) { res.writeHead(400, CORS); res.end(JSON.stringify({error:e.message})); }
});
return;
}
if (req.method === "GET" && url === "/data") { res.writeHead(200, CORS); res.end(JSON.stringify({data:marketData,lastUpdate,count:Object.keys(marketData).length})); return; }
if (req.method === "GET" && url.startsWith("/data/")) { const t=url.split("/data/")[1].toUpperCase(); if(marketData[t]){res.writeHead(200,CORS);res.end(JSON.stringify(marketData[t]));}else{res.writeHead(404,CORS);res.end(JSON.stringify({error:"Not found"}));} return; }
if (req.method === "GET" && url === "/health") { res.writeHead(200, CORS); res.end(JSON.stringify({status:"ok",tickers:Object.keys(marketData).length,lastUpdate})); return; }
if (req.method === "GET" && url === "/") { res.writeHead(200,{"Content-Type":"text/html"}); res.end("<html style='background:#060608;color:#00ff9d;font-family:monospace;padding:40px'><h1>WEBHOOK SERVER LIVE</h1><p>Tickers: "+Object.keys(marketData).length+"</p></html>"); return; }
res.writeHead(404, CORS); res.end(JSON.stringify({error:"Not found"}));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log("Webhook server running on port " + PORT); });

