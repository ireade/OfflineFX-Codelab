/* **************************
    
    OFFLINE FX 
  
************************** */

/* **************
    Key Elements
*************** */

const API_URL = 'https://www.apilayer.net/api/live?access_key=22792a6f299a6da5430ab12df828e169&format=1';
const fxList = document.getElementById('fxList');
const compareCurrencySelectEl = document.getElementById('compare_currency');

/* **************
    Dialog
*************** */

const myDialog = new Dialog(document.querySelector('.dialog'), document.querySelector('.dialog-overlay'));
myDialog.addEventListeners('.open-dialog', '.close-dialog');


/* **************
    Database
*************** */

const offlineFXDatabase = new IDB();


/* **************
    FX
*************** */

const myFX = new FX();
myFX.init();


/* **************
    Currencies Array
*************** */

let currencyInformation;
fetch('./data/Common-Currency.json')
.then( (response) => response.json() )
.then( (response) => { 
    currencyInformation = response;
    for (let key in response) {
        if ( key !== myFX.baseCurrency ) { 
            const option = `<option value="${response[key].code}">${response[key].name_plural}</option>`
            compareCurrencySelectEl.insertAdjacentHTML('afterbegin', option);
        }
    }
}); 






/* **************
    Service Worker

    @todo Step 4 - Register the Service Worker

*************** */








/* **************
    Add Currency Form
*************** */

const addCurrencyForm = document.getElementById('addCurrencyForm');
addCurrencyForm.addEventListener('submit', function(e) {

    e.preventDefault();

    offlineFXDatabase.add('CompareCurrencies', {
        currency: document.getElementById('compare_currency').value
    }).then( () => {
        myFX.init();
        new Toast('success', "New currency added!");
    }).catch( (err) => {
        new Toast('error', "There was an error adding this currency. Please try again");
    });

});


