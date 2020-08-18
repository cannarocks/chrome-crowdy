"use-strict";

var arrays = document.querySelectorAll("#list pre");

function getPrePiece(obj) {
	return "<span type=" + obj.type + " style='display:block;'>" + JSON.stringify(obj,null,2) + "<hr></span>";
}

function update(changes, namespace) {
	for (let key in changes)  {
		arrays.forEach( pre => {
			if (key.startsWith(pre.id)) {
				if (changes[key].newValue) 
					pre.innerHTML += getPrePiece(changes[key].newValue);
				else if (changes[key].oldValue)
					pre.innerHTML = pre.id + ": ";
				else
					pre.innerHTML += getPrePiece(changes[key]);
			}
		});
	};
}

chrome.storage.onChanged.addListener(update);
chrome.storage.local.get(null, function(storage) {
	update(storage,null);
});