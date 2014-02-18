

$(document).ready(function() {
	if(isAPIAvailable()) {
		//$('#inputFile').bind('change', fileUpload);
		//$('#myform').bind('submit', fileUpload);
		
	}
});
		
function isAPIAvailable() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		return true;
	} else {
		// source: File API availability - http://caniuse.com/#feat=fileapi
		// source: <output> availability - http://html5doctor.com/the-output-element/
		document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
		// 6.0 File API & 13.0 <output>
		document.writeln(' - Google Chrome: 13.0 or later<br />');
		// 3.6 File API & 6.0 <output>
		document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
		// 10.0 File API & 10.0 <output>
		document.writeln(' - Internet Explorer: Not supported (partial support expected in 10.0)<br />');
		// ? File API & 5.1 <output>
		document.writeln(' - Safari: Not supported<br />');
		// ? File API & 9.2 <output>
		document.writeln(' - Opera: Not supported');
		return false;
	}
}

function fileUpload(evt){
	//var files = evt.target.files; // FileList object
	//var file = files[0];
	var file = $("#inputFile").get(0).files[0];
	
	console.log("uploaded file=",file.name," size=", file.size, " type=",file.type);
	
	loadCsv(file);
	alert('Done');
	
	return false;
}

function loadCsv(file) {
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(event){
		var csv = event.target.result;
		var data = $.csv.toArrays(csv,{ separator : ';'});

//ADSLID;LATITUDE;LONGITUDE;ZIP_CODE_4;ZIP_CODE_3;PRECISION;GEOREF_LEVEL;
//DISTRICT;MUNICIPALITY;PARISH;LOCALITY;STREET_TYPE;STREET;HOUSE_NUMBER;Service Status;ID Type;
//Service Activation Date;Pricing Plan Code;
//Pricing Plan Description;Pricing Plan Class;Sales Force Code;Sales Force Channel;Sales Force Director;BU
		addressList = new Array();
		
		for(var row in data) {
		
			//if (row==0) continue;
			anAddress = {};
			//for(var item in data[row]) {
			
			anAddress.id = data[row][0];
			anAddress.zipCode4 = data[row][3];	
			anAddress.zipCode3 = data[row][4];
			anAddress.street = data[row][11] +" "+data[row][12];
			anAddress.door = data[row][13];
			anAddress.locality = data[row][10];
			anAddress.municipality = data[row][8];
			
			console.log("adress read=",anAddress);	
			addressList.push(anAddress);
				//console.log("Linha=",data[row][item]);
			//}
			
		}
		console.log("lists=",addressList);	
	};
	reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
}

