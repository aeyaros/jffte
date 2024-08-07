/* ======================================
Team 94 CI 103 Spring 2018 Final Project
========================================
Andrew Yaros
Jacob Proctor
Jung Ho Baek
Riley Faulkner
========================================
John Fry's Food Truck Extravaganza!
Javascript code file
======================================*/

//==============================
// aey - Initialize Firebase
var config = {
	apiKey: "",
	authDomain: "truck-info.firebaseapp.com",
	databaseURL: "https://truck-info.firebaseio.com",
	projectId: "truck-info",
	storageBucket: "truck-info.appspot.com",
	messagingSenderId: "79543713279"
};
firebase.initializeApp(config);

var fireBaseJSON = firebase.database().ref().child("JSONarray");
//==============================
//aey - javascript object trucks
//aey - DO NOT DELETE THIS
var localTruckArray = [];
//===============================
//aey - load trucks from firebase
//===============================
const blankcallback = function () {
};

function loadTrucks(callback = blankcallback) {
	// aey - loop through the array in the realtime database
	let downloadedData = firebase.database().ref("JSONarray").orderByKey();
	downloadedData.once("value").then(function (snapshot) {
		snapshot.forEach(function (childSnapshot) { // aey - loop through json array in database
			//aey - get data from the snapshot - each field is a truck, the data for that field is the dataset for the truck
			//var field = childSnapshot.key;
			let fieldData = childSnapshot.val();
			//aey - create new truck object
			let newTruckObject = {
				"id": fieldData.id,
				"name": fieldData.name,
				"location": fieldData.location,
				"address": fieldData.address,
				"cuisine": fieldData.cuisine,
				"lat": fieldData.lat,
				"lng": fieldData.lng,
				"time": {
					"open": {"hour": fieldData.time.open.hour, "minute": fieldData.time.open.minute},
					"closed": {"hour": fieldData.time.closed.hour, "minute": fieldData.time.closed.minute}
				}, "menu": fieldData.menu /*  aey - contains menu items */
			}; //aey - push the new truck to the local array
			localTruckArray.push(newTruckObject);
		});
		//aey - after the trucks are loaded, the main menu should be printed! do this in the callback function
		callback();
	});
}


//aey - given an ID, get the truck for that ID
//aey - else, return -1 if not found
function getTruckWithID(givenID) {
	for (let i = 0; i < localTruckArray.length; i++) {
		if (localTruckArray[i].id === givenID) {
			return localTruckArray[i];
		}
	}
	return -1; //aey - truck wasnt found
}


//aey - time functions to get and print times

//aey - simple accessor functions:

function getHourOpen(truckID) {
	let aTruck = getTruckWithID(truckID);
	return aTruck.time.open.hour;
}

function getHourClosed(truckID) {
	let aTruck = getTruckWithID(truckID);
	return aTruck.time.closed.hour;
}

function getMinuteOpen(truckID) {
	let aTruck = getTruckWithID(truckID);
	return aTruck.time.open.minute;
}

function getMinuteClosed(truckID) {
	let aTruck = getTruckWithID(truckID);
	return aTruck.time.closed.minute;
}

//aey - get the opening or closing time in AM/PM format
//aey - first variable - id of truck to get
//aey - second variable - true for opening time, false for closing time
function getTimeAMPM(truckID, openingTime) {
	let hr;
	let min;

	//aey - first get the hour or the minute - must be ints
	if (openingTime === true) { //opening
		hr = parseInt(getHourOpen(truckID));
		min = parseInt(getMinuteOpen(truckID));
	} else if (openingTime === false) { //closing
		hr = parseInt(getHourClosed(truckID));
		min = parseInt(getMinuteClosed(truckID));
	} else {
		return "...Error: Use true or false for second arg when getting time"; //error
	}


	//aey - format the time
	if (!isNaN(hr) && !isNaN(min)) { //if hr and min are both numbers
		//aey - put leading 0 onto minute
		if (min < 10) min = "0" + min;
		if (hr === 12) return "12:" + min + "PM";  //for 12 PM
		else if (hr > 11) { //then PM: 12 - 23 = 1PM - 11PM
			return hr - 12 + ":" + min + "PM";
		} else { //otherwise AM
			if (hr === 0) return "12:" + min + "AM"; //0 = 12 AM
			else if (hr < 10) { //add a leading 0 for 1-9
				return "0" + hr + ":" + min + "AM";
			} else {
				return hr + ":" + min + "AM";
			}
		}
	} else { //otherwise ERROR
		if (isNaN(hr)) return "...Error: hour NaN";
		else return "...Error: minute NaN";
	}

}

