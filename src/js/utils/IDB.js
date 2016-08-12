function IDB() {
    this._dbPromise = this._setupDB();
}

IDB.prototype._setupDB = function() {
    if (!navigator.serviceWorker) { return Promise.reject(); }

    return idb.open('offlineFX', 1, function(upgradeDb) {

        const FXStore = upgradeDb.createObjectStore('FX', {
          keyPath: 'clientTimestamp'
        });
        FXStore.createIndex('url', 'url');

        const currenciesStore = upgradeDb.createObjectStore('CompareCurrencies', {
          keyPath: 'currency'
        });
        
    });
};

IDB.prototype.add = function(dbStore, data) {
    return this._dbPromise.then( function(db) {
        const tx = db.transaction(dbStore, 'readwrite');
        const store = tx.objectStore(dbStore);
        store.put(data);
        return tx.complete;
    });
};

IDB.prototype.remove = function(dbStore, dbIndex, searchKey, searchValue) {
    return this._dbPromise.then( function(db) {
        const tx = db.transaction(dbStore, 'readwrite');
        const store = tx.objectStore(dbStore);

        if ( !dbIndex ) { return store.openCursor(); }
        const index = store.index(dbIndex);
        return index.openCursor();
    })
    .then(function deleteItem(cursor) {
        if (!cursor) return;
        if ( cursor.value[searchKey] == searchValue ) {
            cursor.delete();
        }
        return cursor.continue().then(deleteItem);
    })
    .then(function() { return true; })
};

IDB.prototype.retrieve = function(dbStore, dbIndex, check) { 
    return this._dbPromise.then( function(db) {
        const tx = db.transaction(dbStore);
        const store = tx.objectStore(dbStore);

        if ( !dbIndex ) { return store.getAll(); }

        const index = store.index(dbIndex);
        return index.getAll(check);
    });
};
