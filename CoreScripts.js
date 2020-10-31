let Tickers = [];
let Saved_Tickers = [];
let total_worth = 0;
let net_gain_loss = 0;

class Ticker{
    constructor(companyName, symbol){
        this.label = companyName;
        this.value = symbol;
    }
};

let Investment = class extends Ticker{
    constructor(companyName, symbol, purchasedDate, amountInvested){
        super(companyName, symbol);
        this.purchasedDate = purchasedDate;
        this.amountInvested = amountInvested;
    }
    PurchasePrice(purchasePrice){
        this.purchasePrice = purchasePrice;
        this.quantity = (this.amountInvested / this.purchasePrice);
    }
    CurrentPrice(currentPrice){
        this.currentPrice = currentPrice;
    }
}

let FormattedDate = (unix_timestamp) => {
    var a = new Date(unix_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;
    return time;
}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-$" : "$";
  
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
  };

let GetCompanyName = (ticker_list, symbol) => { 
    let start=0, end=ticker_list.length-1; 
    while (start<=end){ 
        let mid=Math.floor((start + end)/2); 
        if (ticker_list[mid].value===symbol) return ticker_list[mid].label; 
        else if (ticker_list[mid].value < symbol)  
             start = mid + 1; 
        else
             end = mid - 1; 
    } 
   
    return ""; 
} 