//aey - important: to compare times, conver them to hr + (min/60) so you have just one number for each time
function timeToANumber(hr, min) {
	let theHr = parseInt(hr);
	let theMin = parseInt(min);
	if (!isNaN(theHr) && !isNaN(theMin)) {
		return theHr + (theMin / 60.0)
	} else if (isNaN(theHr)) return "...Error: hour is NAN";
	else return "...Error: minute is NaN";
}

//aey - check if a truck is open or not, return true/false
function isOpen(truckID) {
	//aey - get current hour, current minute
	let curDate = new Date();
	let curHr = curDate.getHours();
	let curMin = curDate.getMinutes();
	let curTime = timeToANumber(curHr, curMin);
	if (!isNaN(curTime)) { //aey - if current time is a number
		//aey - get opening and closing times for the truck as numbers
		let truckOpening = timeToANumber(getHourOpen(truckID), getMinuteOpen(truckID));
		let truckClosing = timeToANumber(getHourClosed(truckID), getMinuteClosed(truckID));
		if (isNaN(truckOpening) || isNaN(truckClosing)) { //aey - if either of those times is NaN
			if (isNaN(truckOpening)) return truckOpening; //aey - return error message that timeToAnumber gave
			else return truckClosing; //aey - return error message that timeToAnumber gave
		}
		//aey - if opening and closing times are equal I will assume it is always open, return true
		else if (truckOpening === truckClosing) return true;
			//aey - if closing time is "before" opening time then it likely opens really late and is closed really early
			//aey - aka open at 23.00 and closing at 5.00 means it is open all night
			//aey - or open at 16.00 and closing at 1.00 means opening in afternoon and closing in evening
		//aey - day start OOOO cur 0000 close CCCCCCCC open OOOO cur 0000 day end
		else if (truckClosing < truckOpening) {
			return (curTime < truckClosing) || (curTime >= truckOpening);
		} else {
			//aey - otherwise, if closing time is after opening time, then things are normal
			//aey - start CCCC open OOOO cur OOOO close CCCC end
			return (curTime >= truckOpening) && (curTime < truckClosing);
		}
	} else return "...Error: couldn't get current time";
}

//aey - return "open" or "closed" if its open or closed
function getOpenClosed(truckID) {
	let tempStatus = isOpen(truckID);
	if (tempStatus === true) return "open";
	else if (tempStatus === false) return "closed";
	else return tempStatus; //aey - return error isOpen gave
}

//aey - get html code for a back button
//aey - pass through the necessary variables so the button can call pickAMenu
//aey - at this point it will just be used on truck menus and will point to the main menu
function getBackButton(buttonText, menuType, truckID) {
	return "<button class=\"button1\" id=\"backButton\" " +
		"onclick=\"pickAMenu('" + menuType + "','" +
		truckID + "')\" >" + buttonText + "</button>";
}

//aey - sets up a little div that says whether the truck is open or closed
//aey - color changes either red or green
function isOpenTextPanel(truckID) {
	let htmlString = "<div ";
	//aey - add the status; change the class for the status text
	if (isOpen(truckID) === true) htmlString += "id=\"mainMenuTruckOpen\">"; //aey - truck is open, green
	else htmlString += "id=\"mainMenuTruckClosed\">"; //aey - truck is closed, or error, red
	htmlString += "Currently " + getOpenClosed(truckID) + ".</div>";
	return htmlString;
}

//aey - sets up a little div that says whether the truck is open or closed
//aey - color changes either red or green
function isOpenTextPanel2(truckID) {
	let htmlString = "<div ";
	//aey - add the status; change the class for the status text
	if (isOpen(truckID) === true) htmlString += "id=\"mainMenuTruckOpen2\">"; //aey - truck is open, green
	else htmlString += "id=\"mainMenuTruckClosed2\">"; //aey - truck is closed, or error, red
	htmlString += "Currently <br/>" + getOpenClosed(truckID) + "</div>";
	return htmlString;
}

/* aey - set up main menu */

