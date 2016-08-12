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