FX.prototype.init = function() {

    let fetchedFromDatabase = false;
    let url;

    // Retrieve currencies to compare against from database
    offlineFXDatabase.retrieve('CompareCurrencies')
    .then((currenciesResponse) => {

        // If no compare currencies exist, handle empty state
        if ( currenciesResponse.length == 0 ) {
            this._handleEmptyState();
            return Promise.reject({displayErrorMessage: false});
        }

        // If currencies exist, build API url
        const compareCurrencies = currenciesResponse.map( (currency) => currency.currency ).join(',');
        url = `${API_URL}&currencies=${compareCurrencies}`;
        return Promise.resolve(url);
    })
    .then((url) => {
        // Find item in database
        return offlineFXDatabase.retrieve('FX', 'url', url);
    })
    .then((dbResponse ) => {

        // If in database, return database response
        if ( dbResponse.length > 0 ) {
            fetchedFromDatabase = true;
            return Promise.resolve( dbResponse[0] );
        }
        
        // Fetch from API and save to database
        return this._fetchAndSave(url);
    })
    .then((data) => {
        // Create item on page
        return this._createFXObjects(data);
    })
    .then(() => {
        // If from database, do background update
        if ( fetchedFromDatabase ) { return this._doBackgroundUpdate(url) }
    })
    .catch((err) => {
        if ( err.displayErrorMessage === false ) { return; }
        new Toast('error', "Uh oh, there was an error fetching information");
    });

};