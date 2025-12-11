const INITIAL_CASH = 1000;

const LS = {
    cash: "vp_cash",
    holdings: "vp_holdings",
    points: "vp_points",
    hist: "vp_hist",
    badges: "vp_badges"
};

let cash = parseFloat(localStorage.getItem(LS.cash)) || INITIAL_CASH;
let holdings = JSON.parse(localStorage.getItem(LS.holdings)) || {};
let points = parseInt(localStorage.getItem(LS.points)) || 0;
let history = JSON.parse(localStorage.getItem(LS.hist)) || [];
let badges = JSON.parse(localStorage.getItem(LS.badges)) || {
    first: false,
    diversify: false,
    growth: false
};

let companies = [
    { symbol: "AAPL", name: "Apple Inc.", price: 170, prev:170 },
    { symbol: "MSFT", name: "Microsoft", price: 320, prev:320 },
    { symbol: "GOOGL", name: "Alphabet (Google)", price:130, prev:130 },
    { symbol: "AMZN", name: "Amazon", price:110, prev:110 },
    { symbol: "TSLA", name: "Tesla", price:230, prev:230 },
    { symbol: "META", name: "Meta Platforms", price:170, prev:170 },
    { symbol: "NFLX", name: "Netflix", price:60, prev:60 },
    { symbol: "KO", name: "Coca-Cola", price:45, prev:45 },
    { symbol: "NKE", name: "Nike", price:95, prev:95 },
    { symbol: "VOD", name: "Vodafone", price:1.2, prev:1.2 },

    { symbol: "NVDA", name: "NVIDIA Corporation", price: 480, prev:480 },
    { symbol: "AMD", name: "Advanced Micro Devices", price:120, prev:120 },
    { symbol: "INTC", name: "Intel Corporation", price:32, prev:32 },
    { symbol: "IBM", name: "IBM", price:140, prev:140 },
    { symbol: "ORCL", name: "Oracle", price:110, prev:110 }
];


/* -------------------------------------------
   UTILITY
------------------------------------------- */
const gbp = n => "£" + n.toFixed(2);

function save(){
    localStorage.setItem(LS.cash, cash);
    localStorage.setItem(LS.points, points);
    localStorage.setItem(LS.holdings, JSON.stringify(holdings));
    localStorage.setItem(LS.hist, JSON.stringify(history));
    localStorage.setItem(LS.badges, JSON.stringify(badges));
}

/* -------------------------------------------
   PORTFOLIO VALUE
------------------------------------------- */
function portfolioValue(){
    let total = cash;
    for(let s in holdings){
        let comp = companies.find(c => c.symbol === s);
        total += holdings[s].qty * comp.price;
    }
    return total;
}

/* -------------------------------------------
   RENDER UI
------------------------------------------- */
function renderDropdown(){
    const sel = document.getElementById("dropdown-company");
    sel.innerHTML = "";
    companies.forEach(c=>{
        sel.innerHTML += `<option value="${c.symbol}">${c.name} (${c.symbol})</option>`;
    });
}

function renderHeader(){
    document.getElementById("cash-display").innerText = "Cash: " + gbp(cash);
    document.getElementById("points-display").innerText = "Points: " + points;
}

function renderPortfolioValue(){
    document.getElementById("portfolio-value").innerText = gbp(portfolioValue());
}

function renderMarket(){
    let tb = document.querySelector("#market-table tbody");
    tb.innerHTML = "";
    companies.forEach(c=>{
        let diff = c.price - c.prev;
        let diffPct = (diff / c.prev) * 100;
        let cls = diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "";
        tb.innerHTML += `
      <tr>
        <td>${c.name} <div class="small text-muted">${c.symbol}</div></td>
        <td class="${cls}">${gbp(c.price)}</td>
        <td class="${cls}">${diff >= 0 ? "+" : ""}${diff.toFixed(2)} (${diffPct>=0?"+":""}${diffPct.toFixed(2)}%)</td>
        <td><button class="btn btn-success btn-sm" onclick="buy('${c.symbol}',1)">Buy</button></td>
      </tr>`;
    });
}

