'use strict';

/**
 * @ngdoc service
 * @name ilApp.Downloader
 * @description
 * # Downloader
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Downloader', function ($http, API_IL){
  		 this.handleDownload = function(data, status, headers, defaultFilename) {
  			var octetStreamMime = 'application/octet-stream';
			
			var rqHeaders = headers();
			var contentType = rqHeaders['content-type'] || octetStreamMime;
			var filename = rqHeaders['x-filename'] || defaultFilename;
			
			var saved = false;
			try
	        {
	            // Try using msSaveBlob if supported
	            //console.log("Trying saveBlob method ...");
	            var blob = new Blob([data], { type: contentType });
	            if(navigator.msSaveBlob)
	                navigator.msSaveBlob(blob, filename);
	            else {
	                // Try using other saveBlob implementations, if available
	                var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
	                if(saveBlob === undefined) throw "Not supported";
	                saveBlob(blob, filename);
	            }
	            console.log("saveBlob succeeded");
	            saved = true;
	        } catch(ex)
	        {
	            //console.log("saveBlob method failed with the following exception:");
	            //console.log(ex);
	        }
	        
	        if(!saved)
	        {
	            // Get the blob url creator
	            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
	            if(urlCreator)
	            {
	                // Try to use a download link
	                var link = document.createElement('a');
	                if('download' in link)
	                {
	                    // Try to simulate a click
	                    try
	                    {
	                        // Prepare a blob URL
	                        //console.log("Trying download link method with simulated click ... content type " + contentType);
	                        var blob = new Blob([data], { type: contentType });
	                        var url = urlCreator.createObjectURL(blob);
	                        link.setAttribute('href', url);

	                        // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
	                        link.setAttribute("download", filename);

	                        // Simulate clicking the download link
	                        var event = document.createEvent('MouseEvents');
	                        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	                        link.dispatchEvent(event);
	                        //console.log("Download link method with simulated click succeeded");
	                        saved = true;

	                    } catch(ex) {
	                        //console.log("Download link method with simulated click failed with the following exception:");
	                        console.log(ex);
	                    }
	                }

	                if(!saved)
	                {
	                    // Fallback to window.location method
	                    try
	                    {
	                        // Prepare a blob URL
	                        // Use application/octet-stream when using window.location to force download
	                        //console.log("Trying download link method with window.location ...");
	                        var blob = new Blob([data], { type: contentType });
	                        var url = urlCreator.createObjectURL(blob);
	                        // use data: url instead of blob
	                        var reader = new FileReader;
	                        reader.onload = function() {
	                          var blobAsDataUrl = reader.result;
	                          window.location = blobAsDataUrl;
	                        };
	                        reader.readAsDataURL(blob);
	                        console.log("Download link method with window.location succeeded");
	                        saved = true;
	                    } catch(ex) {
	                        //console.log("Download link method with window.location failed with the following exception:");
	                        console.log(ex);
	                    }
	                }
	                
	                if (!saved)
	                {
	                	alert('File could not be downloaded with this web browser');
	                }

	            }
	        }

	        if(!saved)
	        {
	            // Fallback to window.open method
	            console.log("No methods worked for saving the arraybuffer, using last resort window.open");
	            window.open(httpPath, '_blank', '');
	        }
  		}
  });