function Dialog(dialogEl, overlayEl) {

	this.dialogEl = dialogEl;
	this.overlayEl = overlayEl;
	this.focusedElBeforeOpen;

	var focusableEls = this.dialogEl.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
	this.focusableEls = Array.prototype.slice.call(focusableEls);

	this.firstFocusableEl = this.focusableEls[0];
	this.lastFocusableEl = this.focusableEls[ this.focusableEls.length - 1 ];

	this.close();
}


Dialog.prototype.open = function() {

	var Dialog = this;

	this.dialogEl.removeAttribute('aria-hidden');
	this.overlayEl.removeAttribute('aria-hidden');

	this.focusedElBeforeOpen = document.activeElement;

	this.dialogEl.addEventListener('keydown', function(e) {
		Dialog._handleKeyDown(e);
	});

	this.overlayEl.addEventListener('click', function() {
		Dialog.close();
	});

	this.firstFocusableEl.focus();
};

Dialog.prototype.close = function() {

	this.dialogEl.setAttribute('aria-hidden', true);
	this.overlayEl.setAttribute('aria-hidden', true);

	if ( this.focusedElBeforeOpen ) {
		this.focusedElBeforeOpen.focus();
	}
};


Dialog.prototype._handleKeyDown = function(e) {

	var Dialog = this;
	var KEY_TAB = 9;
	var KEY_ESC = 27;

	function handleBackwardTab() {
		if ( document.activeElement === Dialog.firstFocusableEl ) {
			e.preventDefault();
			Dialog.lastFocusableEl.focus();
		}
	}
	function handleForwardTab() {
		if ( document.activeElement === Dialog.lastFocusableEl ) {
			e.preventDefault();
			Dialog.firstFocusableEl.focus();
		}
	}

	switch(e.keyCode) {
	case KEY_TAB:
		if ( Dialog.focusableEls.length === 1 ) {
			e.preventDefault();
			break;
		} 
		if ( e.shiftKey ) {
			handleBackwardTab();
		} else {
			handleForwardTab();
		}
		break;
	case KEY_ESC:
		Dialog.close();
		break;
	default:
		break;
	}


};


Dialog.prototype.addEventListeners = function(openDialogSel, closeDialogSel) {

	var Dialog = this;

	var openDialogEls = document.querySelectorAll(openDialogSel);
	for ( var i = 0; i < openDialogEls.length; i++ ) {
		openDialogEls[i].addEventListener('click', function() { 
			Dialog.open();
		});
	}

	var closeDialogEls = document.querySelectorAll(closeDialogSel);
	for ( var i = 0; i < closeDialogEls.length; i++ ) {
		closeDialogEls[i].addEventListener('click', function() {
			Dialog.close();
		});
	}

};




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

function Toast(type, message, customButtonText, customButtonFunction) {
    this.toastContainerEl = document.querySelector('.toast-container');
    this.toastEl = document.querySelector('.toast');
    this._open(type, message, customButtonText, customButtonFunction);
}

Toast.prototype._close = function() {
    this.toastContainerEl.classList.remove('open');   
}

Toast.prototype._open = function(type, message, customButtonText, customButtonFunction) {
    this.toastEl.classList.remove('success', 'warning', 'danger'); 
    this.toastEl.classList.add(type);
    this.toastContainerEl.classList.add('open');   
    this.toastEl.innerHTML = `
        <p>${message}</p>
        <button type="button" aria-label="Close Message" class="close-toast btn-bare"> Close </button>
        ${ customButtonText ? `<button type="button" aria-label="Close Message" class="toast-action btn-bare"> ${customButtonText} </button>` : `` }
    `;
    this._addEventListeners(customButtonFunction);
}

Toast.prototype._addEventListeners = function(customButtonFunction) {
    document.querySelector('.close-toast').addEventListener('click', () => {
        this._close();
    })
    if ( customButtonFunction ) {
        document.querySelector('.toast-action').addEventListener('click', customButtonFunction);
    }
}