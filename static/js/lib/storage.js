var Storage = function() {
	var WIN = window,
	localStorage = WIN.localStorage,
	isSupport = localStorage && localStorage.getItem,

	storage = {
		get: function(name) {
			return isSupport ? localStorage.getItem(name) : Cookie.get(name);
		},
		set: function(name, value) {
			return isSupport ? localStorage.setItem(name, value) : Cookie.set(name, value, 720);
		}
	};

	return storage;
}();
	