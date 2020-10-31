const history_url = "https://api.tiingo.com/tiingo/daily/XXXXX/prices?startDate=YYYYY&endDate=ZZZZZ&token=9f9b1b2ec07c0272bcf74c8c6939d83586088573";
const current_url = "https://api.tiingo.com/tiingo/daily/XXXXX/prices?token=9f9b1b2ec07c0272bcf74c8c6939d83586088573";

let FormatDate = (date) => {
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

let AutoComplete = () => {
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
}

let ClearForm = () =>{
    $( "#txtTicker" ).val("");
    $( "#txtDatePurchased" ).val("");
    $( "#txtAmountInvested" ).val("");
    $( "#txtTicker" ).focus();
};

let AddTableRow = (company, symbol, date_purchased, amount_invested, current_value, net_gain_loss, percentage) => {
    let tr = $("<tr>").appendTo($("#tBody"));
    $("<td>").appendTo(tr).html(company);
    $("<td>").appendTo(tr).html(symbol);
    $("<td>").appendTo(tr).html(FormatDate(date_purchased));
    $("<td>").appendTo(tr).html(formatMoney(amount_invested));
    $("<td>").appendTo(tr).html(formatMoney(current_value));
    $("<td>").appendTo(tr).html(formatMoney(net_gain_loss));
    $("<td>").appendTo(tr).html(percentage+"%");
}

let SaveTicker = (saved_ticker) => {
    Saved_Tickers.push(saved_ticker);
    
}

let AddTicker = () => {
    let symbol = $( "#txtTicker" ).val();
    let datePurchased = $( "#txtDatePurchased" ).datepicker( "getDate" );
    let amountInvested = $( "#txtAmountInvested" ).val();
    let endDate = new Date(Number(datePurchased));
    endDate.setDate(datePurchased.getDate() + 5);

    let saved_ticker = new Investment(GetCompanyName(Tickers, symbol), symbol, datePurchased, amountInvested);
    console.log(saved_ticker);
    let promise1 = fetch(history_url.replace(/XXXXX/i,symbol).replace(/YYYYY/i,FormatDate(datePurchased)).replace(/ZZZZZ/i,FormatDate(endDate)))
            .then(response => response.json())
            .then(data => { 
                saved_ticker.PurchasePrice(data[0].adjClose);

                let promise2 = fetch(current_url.replace(/XXXXX/i,symbol))
                    .then(response1 => response1.json())
                    .then(data1 => { 
                        saved_ticker.CurrentPrice(data1[0].adjClose);
                        
                        AddTableRow(saved_ticker.label,
                            saved_ticker.value,
                            saved_ticker.purchasedDate,
                            saved_ticker.amountInvested,
                            (saved_ticker.currentPrice * saved_ticker.quantity),
                            ((saved_ticker.currentPrice * saved_ticker.quantity) - saved_ticker.amountInvested),
                            (((saved_ticker.currentPrice * saved_ticker.quantity) - saved_ticker.amountInvested)/saved_ticker.amountInvested*100).toFixed(2));
                        ClearForm();
                    })
            }).catch((error) => {
                console.log("error");
                ClearForm();
                })
    
}



$(document).ready(() => {
    AutoComplete();
    $("#txtDatePurchased").datepicker({
        maxDate: 0
    });
    $("#btnAdd").on("click", (e) => {
        AddTicker();
    });
    ClearForm();
    $("#btnCalculate").on("click", (e) => {
        Calculate();
    });
    //

    // fetch(current_url.replace(/XXXXX/i,"MSFT"))
    //     .then(response => response.json())
    //     .then(data => console.log(data));
                    
});



// let yahoo_quote_url = {
//     url: "https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?",
//     query: {
//         "region": "US",
//         "lang": "en",
//         "symbols": ""
//     },
//     headers: {
//         "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
//         "x-rapidapi-key": "",
//         "useQueryString": true
//     }
// };

// let yahoo_history_url = {
//     url: "https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/spark?",
//     query: {
//         "range": "",
//         "symbols": ""
//     },
//     headers: {
//         "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
//         "x-rapidapi-key": "",
//         "useQueryString": true
//     }
// };
// let Calculate = () => {
//     let ticker_list = (Saved_Tickers.reduce((list, item) => {
//                         return (list === "") ? `${item.value}` : `${list},${item.value}`;
//                     }, ""));
//     let min_purchase_date = (Saved_Tickers.reduce((min_date, item) => {
//                             return (min_date < item.purchasedDate) ? min_date: item.purchasedDate;
//                         }, new Date()));
//     let range = "";
//     let diffDays = Math.floor((((new Date()).getTime() / 1000) - min_purchase_date) / (3600 * 24));
//     range_values.forEach(element => {
//         if((diffDays <= element.days && range == ""))
//             range = element.value;
//     });

//     GetHistoryJSON(yahoo_history_url, ticker_list, range);
// }