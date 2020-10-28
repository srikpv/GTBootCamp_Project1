let Tickers = [];
let Saved_Tickers = [];
let range_values = [
    {days: 1, value: "1d"},
    {days: 5, value: "5d"},
    {days: 90, value: "3mo"},
    {days: 180, value: "6mo"},
    {days: 365, value: "1y"},
    {days: 1825, value: "5y"},
    {days: 1826, value: "max"}
];

class Ticker{
    constructor(companyName, symbol){
        this.label = companyName;
        this.value = symbol;
    }
};

let Saved_Ticker = class extends Ticker{
    constructor(companyName, symbol, purchasedDate, amountInvested){
        super(companyName, symbol);
        this.purchasedDate = purchasedDate;
        this.amountInvested = amountInvested;
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

let BinarySearch = (arr, x) => { 
    let start=0, end=arr.length-1; 
    while (start<=end){ 
        let mid=Math.floor((start + end)/2); 
        if (arr[mid]===x) return mid; 
        else if (arr[mid] < x)  
             start = mid + 1; 
        else
             end = mid - 1; 
    } 
   
    return -1; 
} 

let ClosestSearch = (value, a) => {

    if(value < a[0]) {
        return a[0];
    }
    if(value > a[a.length-1]) {
        return a[a.length-1];
    }

    let lo = 0;
    let hi = a.length - 1;

    while (lo <= hi) {
        let mid = (hi + lo) / 2;

        if (value < a[mid]) {
            hi = mid - 1;
        } else if (value > a[mid]) {
            lo = mid + 1;
        } else {
            return a[mid];
        }
    }
    // lo == hi + 1
    return (a[lo] - value) < (value - a[hi]) ? a[lo] : a[hi];
}