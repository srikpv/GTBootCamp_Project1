let savedCoins=[];
let total_worth_crypto = 0;
let total_net_gain_loss_crypto = 0;

let FormatDate_Crypto = (date) => {
    strDate = new Date(date);
    return `${strDate.getFullYear()}-${strDate.getMonth()+1}-${strDate.getDate()}`;
}

let ClearForm_Crypto = () =>{
    $( "#cryptoSearch" ).val("");
    $( "#cryptoSearchAmount" ).val("");
    $( "#cryptoPurchasedDate" ).val("");
    $( "#cryptoPrice" ).val("");
};

let AddTableRow_Crypto = (coin, number_of_coin, date_purchased, amount_invested, current_value, net_gain_loss, percentage) => {
    console.log("coin "+coin+" date "+date_purchased);
    let tr = $("<tr>").appendTo($("#tBodyCrypto"));
    $("<td>").appendTo(tr).html(coin);
    $("<td>").appendTo(tr).html(number_of_coin);
    $("<td>").appendTo(tr).html(FormatDate_Crypto(date_purchased));
    $("<td>").appendTo(tr).html(UI.formatMoney(amount_invested));
    $("<td>").appendTo(tr).html(UI.formatMoney(current_value));
    $("<td>").appendTo(tr).html(UI.formatMoney(net_gain_loss));
    $("<td>").appendTo(tr).html(percentage+"%");

    total_worth_crypto += current_value;
    total_net_gain_loss_crypto += net_gain_loss;
    UI.ShowRunningTotal();
}

let SaveCoin = (coin, numberOfCoin, datePurchased, purchasePrice) => {
    let saveCoin = {
        "coin" : coin,
        "numberOfCoin" : numberOfCoin,
        "datePurchased" : datePurchased,
        "purchasePrice" : purchasePrice
    }

    savedCoins.push(saveCoin);   
    localStorage.setItem("crypto", JSON.stringify(savedCoins)); 
 }

let AddCoin = async () => {
    let coin = $( "#cryptoSearch" ).val().toUpperCase();
    let numberOfCoin = $( "#cryptoSearchAmount" ).val();
    let datePurchased = $( "#cryptoPurchasedDate" ).datepicker( "getDate" );
    let purchasePrice = $( "#cryptoPrice" ).val();

    let APIKey = "aa5219cddemshfbc4ace98ff85cfp19bf66jsndf136b867df4";
    let price;

    // URL for coin  
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://coinranking1.p.rapidapi.com/coins",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coinranking1.p.rapidapi.com",
            "x-rapidapi-key": "aa5219cddemshfbc4ace98ff85cfp19bf66jsndf136b867df4"
        }
    }
    var coinData=[];  
    // ajax call to get all coins
    await $.ajax(settings).done(function (response) {
            console.log(response);
        coinData = response.data.coins;   
    });

    for (i=0; i<coinData.length; i++) {               
        if (coin === coinData[i].symbol){
            price = coinData[i].price;
            
        }
    }
    console.log( coin + "has current price: " + price);

    AddTableRow_Crypto(coin,
        numberOfCoin,
        datePurchased,
        numberOfCoin * purchasePrice,
        (price * numberOfCoin),
        (price * numberOfCoin - numberOfCoin * purchasePrice),
        (((price * numberOfCoin - numberOfCoin * purchasePrice)/(numberOfCoin * purchasePrice))*100).toFixed(2)
    );

    SaveCoin(coin,numberOfCoin,datePurchased, purchasePrice);
    ClearForm_Crypto();
     
}

let ShowCoin = async (coin, numberOfCoin, datePurchased, purchasePrice) => {
    let APIKey = "aa5219cddemshfbc4ace98ff85cfp19bf66jsndf136b867df4";
    let price;
    
    // URL for coin  
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://coinranking1.p.rapidapi.com/coins",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coinranking1.p.rapidapi.com",
            "x-rapidapi-key": "aa5219cddemshfbc4ace98ff85cfp19bf66jsndf136b867df4"
        }
    }
    var coinData=[];  
    // ajax call to get all coins
    await $.ajax(settings).done(function (response) {
        coinData = response.data.coins;   
    });

    for (i=0; i<coinData.length; i++) {               
        if (coin === coinData[i].symbol){
            price = coinData[i].price;
            
        }
    }

    AddTableRow_Crypto(coin,
        numberOfCoin,
        datePurchased,
        numberOfCoin * purchasePrice,
        (price * numberOfCoin),
        (price * numberOfCoin - numberOfCoin * purchasePrice),
        (((price * numberOfCoin - numberOfCoin * purchasePrice)/(numberOfCoin * purchasePrice))*100).toFixed(2)
    );
     
}

$(document).ready(() => {
    $("#cryptoPurchasedDate").datepicker({
        maxDate: 0
    });
    $("#btnAddCrypto").on("click", (e) => {
            
        let coin = $( "#cryptoSearch" ).val().toUpperCase();
        let numberOfCoin = $( "#cryptoSearchAmount" ).val();
        let datePurchased = $( "#cryptoPurchasedDate" ).datepicker( "getDate" );
        let purchasePrice = $( "#cryptoPrice" ).val();
        let endDate = new Date(Number(datePurchased));
        AddCoin();
    });
    ClearForm_Crypto();

    // Refresh the table with local storage

    let storedCoins = JSON.parse(localStorage.getItem("crypto"));
    if (storedCoins!=null) {
        savedCoins = storedCoins;
        console.log ("length",savedCoins.length);
        for (i=0; i<savedCoins.length; i++) {
        
            ShowCoin(savedCoins[i].coin,
                savedCoins[i].numberOfCoin,
                savedCoins[i].datePurchased,
                savedCoins[i].purchasePrice);
        }
    }
//    $("#btnCalculate").on("click", (e) => {
//      Calculate();
    });
                


