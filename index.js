const proxyurl = "https://cors-anywhere.herokuapp.com/";

let yahoo_quote_url = {
    url: "https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?",
    query: {
        "region": "US",
        "lang": "en",
        "symbols": ""
    },
    headers: {
        "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
        "x-rapidapi-key": "",
        "useQueryString": true
    }
};

let yahoo_history_url = {
    url: "https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/spark?",
    query: {
        "range": "",
        "symbols": ""
    },
    headers: {
        "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
        "x-rapidapi-key": "",
        "useQueryString": true
    }
};

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

let AddTicker = () => {
    let saved_ticker = new Saved_Ticker("", $( "#txtTicker" ).val(), $( "#txtDatePurchased" ).datepicker( "getDate" ).getTime()/1000, $( "#txtAmountInvested" ).val());
    Saved_Tickers.push(saved_ticker);
    ClearForm();
}

let Calculate = () => {
    let ticker_list = (Saved_Tickers.reduce((list, item) => {
                        return (list === "") ? `${item.value}` : `${list},${item.value}`;
                    }, ""));
    let min_purchase_date = (Saved_Tickers.reduce((min_date, item) => {
                            return (min_date < item.purchasedDate) ? min_date: item.purchasedDate;
                        }, new Date()));
    let range = "";
    let diffDays = Math.floor((((new Date()).getTime() / 1000) - min_purchase_date) / (3600 * 24));
    range_values.forEach(element => {
        if((diffDays <= element.days && range == ""))
            range = element.value;
    });

    GetHistoryJSON(yahoo_history_url, ticker_list, range);
}

let GetHistoryJSON = (url_obj, symbols, range) => {
    let url = new URL(url_obj.url);
    url_obj.query.range = range;
    url_obj.query.symbols = symbols;
    url.search = new URLSearchParams(url_obj.query).toString();
    console.log(url);
    var promise = fetch(url.toString(), {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
            "x-rapidapi-key": ""
        }
    })
    .then(response => { return response.json(); })
    .then(json => {
        console.log(json);
    });

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": url.toString(),
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
            "x-rapidapi-key": ""
        }
    }
    
    $.ajax(settings).done(function (response) {
        console.log(response);
    });
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
    //console.log(FormattedDate(1590984000));

    fetch("https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/spark?range=5d&symbols=AAPL%252CMSFT", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
		"x-rapidapi-key": ""
	}
})
.then(response => {
	console.log(response);
})
.catch(err => {
	console.log(err);
});


// var settings = {
// 	"async": true,
// 	"crossDomain": true,
// 	"url": "https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/spark?range=5d&symbols=AAPL%252CMSFT",
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com",
// 		"x-rapidapi-key": "03726e44d5msh28a4c8dc98c3631p1f5ecfjsnea1c5a911765"
// 	}
// }

// $.ajax(settings).done(function (response) {
// 	console.log(response);
// });


});