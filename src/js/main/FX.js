function FX() {
  this.baseCurrency = 'USD';
  this.listEl = fxList;
}

FX.prototype._createFXCard = function(fx) {

  const id = `${fx.base.currency}-${fx.compare.currency}`;
  const card = `<li class="fx" id="${id}">
                    <div class="rates">
                        <div class="rate rate__base">
                            <span class="fx__currency">${ currencyInformation[fx.base.currency].name_plural }</span>
                            <span class="fx__amount">
                              ${ currencyInformation[fx.base.currency].symbol }
                              ${ fx.base.amount }
                            </span>
                        </div>
                        <div class="rate rate__compare">
                            <span class="fx__currency">${ currencyInformation[fx.compare.currency].name_plural }</span>
                            <span class="fx__amount">
                              ${ currencyInformation[fx.compare.currency].symbol }
                              ${ fx.compare.amount }
                            </span>
                        </div>
                    </div>
                    <div class="converter">
                        <div class="exchange exchange__base" data-rate="${ fx.base.amount }">
                            <input type="number" value="${ fx.base.amount }" data-parent-id="${id}"/>
                        </div>
                        <div class="exchange exchange__compare" data-rate="${ fx.compare.amount }">
                            <input type="number" value="${ fx.compare.amount }" data-parent-id="${id}"/>
                        </div>
                    </div>
                    <div class="actions">
                        <div>
                            <button type="button" class="btn btn-convert">
                                <img src="./img/icon-convert.png" alt="" />
                                Convert
                            </button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-remove">
                                <img src="./img/icon-delete.png" alt="" />
                                Remove
                            </button>
                        </div>
                    </div>
                </li>`;
  fxList.insertAdjacentHTML('afterbegin', card);
};

FX.prototype._addEventListeners = function() {

    const calculate = (el, elToUpdate) => {
        const value = parseFloat(el.value);
        const exchangeRate = parseFloat( document.querySelector(`#${el.dataset.parentId} .exchange__compare`).dataset.rate );

        switch(elToUpdate) {
            case 'compare':
                var el = document.querySelector(`#${el.dataset.parentId} .exchange__${elToUpdate} input`);
                el.value = value * exchangeRate;
                break;

            case 'base':
                var el = document.querySelector(`#${el.dataset.parentId} .exchange__${elToUpdate} input`);
                el.value = value / exchangeRate;
                break;

            default:
                break;
        }
    }; // end calculate

    const removeCurrency = (currency) => {
        currency = currency.split('-')[1];
        offlineFXDatabase.remove('CompareCurrencies', null, 'currency', currency)
        .then(() => myFX.init() );
    };

    const items = document.querySelectorAll('.fx');
    items.forEach(function(item) {

        const id = item.getAttribute('id');

        const inputBase = document.querySelector(`#${id} .exchange__base input`);
        inputBase.addEventListener('keyup', function(e) {
            calculate(e.target, 'compare');
        })

        const inputCompare = document.querySelector(`#${id} .exchange__compare input`);
        inputCompare.addEventListener('keyup', function(e) {
            calculate(e.target, 'base');
        })

        const convertButton = document.querySelector(`#${id} .btn-convert`);
        convertButton.addEventListener('click', function(e) {
            document.querySelector(`#${id} .converter`).classList.toggle('open');
        })

        const removeButton = document.querySelector(`#${id} .btn-remove`);
        removeButton.addEventListener('click', function(e) {
            removeCurrency(id);
        })

    });

};


FX.prototype._createFXObjects = function(data) {

    let lastUpdated = data.clientTimestamp;

    lastUpdated = moment(lastUpdated).calendar(null, {
        sameDay: '[Today at] h:mma',
        nextDay: '[Tomorrow at] h:mma',
        nextWeek: '[Next] dddd [at] h:mma',
        lastDay: '[Yesterday at] h:mma',
        lastWeek: '[Last] dddd [at] h:mma',
        sameElse: '[on] dddd Do MMMM [at] h:mma'
    });

    const lastUpdatedEl = document.querySelector('.last-updated');
    lastUpdatedEl.innerHTML = `Last updated: ${lastUpdated}`;

    
    this.listEl.innerHTML = '';
    const currencies = [];

    for (let key in data.quotes) {
        currencies.push({
            base: {
                currency: this.baseCurrency,
                amount: '1'
            },
            compare: {
                currency: key.split(this.baseCurrency)[1],
                amount: parseInt(data.quotes[key]).toFixed(2)
            }
        });
    }

    currencies.map( this._createFXCard );
    this._addEventListeners();
}



FX.prototype._handleEmptyState = function() {
    new Toast('success', "Looks like you haven't set any currencies yet. Press the + to get started!");
}


FX.prototype._fetchAndSave = function(url, firstRemoveFromDatabase) {
    return fetch(url)
    .then( (fetchedResponse) => fetchedResponse.json() )
    .then( (fetchedResponse) => {

        fetchedResponse.url = url;
        fetchedResponse.clientTimestamp = new Date().getTime();

        let sequence = Promise.resolve();

        if ( firstRemoveFromDatabase ) {
            sequence = sequence.then(() => {
                return offlineFXDatabase.remove('FX', 'url', 'url', url);
            })
        }

        sequence = sequence.then(() => {
            return offlineFXDatabase.add('FX', fetchedResponse)
            .then( () => {
                return Promise.resolve(fetchedResponse);
            })
        });

        return sequence;
    });
};


FX.prototype._doBackgroundUpdate = function(url) {
    console.log("about to do background update", url);
    this._fetchAndSave(url, true)
    .then( (data) => {
        console.log("displaying info from background update");
        return this._createFXObjects(data);
    })
    .catch( () => {
        console.log("looks like there's no wifi connnection to update in background");
    });
}




FX.prototype.init = function() {

    let fetchedFromDatabase = false;
    let url;

    offlineFXDatabase.retrieve('CompareCurrencies')
    .then((currenciesResponse) => {

        if ( currenciesResponse.length == 0 ) {
            this._handleEmptyState();
            return Promise.reject({displayErrorMessage: false});
        }

        const compareCurrencies = currenciesResponse.map( (currency) => currency.currency ).join(',');
        url = `${API_URL}&currencies=${compareCurrencies}`;
        return Promise.resolve(url);
    })
    .then((url) => {

        // @todo Step 3 - Start with a Fast First Load

        return this._fetchAndSave(url);
    })
    .then((data) => {
        return this._createFXObjects(data);
    })
    .then(() => {
        if ( fetchedFromDatabase ) { return this._doBackgroundUpdate(url) }
    })
    .catch((err) => {
        if ( err.displayErrorMessage === false ) { return; }
        new Toast('error', "Uh oh, there was an error fetching information");
    });


};
