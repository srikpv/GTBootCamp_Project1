let Tickers = [];

let total_worth = 0;
let total_net_gain_loss = 0;
let db;

  //prefixes of implementation that we want to test
  window.indexedDB = window.indexedDB;
  
  //prefixes of window.IDB objects
  window.IDBTransaction = window.IDBTransaction;
  
  
  let InitiateDB = () => {
    var request = window.indexedDB.open("Portfolio", 1);
  
    request.onerror = function(event) {
        //console.log("error: ");
    };
    
    request.onsuccess = function(event) {
        db = request.result;
        GetTickersFromDB();
        //console.log("success: "+ db);
    };

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore("tickers", {keyPath: 'id', autoIncrement:true});
       
     };
  }
  
  

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

function RemoveTickerFromDB(id){

    var request = db.transaction(["tickers"], "readwrite")
     .objectStore("tickers")
     .delete(id);
     
     request.onsuccess = function(event) {
        GetTickersFromDB();
     };
}

function GetTickersFromDB() {
    $("#tBody").html("");
    total_worth = 0;
    total_net_gain_loss = 0;
    var objectStore = db.transaction("tickers").objectStore("tickers");
    
    objectStore.openCursor().onsuccess = function(event) {
       var cursor = event.target.result;
       //console.log(cursor);
       if (cursor) {
           //console.log(cursor);

            AddTableRow(cursor.value.id,
                cursor.value.label,
                cursor.value.value,
                cursor.value.purchasedDate,
                cursor.value.amountInvested,
                (cursor.value.currentPrice * cursor.value.quantity),
                ((cursor.value.currentPrice * cursor.value.quantity) - cursor.value.amountInvested),
                (((cursor.value.currentPrice * cursor.value.quantity) - cursor.value.amountInvested)/cursor.value.amountInvested*100).toFixed(2));
            
        
          //console.log(cursor.value);
          cursor.continue();
       }
    };
 }

 function AddTickerToDB(investment) {

     var request = db.transaction(["tickers"], "readwrite")
     .objectStore("tickers")
     .add(investment);
     
     request.onsuccess = function(event) {

        AddTableRow(event.target.result,
            investment.label,
            investment.value,
            investment.purchasedDate,
            investment.amountInvested,
            (investment.currentPrice * investment.quantity),
            ((investment.currentPrice * investment.quantity) - investment.amountInvested),
            (((investment.currentPrice * investment.quantity) - investment.amountInvested)/investment.amountInvested*100).toFixed(2));
     };
     
     request.onerror = function(event) {
        console.log("Error Adding to DB");
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