//aey - creates an html table of the main menu with a list of all food trucks as buttons to click
function setUpMainMenu() {
	//aey - loop through the array of loaded trucks
	//aey - print name, location description, etc.
	//aey - each menu item is a link/button that, when clicked, takes you to that trucks menu
	//aey - you can do this because you take the id of the current truck and build the appropriate html

	let mainMenuString = "<table id=\"mainMenuTable\" style=\"width:100%\">";
	mainMenuString += "<tr><td><div id=\"menuTitleText\">Main menu</div><div id=\"menuSubtitleText\">Please choose a truck:</div></td></tr>";

	//aey - check if zero first
	if (localTruckArray.length === 0) {
		mainMenuString += "<tr><td>There are no trucks loaded in the local client database.</td></tr></table>";
		return mainMenuString;
	}
	//aey - otherwise, proceed on with the table

	//aey - loop through trucks in local array
	let n = localTruckArray.length;
	for (let i = 0; i < n; i++) {
		let curID = localTruckArray[i].id;
		let curName = localTruckArray[i].name;
		let curCuis = localTruckArray[i].cuisine;

		/* aey - construct one row of the main menu table */

		//aey - header row
		mainMenuString += "<tr>";

		//aey - setting up the menu row td tag
		//aey - first we set up the id
		//aey - then we set up the class
		mainMenuString += "<td class=\"";

		if (n === 1) mainMenuString += "singleItem\" style=\"border-radius: 25px; "; //aey - just in case if only one item, then all corners are round; set style, class singleitem never used
		else {
			if (i === 0) mainMenuString += "mainMenuFieldBegin "; //aey - beginning, top corners round
			else if (i === n - 1) mainMenuString += "mainMenuFieldEnd "; //aey - end, bottom corners round
			//aey - otherwise no need to change corners

			//aey - set class; change the color every other item for readability; change the class for the current row
			if ((i % 2 === 0) && (n !== 1)) mainMenuString += " menuFieldEven"; //for evens
			else mainMenuString += " menuFieldOdd"; //for odds
		}

		mainMenuString += "\">"; //end of td tag

		//aey - add the button
		mainMenuString += "<button id=\"mainMenuTitleButton\" class=\"button1\"" + "onclick=\"pickAMenu('truck','" + curID + "')\">" + curName + "<br/></button><table style=\"width:100%\"><tr><td style=\"width:50%\">";
		//aey - set up tiny table for the "currently open/closed" and "pricerange elements"

		//aey - create "is open" div (as seen on the main menu
		mainMenuString += isOpenTextPanel2(curID);
		//aey - print price range
		mainMenuString += "</td><td><div id=\"priceRangeMainMenu\">Price range: <br/>" + calculatePriceRange(localTruckArray[i].menu) + "</div></td></tr></table>";

		mainMenuString += "</td></tr>";
	}
	mainMenuString += "</table>";
	return mainMenuString;
}

/* aey - set up truck information menu */

//aey - given a truck, create html string for that truck's menu and return it
//aey - basically, this just prints out a bunch of information about the food truck, as well as a link to the food truck's menu

//aey - we may be able to just display the food menu immediately, since info wont take up that much space
//aey - once I'm finished writing the other functions and this actually works ill have to change this
function setUpTruckInfoTable(truckID) {
	let truck = getTruckWithID(truckID);

	//aey - print back button at the top
	let truckhtml = "<table style=\"width:100%\" id=\"truckInfoBackButton\"><tr><td>" + getBackButton("Back to main menu", "main", "") + "</td></tr></table><br/>";

	truckhtml += "<div style=\"margin:0 20px\" id=\"truckMenuTitleText\">" + truck.name + "</div><br/>";

	//aey - table of info
	truckhtml += "<table id=\"truckInfoTable\">" +
		"<tr class=\"menuFieldEven truckMenuFieldBegin2\">" +
		"<td class=\"tableInfoColumn1 beginTableMenuL\">Address:</td>" +
		"<td class=\"tableInfoColumn2 beginTableMenuR\"> " + truck.address + "</td>" +
		"</tr>";

	truckhtml +=
		"<tr class=\"menuFieldOdd\">" +
		"<td class=\"tableInfoColumn1\">Location:</td>" +
		"<td class=\"tableInfoColumn2\"> " + truck.location + "</td>" +
		"</tr>";

	truckhtml +=
		"<tr class=\"menuFieldEven\">" +
		"<td class=\"tableInfoColumn1\">Price range:</td>" + "</td>" +
		"<td class=\"tableInfoColumn2\">" + calculatePriceRange(truck.menu) + "</td>" +
		"</tr>";

	truckhtml +=
		"<tr class=\"menuFieldOdd\">" +
		"<td class=\"tableInfoColumn1\">Cuisine:</td>" +
		"<td class=\"tableInfoColumn2\">" + truck.cuisine + "</td>" +
		"</tr>";

	truckhtml +=
		"<tr class=\"menuFieldEven\">" +
		"<td class=\"tableInfoColumn1\">Hours:</td>" +
		"<td class=\"tableInfoColumn2\">Open from " + getTimeAMPM(truckID, true) + " to " + getTimeAMPM(truckID, false) + "</td>" +
		"</tr>";

	truckhtml +=
		"<tr class=\"menuFieldOdd\">" +
		"<td class=\"tableInfoColumn1 endTableMenuL\">" + "Status:</td>" +
		"<td class=\"tableInfoColumn2 endTableMenuR\">" + isOpenTextPanel(truck.id) + "</td>" +
		"</tr>" +
		"</table>";

	return truckhtml;
}

