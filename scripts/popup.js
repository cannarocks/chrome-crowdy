"use strict";

var btnRecord = document.getElementById("btn_record");
var textRecord = document.getElementById("text_record");
var imgRecord = document.getElementById("img_record");

var btnJSONpattern = document.getElementById("btn_json_pattern");
var btnJSONactual = document.getElementById("btn_json_actual");

var confirmBox = document.getElementById("confirm");
var confirmText = document.getElementById("confirm_text");
var confirmYes = document.getElementById("confirm_yes");
var confirmNo = document.getElementById("confirm_no");

var options = document.querySelectorAll("#options input");

// FUNCTIONS

function disableOptions(value) {
	for (let opt of options)
		opt.disabled = value;
}

function setStorageFromOptions() {
	chrome.storage.local.get("options", function (storage) {
		for (let opt of options)
			storage.options[opt.value] = opt.checked;

		chrome.storage.local.set({ "options":storage.options });
	});
}

function changeToRecord() {
	textRecord.innerText = "Stop recording";
	btnRecord.style.backgroundColor = "firebrick";
	imgRecord.src = "../icons/stop_record.png";
}

function initRecord() {
	textRecord.innerText = "Start recording";
	btnRecord.style.backgroundColor = "lime";
	imgRecord.src = "../icons/start_record.png";
}

// LISTENERS

btnRecord.addEventListener("click", function(event) {
	chrome.storage.local.get(["recording","options"], function(storage) {

		if (storage.recording == "none") {

			// WRITE EXTENSIONS
			if (storage.options.extensions) {
				chrome.management.getAll(function (extensions) {
					chrome.storage.local.set({ "extensions": extensions });
				});
			}

			disableOptions(true);
			storage.options.disabled = true;
			chrome.storage.local.set({ options:storage.options, recording: "recording" });
			changeToRecord();

		} 
		else if (storage.recording == "recording") {
			confirmText.innerText = "Are you sure?";
			confirmBox.classList.toggle("hidden");
			chrome.storage.local.set({ recording:"confirm" });
		} 
	});
});

btnJSONpattern.addEventListener("click", function(event) {
	chrome.tabs.create({ url:"../popup/jsonPattern.html" });
});

btnJSONactual.addEventListener(("click"), function (event) {
	chrome.tabs.create({ url:"../popup/jsonActual.html" });
});

confirmYes.addEventListener("click", function (event) {
	chrome.storage.local.get("recording", function (result) {

		if (result.recording == "confirm") {
			confirmTextAnim("Do you want to download?");
			chrome.storage.local.set({ recording: "download" });
			initRecord();
		} 
		else if (result.recording == "download") {
			confirmBox.classList.toggle("hidden");
			download();
			storageInit();
			disableOptions(false);
			setStorageFromOptions();
		}

	});
});

function confirmTextAnim(str) {
	confirmText.style.opacity = 0;
	setTimeout(() => {confirmText.innerText = str; } , 100);
	setTimeout(() => {confirmText.style.opacity = 1; } , 200);
}

confirmNo.addEventListener("click", function (event) {
	chrome.storage.local.get("recording", function (result) {

		if (result.recording == "confirm") {
			confirmBox.classList.toggle("hidden");
			chrome.storage.local.set({ recording: "recording" });
		} 
		else if (result.recording == "download") {
			confirmBox.classList.toggle("hidden");
			storageInit();
			disableOptions(false);
			setStorageFromOptions();
		}

	});
});

for (let opt of options) {
	opt.addEventListener("click", function (event) {
		chrome.storage.local.get("options", function (result) {
			result.options[opt.value] = opt.checked;
			chrome.storage.local.set({ "options": result.options });
		});
	});
}

// SET THE CURRENT PAGE STATE

initRecord();

chrome.storage.local.get(["recording","options"], function(result) {

	if (result.recording == "recording" || result.recording == "confirm")
		changeToRecord();

	if (result.recording == "confirm") {
		confirmText.innerText = "Are you sure?";
		confirmBox.classList.toggle("hidden");
	}
	if (result.recording == "download") {
		confirmText.innerText = "Do you want to download?";
		confirmBox.classList.toggle("hidden");
	}

	for (let opt of options) 
		if (!result.options[opt.value])
			opt.checked = false;

	if (result.options.disabled)
		disableOptions(true);
});

// DOWNLOAD

function download(data, filename) {
	chrome.storage.local.get(null, function(data) {
		saveAs(new Blob([getJSONStringToDownload(data)], {type: "text/plain;charset=utf-8"}), "recorded.json");
	});
}

function getJSONStringToDownload(data) {
	KEYSTOIGNORE.forEach( key => { delete data[key] } );
	let finalobj = {};
	ARRAYS.forEach(arr => { finalobj[arr] = []; } );

	finalobj.extensions = data.extensions;
	delete data.extensions;
	
	for (let obj in data)
		finalobj[obj.split("|")[0]].push(data[obj]);

	return JSON.stringify(finalobj,null,2);
}