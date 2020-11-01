
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
        $("#spnTotalWorth").html(UI.formatMoney(total_worth));
        $("#spnNetGainLoss").html(UI.formatMoney(total_net_gain_loss));
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
        maxDate: 0
    });
    $("#btnAdd").on("click", (e) => {
        UI.AddTicker();
    });
    UI.ClearForm();
    Storage.InitiateDB();        
});