/* aey - set up truck food menu */

//aey - looks at a truck's menu, creates an html string (a menu with all the items in it) and returns the string
function setUpTruckFoodTable(truckID) {
	//aey - for items in menu
	//aey - build html table
	//aey - print html
	let truck = getTruckWithID(truckID);
	let menutable = "<div id=\"truckMenuTitleText\">Truck menu: </div><table id=\"truckFoodTable\">";

	let menu = truck.menu; //aey - get the menu from the truck with id truckID
	let n = truck.menu.length; // length of menu

	//aey - if there's nothing there, then return
	if (menu[0] === 0) {
		menutable += "<tr class=\"menuFieldSingular\"><td id=\"singularMenu\">There's&nbsp;nothing on&nbsp;the&nbsp;menu! :&#8288;(</td></tr></table>";
		return menutable;
	}

	//aey - otherwise print out each item in the menu
	for (let i = 0; i < n; i++) {
		menutable += "<tr ";

		if (n === 1) menutable += "class=\"menuFieldSingular\""; //if only one item
		else if (i % 2 === 0) menutable += "class=\"menuFieldEven\""; //for evens
		else menutable += "class=\"menuFieldOdd\""; //for odds

		/* first column */
		if (n === 1) { //if only item
			menutable += "><td class=\"foodInfoColumn1 singularMenuL\">";
		} else if (i === 0) { //if first item
			menutable += "><td class=\"foodInfoColumn1 beginTableMenuL\">";
		} else if (i === n - 1) { //if last item
			menutable += "><td class=\"foodInfoColumn1 endTableMenuL\">";
		} else {
			menutable += "><td class=\"foodInfoColumn1\">";
		}
		menutable += menu[i].name + "</td>";

		/* second column */
		if (n === 1) { //if only item
			menutable += "<td class=\"foodInfoColumn2 singularMenuR\">";
		} else if (i === 0) { //if first item
			menutable += "<td class=\"foodInfoColumn2 beginTableMenuR\">";
		} else if (i === n - 1) { //if last item
			menutable += "<td class=\"foodInfoColumn2 endTableMenuR\">";
		} else {
			menutable += "<td class=\"foodInfoColumn2\">";
		}
		menutable += "  $" + menu[i].price + "</td></tr>";
	}
	menutable += "</table>"
	return menutable;
}

//aey - goes through each item in the menu
//aey - gets the smallest price (min) and the largest price (max)
//aey - returns a string "From $min to $max"
function calculatePriceRange(menu) {
	let priceRange = "";

	//aey - get max, starting at 0
	let max = 0;
	if (menu === undefined) return "N/A";

	let n = menu.length;
	for (let i = 0; i < n; i++) { //loop through every item in the menu
		let currentPrice = parseFloat(menu[i].price); //get the price of the item
		if (currentPrice > max) { //if the current price is more than the current maximum
			max = currentPrice; //then set a new maximum
		}
	}

	//aey - get min, starting from max
	let min = max;
	for (let i = 0; i < n; i++) { //loop through every item in the menu
		let currentPrice = parseFloat(menu[i].price); //get the price of the item
		if (currentPrice < min) { //if current is less than current min
			min = currentPrice; //set a new minimum
		}
	}
	return "$" + min.toFixed(2) + " to $" + max.toFixed(2) + "";
}

//aey - print out the truck info and menu items
function setUpTruckMenu(truckID) {
	//aey - create html string
	let truckMenuString = "";

	//aey - get the table containing menu information
	truckMenuString += setUpTruckInfoTable(truckID);
	truckMenuString += "<br/>";

	//aey - get the actual menu
	truckMenuString += setUpTruckFoodTable(truckID);
	truckMenuString += "<br/>";

	//aey - return the html
	return truckMenuString;
}

//aey - helper function: takes a string of html and inserts it into the page
function printOutAMenu(htmlString) {
	document.getElementById("theMenuPanel").innerHTML = htmlString;
}

/* aey - FUNCTION TO USE WHEN CALLING A MENU */

var mainMenuScrollPosition = 0;

