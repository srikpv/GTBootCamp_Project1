let Tickers = [];

let total_worth = 0;
let total_net_gain_loss = 0;
let db;
//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB;
    
//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction;

let Ticker = class{
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

class Storage {
    
    static InitiateDB = () => {
      var request = window.indexedDB.open("Portfolio", 1);
    
      request.onerror = function(event) {
          //console.log("error: ");
      };
      
      request.onsuccess = function(event) {
          db = request.result;
          Storage.GetTickersFromDB();
          //console.log("success: "+ db);
      };
  
      request.onupgradeneeded = function(event) {
          var db = event.target.result;
          var objectStore = db.createObjectStore("tickers", {keyPath: 'id', autoIncrement:true});
         
       };
    }

    static RemoveTickerFromDB = (id) =>{

        var request = db.transaction(["tickers"], "readwrite")
         .objectStore("tickers")
         .delete(id);
         
         request.onsuccess = function(event) {
            Storage.GetTickersFromDB();
         };
    }

    static GetTickersFromDB() {
        $("#tBody").html("");
        total_worth = 0;
        total_net_gain_loss = 0;
        var objectStore = db.transaction("tickers").objectStore("tickers");
        let count = 0;
        objectStore.openCursor().onsuccess = function(event) {
           var cursor = event.target.result;
           
           if (cursor) {
               //console.log(cursor);
               count++;
               UI.AddTableRow(cursor.value.id,
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
           if(count === 0){
                    total_worth = 0;
                    total_net_gain_loss = 0;
                    UI.ShowRunningTotal();
            }
           
        };


    }

    static AddTickerToDB(investment) {

        var request = db.transaction(["tickers"], "readwrite")
        .objectStore("tickers")
        .add(investment);
        
        request.onsuccess = function(event) {
   
            UI.AddTableRow(event.target.result,
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
}

class API {

    static API_Key(){
        return "9f9b1b2ec07c0272bcf74c8c6939d83586088573";
    }

    static History_URL(){
        return "https://api.tiingo.com/tiingo/daily/XXXXX/prices?startDate=YYYYY&endDate=ZZZZZ&token=" + API.API_Key();
    }

    static Current_URL(){
        return "https://api.tiingo.com/tiingo/daily/XXXXX/prices?token=" + API.API_Key();
    }

    static GetStockPrices(saved_ticker){
        
        let endDate = new Date(Number(saved_ticker.purchasedDate));
        endDate.setDate(saved_ticker.purchasedDate.getDate() + 5);
        endDate = (endDate > (new Date())) ? (new Date()) : endDate;

        let history_url = API.History_URL();
        let current_url = API.Current_URL();

        let promise1 = fetch(history_url.replace(/XXXXX/i,saved_ticker.value).replace(/YYYYY/i,UI.FormatDate(saved_ticker.purchasedDate)).replace(/ZZZZZ/i,UI.FormatDate(endDate)))
            .then(response => response.json())
            .then(data => { 
                saved_ticker.PurchasePrice(data[0].adjClose);

                let promise2 = fetch(current_url.replace(/XXXXX/i,saved_ticker.value))
                    .then(response1 => response1.json())
                    .then(data1 => { 
                        saved_ticker.CurrentPrice(data1[0].adjClose);
                        Storage.AddTickerToDB(saved_ticker);
                        UI.ClearForm();
                    })
            }).catch((error) => {
                console.log("error");
                UI.ClearForm();
                })
    }
}


class UI {
    static ClearForm = () =>{
        $( "#txtTicker" ).val("");
        $( "#txtDatePurchased" ).val("");
        $( "#txtAmountInvested" ).val("");
        $( "#txtTicker" ).focus();
    }; 
    static FormatDate = (date) => {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    };
    static AddTableRow = (id, company, symbol, date_purchased, amount_invested, current_value, net_gain_loss, percentage) => {
        let tr = $("<tr>").appendTo($("#tBody"));
        $("<td>").appendTo(tr).html(company);
        $("<td>").appendTo(tr).html(symbol);
        $("<td>").appendTo(tr).html(UI.FormatDate(date_purchased));
        $("<td>").appendTo(tr).html(UI.formatMoney(amount_invested));
        $("<td>").appendTo(tr).html(UI.formatMoney(current_value));
        $("<td>").appendTo(tr).html(UI.formatMoney(net_gain_loss));
        $("<td>").appendTo(tr).html(percentage+"%");
        $("<td>").appendTo(tr).html(`<i class='fa fa-trash' style='cursor: pointer;' onClick='Storage.RemoveTickerFromDB(${id})'></i>`);
    
        total_worth += current_value;
        total_net_gain_loss += net_gain_loss;
        UI.ShowRunningTotal();
    }
    static ShowRunningTotal = () => {
        $("#spnTotalWorth").html(UI.formatMoney(total_worth + total_worth_crypto));
        $("#spnNetGainLoss").html(UI.formatMoney(total_net_gain_loss + total_net_gain_loss_crypto));
    }
    static AddTicker = () => {
        let symbol = $( "#txtTicker" ).val();
        let datePurchased = $( "#txtDatePurchased" ).datepicker( "getDate" );
        let amountInvested = $( "#txtAmountInvested" ).val();
        let saved_ticker = new Investment(UI.GetCompanyName(Tickers, symbol), symbol, datePurchased, amountInvested);

        API.GetStockPrices(saved_ticker);
    }
    static AutoComplete = () => {
        $.getJSON("Tickers.json", (json) => {
            $.map(json.results, (result) => {
                Tickers.push(new Ticker(result.companyName, result.ticker));
            });
            $( function() {
                $( "#txtTicker" ).autocomplete({
                    source: Tickers
                });
            } );
        });
    }; 
    static formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") =>{
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
    
    static GetCompanyName = (ticker_list, symbol) => { 
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
}



$(document).ready(() => {
    UI.AutoComplete();
    $("#txtDatePurchased").datepicker({
        maxDate: -1
    });
    $("#btnAdd").on("click", (e) => {
        UI.AddTicker();
    });
    UI.ClearForm();
    Storage.InitiateDB();        
});