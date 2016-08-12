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
        return offlineFXDatabase.retrieve('FX', 'url', url);
    })
    .then((dbResponse ) => {

        if ( dbResponse.length > 0 ) {
            fetchedFromDatabase = true;
            return Promise.resolve( dbResponse[0] );
        }

        console.log("not found in db, about to fetch and save");
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