//aey - choose a menu and print the menu.
//aey - type can be "main" or "truck"
//aey - if main, just provide the type "main"
//aey - if a truck then print the truck info and the menu
//aey - the function prints the header first, then the menu
function pickAMenu(menuType, truckID) {
	let headerString = "<div id=\"header\"><img src=\"logo.png\" alt=\"JOHN FRY'S FOOD TRUCK EXTRAVAGANZA!\" style=\"width:100%\" /></div>";

	if (menuType === "main") {
		//aey - get, then print html string for main menu (list of trucks)
		printOutAMenu(headerString + setUpMainMenu());

		//aey - restore scroll position of main menu
		document.getElementById("theMenuPanel").scrollTo(0, mainMenuScrollPosition);

		//aey - reset the zoom for the map
		resetMap();
	} else if (menuType === "truck") {
		//aey - get scroll position of main menu
		mainMenuScrollPosition = document.getElementById("theMenuPanel").scrollTop;

		//aey - get, then print html string for truck's information menu
		printOutAMenu(headerString + setUpTruckMenu(truckID));
		//aey - scroll up to the top of the truck's menu after loading
		document.getElementById("theMenuPanel").scrollTop = 0;
		//aey - zoom into the truck on the map
		zoomToTruck(truckID);
	}
}

//aey - declare map variable out of function to make global
var map;
var listOfMarkers = [];

function initMap() {
	//rf - This displays the map, and also contains all the settings which hide certain labels, as well as re-coloring the map
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 39.9557402, lng: -75.1898869},
		zoom: 16.48,
		mapTypeControl: false,
		styles: [
			{elementType: "geometry", stylers: [{color: "#042a4c"}]},
			{elementType: "labels.text.stroke", stylers: [{color: "#543f0f"}]},
			{elementType: "labels.text.fill", stylers: [{color: "#fdc139"}]},
			{
				featureType: "administrative.locality",
				elementType: "labels.text.fill",
				stylers: [{color: "#fdc139"}]
			},
			{
				featureType: "poi",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "poi.business",
				elementType: "labels.text.fill",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "road",
				elementType: "geometry",
				stylers: [{color: "#38414e"}]
			},
			{
				featureType: "road",
				elementType: "geometry.stroke",
				stylers: [{color: "#212a37"}]
			},
			{
				featureType: "road",
				elementType: "labels.text.fill",
				stylers: [{color: "#9ca5b3"}]
			},
			{
				featureType: "road.highway",
				elementType: "geometry",
				stylers: [{color: "#746855"}]
			},
			{
				featureType: "road.highway",
				elementType: "geometry.stroke",
				stylers: [{color: "#1f2835"}]
			},
			{
				featureType: "road.highway",
				elementType: "labels.text.fill",
				stylers: [{color: "#f3d19c"}]
			},
			{
				featureType: "transit",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "transit.station",
				elementType: "labels.text.fill",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "transit.station",
				elementType: "geometry.fill",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "water",
				elementType: "geometry",
				stylers: [{color: "#17263c"}]
			},
			{
				featureType: "water",
				elementType: "labels.text.fill",
				stylers: [{visibility: "off"}]
			},
			{
				featureType: "water",
				elementType: "labels.text.stroke",
				stylers: [{visibility: "off"}]
			}
		]
	});


	//aey - add markers for each truck in the local array to the map
	for (let i = 0; i < localTruckArray.length; i++) {
		let currentMarker = new google.maps.Marker({
			//get position values from array
			position: new google.maps.LatLng(parseFloat(localTruckArray[i].lat), parseFloat(localTruckArray[i].lng)),
			draggable: false,
			map: map
		}); //aey - add listener to the current marker
		google.maps.event.addListener(currentMarker, 'click', (function (currentMarker, i) {
			return function () {
				map.setZoom(17.5);
				map.setCenter(currentMarker.getPosition());
				pickAMenu("truck", localTruckArray[i].id);
			}
		})(currentMarker, i));

		listOfMarkers.push([currentMarker, localTruckArray[i].id]); //aey - push to a list of markers: the marker, and the truck ID
	}
}

//aey - zoom into a marker when a truck is selected
function zoomToTruck(truckID) {
	map.setZoom(17.5);
	//aey - get the index of the marker that matches the ID of the truck
	for (let i = 0; i < listOfMarkers.length; i++) { //aey - loop through list
		if (listOfMarkers[i][1] === truckID) { //aey - if id matches
			map.setCenter(listOfMarkers[i][0].getPosition()); //aey - set center to the marker
			break;
		}
	}
} //aey - reset the map when returning to the main menu
function resetMap() {
	let originalCenter = {"lat": 39.9557402, "lng": -75.1898869};
	map.setCenter(originalCenter);
	map.setZoom(16.48);
}