function renderHoldings(){
    let tb = document.querySelector("#portfolio-table tbody");
    tb.innerHTML = "";
    let keys = Object.keys(holdings);
    if(keys.length === 0){
        tb.innerHTML = `<tr><td colspan="6" class="text-muted">No assets yet.</td></tr>`;
        return;
    }

    keys.forEach(sym=>{
        let h = holdings[sym];
        let c = companies.find(x=>x.symbol===sym);
        let total = h.qty * c.price;
        let pct = ((c.price - h.avg) / h.avg) * 100;
        let pc = pct > 0 ? "text-success" : pct < 0 ? "text-danger" : "";
        tb.innerHTML += `
      <tr>
        <td>${c.name} <div class="small text-muted">${sym}</div></td>
        <td>${h.qty}</td>
        <td>${gbp(c.price)}</td>
        <td>${gbp(total)}</td>
        <td class="${pc}">${pct>=0?"+":""}${pct.toFixed(2)}%</td>
        <td><button class="btn btn-warning btn-sm" onclick="sell('${sym}',1)">Sell</button></td>
      </tr>`;
    });
}

/* -------------------------------------------
   BUY / SELL
------------------------------------------- */
function buy(sym, qty){
    qty = parseInt(qty);
    let c = companies.find(x=>x.symbol===sym);
    let cost = qty * c.price;
    if(cost > cash){ alert("Not enough cash!"); return; }

    cash -= cost;

    if(!holdings[sym]){
        holdings[sym] = { qty: qty, avg: c.price };
    } else {
        let h = holdings[sym];
        let totalQty = h.qty + qty;
        let newAvg = ((h.avg * h.qty) + (c.price * qty)) / totalQty;
        holdings[sym] = { qty: totalQty, avg: newAvg };
    }

    points += 5;

    if(!badges.first){
        badges.first = true;
        points += 10;
    }

    if(Object.keys(holdings).length >= 3 && !badges.diversify){
        badges.diversify = true;
        points += 20;
    }

    save();
    renderAll();
}

function sell(sym, qty){
    qty = parseInt(qty);
    if(!holdings[sym] || holdings[sym].qty < qty) return;

    let c = companies.find(x=>x.symbol===sym);
    cash += qty * c.price;

    holdings[sym].qty -= qty;
    if(holdings[sym].qty <= 0) delete holdings[sym];

    points += 3;

    save();
    renderAll();
}

/* DROPDOWN BUY/SELL */
function dropdownBuy(){
    let sym = document.getElementById("dropdown-company").value;
    let qty = document.getElementById("dropdown-qty").value;
    buy(sym, qty);
}
function dropdownSell(){
    let sym = document.getElementById("dropdown-company").value;
    let qty = document.getElementById("dropdown-qty").value;
    sell(sym, qty);
}

/* -------------------------------------------
   PRICE MOVEMENT
------------------------------------------- */
const VOL = 0.007;
const TREND = 0.001;

function updatePrices(){
    companies.forEach(c=>{
        c.prev = c.price;
        let rand = (Math.random()*2 - 1) * VOL;
        c.price *= (1 + rand + TREND);
        if(c.price < 0.1) c.price = 0.1;
    });
}

/* -------------------------------------------
   CHART
------------------------------------------- */
if(history.length === 0) history.push(portfolioValue());

const ctx = document.getElementById("portfolioChart").getContext("2d");
const chart = new Chart(ctx,{
    type:"line",
    data:{
        labels: history.map((_,i)=>i),
        datasets:[{
            data: history,
            borderColor:"green",
            backgroundColor:"rgba(0,128,0,0.15)",
            fill:true,
            tension:0.2
        }]
    },
    options:{ animation:false, responsive:true }
});

function updateChart(){
    history.push(portfolioValue());
    if(history.length > 60) history.shift();
    chart.data.labels = history.map((_,i)=>i);
    chart.data.datasets[0].data = history;
    chart.update();
    save();
}

/* -------------------------------------------
   RENDER ALL
------------------------------------------- */
function renderAll(){
    renderDropdown();
    renderHeader();
    renderMarket();
    renderHoldings();
    renderPortfolioValue();
}

/* -------------------------------------------
   MAIN LOOP
------------------------------------------- */
renderAll();
updateChart();

setInterval(()=>{
    updatePrices();
    renderAll();
    updateChart();
}, 1000);
