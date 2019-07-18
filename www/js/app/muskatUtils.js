/* Muskat Version 1.1 */

function muSWUpdater(reloadElementId) {
	var isCordovaApp = window.cordova;
	if(!isCordovaApp) {
		if('serviceWorker' in navigator) {
			var newWorker;

			document.getElementById(reloadElementId).addEventListener("click", function() {
				newWorker.postMessage({action: "skipWaiting"});
				window.location.reload();
			});

			navigator.serviceWorker.register('/sw.js').then(function(reg) { 
				console.log("Service Worker Registered");

				reg.addEventListener("updatefound", function() {
					newWorker = reg.installing;
					newWorker.addEventListener("statechange", function() {
						switch(newWorker.state) {
							case "installed":
								if(navigator.serviceWorker.controller) {
									var reload = document.getElementById(reloadElementId);
									reload.style.display = "block";
								}
							break;
						}		
					});
				});
			}).catch(function(err) {
				console.log("Service Worker registration failed: " + err);
			});
		}
	}
}
