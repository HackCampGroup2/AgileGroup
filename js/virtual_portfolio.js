const INITIAL_CASH = 1000;

const LS = {
    cash: "vp_cash",
    holdings: "vp_holdings",
    points: "vp_points"
};

let cash = parseFloat(localStorage.getItem(LS.cash)) || INITIAL_CASH;
let holdings = JSON.parse(localStorage.getItem(LS.holdings)) || {};
let points = parseInt(localStorage.getItem(LS.points)) || 0;

let companies = [
    { symbol: "AAPL", name: "Apple", price: 170, prev:170 },
    { symbol: "MSFT", name: "Microsoft", price: 320, prev:320 },
    { symbol: "GOOGL", name: "Google", price:130, prev:130 },
    { symbol: "AMZN", name: "Amazon", price:110, prev:110 },
    { symbol: "TSLA", name: "Tesla", price:230, prev:230 },
    { symbol: "NVDA", name: "NVIDIA", price:480, prev:480 }
];

const gbp = n => "£" + n.toFixed(2);

function save(){
    localStorage.setItem(LS.cash, cash);
    localStorage.setItem(LS.holdings, JSON.stringify(holdings));
    localStorage.setItem(LS.points, points);
}

function portfolioValue(){
    let total = cash;
    for (let s in holdings) {
        let c = companies.find(x => x.symbol === s);
        total += holdings[s].qty * c.price;
    }
    return total;
}

/* -------------------------------------------
   RENDER UI
------------------------------------------- */
function renderDropdown(){
    const sel = document.getElementById("dropdown-company");

    // Save the current selected value
    const current = sel.value;

    sel.innerHTML = "";
    companies.forEach(c=>{
        sel.innerHTML += `<option value="${c.symbol}">${c.name} (${c.symbol})</option>`;
    });

    // Restore the previously selected value if it still exists
    if (current) sel.value = current;
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
            <td class="${cls}">${diff >= 0 ? "+" : ""}${diff.toFixed(2)} (${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%)</td>
            <td><button class="btn btn-success btn-sm" onclick="buy('${c.symbol}',1)">Buy</button></td>
        </tr>`;
    });
}

function renderHoldings(){
    let tb = document.querySelector("#portfolio-table tbody");
    tb.innerHTML = "";

    if (Object.keys(holdings).length === 0) {
        tb.innerHTML = `<tr><td colspan="6" class="text-muted">No assets yet.</td></tr>`;
        return;
    }

    for (let sym in holdings) {
        let h = holdings[sym];
        let c = companies.find(x=>x.symbol === sym);

        let pct = ((c.price - h.avg) / h.avg) * 100;
        let pctCls = pct > 0 ? "text-success" : pct < 0 ? "text-danger" : "";

        tb.innerHTML += `
        <tr>
            <td>${c.name}</td>
            <td>${h.qty}</td>
            <td>${gbp(c.price)}</td>
            <td>${gbp(h.qty * c.price)}</td>
            <td class="${pctCls}">${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%</td>
            <td><button class="btn btn-warning btn-sm" onclick="sell('${sym}',1)">Sell</button></td>
        </tr>`;
    }
}

/* -------------------------------------------
   BUY / SELL
------------------------------------------- */
function buy(sym, qty){
    qty = parseInt(qty);
    let c = companies.find(x=>x.symbol === sym);
    let cost = qty * c.price;

    if(cost > cash){ alert("Not enough cash!"); return; }

    cash -= cost;

    if(!holdings[sym]){
        holdings[sym] = { qty, avg: c.price };
    } else {
        let h = holdings[sym];
        let newQty = h.qty + qty;
        h.avg = ((h.avg * h.qty) + (c.price * qty)) / newQty;
        h.qty = newQty;
    }

    points += 5;
    save();
    renderAll();
}

function sell(sym, qty){
    qty = parseInt(qty);

    if(!holdings[sym] || holdings[sym].qty < qty) return;

    let c = companies.find(x=>x.symbol === sym);

    holdings[sym].qty -= qty;
    cash += qty * c.price;

    if(holdings[sym].qty <= 0) delete holdings[sym];

    points += 3;
    save();
    renderAll();
}

function dropdownBuy(){
    buy(document.getElementById("dropdown-company").value, document.getElementById("dropdown-qty").value);
}
function dropdownSell(){
    sell(document.getElementById("dropdown-company").value, document.getElementById("dropdown-qty").value);
}

/* -------------------------------------------
   LIVE PRICE MOVEMENT
------------------------------------------- */
const VOL = 0.008;
const TREND = 0.001;

function updatePrices(){
    companies.forEach(c=>{
        c.prev = c.price;
        let movement = (Math.random()*2 - 1) * VOL + TREND;
        c.price *= (1 + movement);

        if(c.price < 0.5) c.price = 0.5;
    });
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
window.onload = renderAll;

setInterval(()=>{
    updatePrices();
    renderAll();
}, 1000);
