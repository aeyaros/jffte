/* 
========================================
Team 94 CI 103 Spring 2018 Final Project
========================================
Andrew Yaros
Jacob Proctor
Jung Ho Baek
Riley Faulkner
========================================
John Fry's Food Truck Extravaganza!
Editor Javascript code file
========================================
*/

// aey - Initialize Firebase
var config = {
	apiKey: "AIzaSyD0JmamdWMQFN0eI-J45TKS3MqVk8_zAzk",
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
var localTruckArray = [0];
//==============================

//===========================================================
//aey - THIS IS HOW TRUCKS AND MENU ITEMS SHOULD BE FORMATTED 
//aey - these are the formats for the JSON strings for the database
//===========================================================

//aey - these are blank examples of objects; dont delete please

var blankTruckObject = { 
	"id": "",
	"name": "",
	"location": "", 
	"address": "",
	"cuisine": "",
	"lat": "00",
	"lng": "00",
	"time": {
		"open": {"hour":"00", "minute":"00"},
		"closed": {"hour":"00", "minute":"00"}
	},
	"menu": [0]/* contains menu items */
};

var blankFoodItemObject = {
	"name": "",
	"price": ""
	/* other attributes would go here
	typeOfFood: "",
	...etc.
	 */
};



		
//aey - save trucks to file
function saveTrucks() {
	if(!isArrayEmpty(localTruckArray)) {//if there are trucks
		//aey - create JSON object for all trucks
		var allTrucks = {};
						
		for(let i = 0; i < localTruckArray.length; i++) {
			eval("allTrucks.truck" + i + " = localTruckArray[i];");
		}
		
		fireBaseJSON.set(allTrucks);
		outputMessage("Saved trucks to firebase")
	}
}

//aey - load trucks from file
function loadTrucks() {			
	// aey - loop through the array in the realtime database
	var downloadedData = firebase.database().ref("JSONarray").orderByKey();
	localTruckArray = [0];
	var index = 0;
	downloadedData.once("value")
		.then(function(snapshot) {
			snapshot.forEach(function(childSnapshot) { // aey - loop through json array in database
				//var field = childSnapshot.key;
				var fieldData = childSnapshot.val();
				
				if(index == 0) {
					localTruckArray[0] = fieldData; // aey - if empty, replace first item "0"
				} else {
					localTruckArray.push(fieldData); // aey - otherwise, just push
				}						
				
				index++;
			});
			printTrucks();
			outputMessage("Successfully loaded trucks from the firebase database");
	});	
}


// aey - check if the array is "empty"
// aey - for empty arrays, we are using [0]; aka the item at index 0 is "0"
// aey - just have to check each time you add something to make sure it is either the first thing to be added (where you overwrite the "0") or not, in which case you just push the new item, whether it is a truck or a food item
function isArrayEmpty(arrayObject) {
	if(arrayObject.length == 1 && arrayObject[0] == 0) return true;
	else return false;
}


//aey - checks ID against currently loaded IDs
function doesTruckExist(truckID) {
	if(isArrayEmpty(localTruckArray)) return false;
	else {
		for(let i = 0; i < localTruckArray.length; i++) {
			if(localTruckArray[i].id == truckID) return true; //id was found
		}
		
		return false; //id was not found
	}
}

// aey - check if a menu item exists in a given food truck
function doesMenuItemExist(truckID, name) {
	//aey - does truck exist
	if(doesTruckExist(truckID)) { // aey - if truck exists 
		var truck = getTruckWithID(truckID);
		if(isArrayEmpty(truck.menu)) { // aey - if menu is empty
			outputMessage("1");
			return false;
		} else { // aey - if menu exists
			for(let i = 0; i < truck.menu.length; i++){
				if(truck.menu[i].name == name) {
					return true;
				}
			}
		} 
		return false;
	} else {
		return false;
	}
}

//aey - returns index of menu item in a truck, or -1 if error
function getIndexOfMenuItem(truckID, name) {
	//aey - make sure truck exists
	if(doesTruckExist(truckID) == false) {
		return -1;
	}
	//aey - make sure menu exists
	var truck = getTruckWithID(truckID);
	if(isArrayEmpty(truck.menu)){
		return -1;
	}
	
	if(doesMenuItemExist(truckID, name)) {
		for(let i = 0; i < truck.menu.length; i++){
			if(truck.menu[i].name == name){ //aey - if found return index
				return i;
			}
		}
		return -1; //aey - otherwise return -1 if error
	}
}

//aey - given an id, find where it is in the array
//aey - returns -1 if not found, -2 if no trucks
function findTruckWithID (truckID) {
	if(isArrayEmpty(localTruckArray)) return -2; // aey - if no trucks
	for(let i = 0; i < localTruckArray.length; i++) {
		if(localTruckArray[i].id == truckID) return i; // aey - id was found, return where it was found
	}
	return -1;
}

//aey - returns the truck object at an ID
//aey - returns -1 on error
function getTruckWithID(truckID) {
	if(isArrayEmpty(localTruckArray)) {
		outputMessage("No trucks loaded");
	} else if(!doesTruckExist(truckID)) {
		outputMessage("Truck doesn't exist")
	} else {
		var index = findTruckWithID(truckID);
		return localTruckArray[index];
	}
	return -1;
}

//aey - parses a value based a specified type, returns true if it can be parsed, otherwise returns false
function parseValue(fieldType, fieldValue) {
	var valueIsOK = 0;
	
	switch (fieldType) {
		case "text": //name, location, address, or cuisine
			if( fieldValue == '' ) {
				outputMessage("Text values cannot be blank");
			} else {
				valueIsOK = 1;
			}
			break;
		case "price":
			if( parseFloat(fieldValue) == NaN || fieldValue == '' ){ //aey - price must be number
				outputMessage("Item price must be a number")
			} else {
				valueIsOK = 1;
			}
			break;
		case "lat":
			if(	(parseFloat(fieldValue) == NaN || fieldValue == '') ||
				(parseFloat(fieldValue) < -90  || parseFloat(fieldValue) > 90)) {
				outputMessage("Latitude must be a number from -90 to 90");
			} else {
				valueIsOK = 1;
			}
			break;
		case "lng":
			if(	(parseFloat(fieldValue) == NaN || fieldValue == '') ||
				(parseFloat(fieldValue) < -180  || parseFloat(fieldValue) > 180)) {
				outputMessage("Latitude must be a number from -90 to 90");
			} else {
				valueIsOK = 1;
			}
			break;
		case "hr":
			if(	(parseInt(fieldValue) == NaN || fieldValue == '' ) || 
				(parseInt(fieldValue) < 0    || parseInt(fieldValue) > 23)) {
				outputMessage("An hour must be a integer, and be between 0 and 23");
			} else {
				valueIsOK = 1;
			}
			break;
		case "min":
			if(	
				(parseInt(fieldValue) == NaN || fieldValue == '' ) || 
				(parseInt(fieldValue) < 0    || parseInt(fieldValue) > 59)) {
					outputMessage("A minute must be a integer, and be between 0 and 59");
			} else {
				valueIsOK = 1;
			}
			break;		
		default:
			outputMessage(fieldType + " is not a valid field type");
			break;
	}
	if(valueIsOK == 1) {
		return true;
	} else {
		return false;
	}
}


//aey - create a truck javascript object; this creates javascript objects from textboxes on the page
//aey - this should really be temporary, once firebase is implemented we just need to convert back and forth btw javascript object and firebase
//aey - get input fields, create javascript object
function addTruck() {
	
	/* aey - old code: leaving it here just in case
	//aey - check if certain values are valid and in range and not blank
	if(doesTruckExist($("#id").val()) || $("#id").val() == '') {
		outputMessage("ID " + $("#id").val() + " already in use.");
	} else if( $("#name").val() == '' ) {
		outputMessage("Name cannot be blank");
	} else if( $("#loca").val() == '' ) {
		outputMessage("Location description cannot be blank");
	} else if( $("#addr").val() == '' ) {
		outputMessage("Street address cannot be blank");
	} else if( $("#cuis").val() == '' ) {
		outputMessage("Cuisine cannot be blank");
	} else if(	(parseFloat($("#lat").val()) == NaN || $("#lat").val() == '') ||
				(parseFloat($("#lat").val()) < -90  || parseFloat($("#lat").val()) > 90)) {
		outputMessage("Latitude must be a number from -90 to 90");
	} else if(	(parseFloat($("#lng").val()) == NaN || $("#lng").val() == '' ) || 
				(parseFloat($("#lng").val()) < -180 || parseFloat($("#lng").val()) > 180)) {
		outputMessage("Longitude must be a number from -180 to 180");
	} else if(	(parseInt($("#hourO").val()) == NaN || $("#hourO").val() == '' ) || 
				(parseInt($("#hourO").val()) < 0    || parseInt($("#hourO").val()) > 23)) {
		outputMessage("Hour open must be a integer, and be between 0 and 23");
	} else if(	(parseInt($("#hourC").val()) == NaN || $("#hourC").val() == '' ) || 
				(parseInt($("#hourC").val()) < 0    || parseInt($("#hourC").val()) > 23)) {
		outputMessage("Hour closed must be a integer, and be between 0 and 23");
	} else if(	(parseInt($("#minuteO").val()) == NaN || $("#minuteO").val() == '') || 
				(parseInt($("#minuteO").val()) < 0    || parseInt($("#minuteO").val()) > 59)) {
		outputMessage("Minute open must be a integer, and be between 0 and 59");
	} else if( 	(parseInt($("#minuteC").val()) == NaN || $("#minuteC").val() == '' ) || 
				(parseInt($("#minuteC").val()) < 0    || parseInt($("#minuteC").val()) > 59)) {
		outputMessage("Minute closed must be a integer, and be between 0 and 59");
	} else { // aey - all values are OK

	
	*/
	
	//aey - check if certain values are valid and in range and not blank
	if( parseValue( "text" , $("#id").val() ) == false ) {
		outputMessage("ID can't be blank.");
	} else if(doesTruckExist($("#id").val())) {
		outputMessage("ID " + $("#id").val() + " already in use.");
	} else if(parseValue("text",$("#name").val()) == false) {
		outputMessage("Name cannot be blank");
	} else if(parseValue("text",$("#loca").val()) == false) {
		outputMessage("Location description cannot be blank");
	} else if(parseValue("text",$("#addr").val()) == false) {
		outputMessage("Street address cannot be blank");
	} else if(parseValue("text",$("#cuis").val()) == false) {
		outputMessage("Cuisine cannot be blank");
	} else if(parseValue("lat",$("#lat").val()) == false) {
		outputMessage("Latitude must be a number from -90 to 90");
	} else if(parseValue("lng",$("#lng").val()) == false) {
		outputMessage("Longitude must be a number from -180 to 180");
	} else if(parseValue("hr",$("#hourO").val()) == false) {
		outputMessage("Hour open must be a integer, and be between 0 and 23");
	} else if(parseValue("hr",$("#hourC").val()) == false) {
		outputMessage("Hour closed must be a integer, and be between 0 and 23");
	} else if(parseValue("min",$("#minuteO").val()) == false) {
		outputMessage("Minute open must be a integer, and be between 0 and 59");
	} else if(parseValue("min",$("#minuteC").val()) == false) {
		outputMessage("Minute closed must be a integer, and be between 0 and 59");
	} else { // aey - all values are OK
		var newTruckObject = { 
			"id": String($("#id").val()),
			"name": String($("#name").val()),
			"location": String($("#loca").val()), 
			"address": String($("#addr").val()),
			"cuisine": String($("#cuis").val()),
			"lat": $("#lat").val(),
			"lng": $("#lng").val(),
			"time": {
				"open": {"hour": $("#hourO").val(), "minute": $("#minuteO").val() },
				"closed": {"hour": $("#hourC").val(), "minute": $("#minuteC").val() }
			},
			"menu": [0] /*  aey - contains menu items */
		};
		if(isArrayEmpty(localTruckArray)) {
			localTruckArray[0] = newTruckObject; // aey - if empty, replace first item "0"
		} else {
			localTruckArray.push(newTruckObject); // aey - otherwise, just push
		}
		printTrucks();
		outputMessage("Added new truck successfully");
	}		
}


//aey - add a new menu item
function addMenuItem() {
	var arrayLocation = findTruckWithID($("#id2").val());
	//aey - error checking
	
	/* aey - old code: leaving here just in case
	if( $("#itemName").val() == '' ) {
		outputMessage("Food item name cannot be blank");
	} else if (arrayLocation == -1) {
		outputMessage("Error: ID not found")
	} else if (arrayLocation == -2) {
		outputMessage("No trucks in local array")
	} else if (doesMenuItemExist( $("#id2").val() , $("#itemName").val())) {
		outputMessage("Menu item already exists")
	} else if( parseFloat($("#itemPrice").val()) == NaN || $("#itemName").val() == '' ){ //aey - price must be number
		outputMessage("Item price must be a number")
	}
	else{ //aey - else, create the json 
	
	*/
	
	
	if( parseValue("text",$("#itemName").val()) == false) {
		outputMessage("Food item name cannot be blank");
	} else if (arrayLocation == -1) {
		outputMessage("Error: ID not found")
	} else if (arrayLocation == -2) {
		outputMessage("No trucks in local array")
	} else if (doesMenuItemExist( $("#id2").val() , $("#itemName").val())) {
		outputMessage("Menu item already exists")
	} else if( parseValue("price",$("#itemPrice").val()) == false){ //aey - price must be number
		outputMessage("Item price must be a number")
	}
	else { //aey - else, create the json 
		var newMenuItem = {
			"name": String($("#itemName").val()),
			"price": $("#itemPrice").val()
		}
		if(isArrayEmpty(localTruckArray[arrayLocation].menu)){
			localTruckArray[arrayLocation].menu[0] = newMenuItem;
		} else {
			localTruckArray[arrayLocation].menu.push(newMenuItem);
		}
		printTrucks();
		outputMessage("Added new menu item successfully");
		
	}
}

// aey - given an index, get a truck from the array
function getTruckString(i) {
	var truck = localTruckArray[i];
	var truckString = "";
	truckString += "id: " + truck.id + "<br/>";
	truckString += "name: " + truck.name + "<br/>";
	truckString += "location: " + truck.location + "<br/>";
	truckString += "address: " + truck.address + "<br/>";
	truckString += "cuisine: " + truck.cuisine + "<br/>";
	truckString += "latitude: " + truck.lat + "<br/>";
	truckString += "longitude: " + truck.lng + "<br/>";
	truckString += "Opens: " + truck.time.open.hour + ":" + truck.time.open.minute + "<br/>";
	truckString += "Closes: " + truck.time.closed.hour + ":" + truck.time.closed.minute + "<br/>";
	truckString += "Menu: <br/><br/>";
	if(!isArrayEmpty(truck.menu)) { //if not empty
		for(let j = 0; j < truck.menu.length; j++) {
			truckString += truck.menu[j].name + ": $" + truck.menu[j].price + "<br/>";
		}
	} else {
		truckString += "No items in menu.<br/>";
	}
	truckString += "<br/>"
	
	return truckString;
}

//aey - print out all information in the array
function printTrucks() {
	if(isArrayEmpty(localTruckArray)) {
		outputMessage("No trucks loaded");
		outputToDisplay("No trucks loaded");
	} else {
		var truckList = "";
		for(let i = 0; i < localTruckArray.length; i++) {
			truckList += getTruckString(i) + "<br/>";
		}
		outputToDisplay(truckList);
		outputMessage("Successfully printed trucks");
	}
}


function outputToDisplay (string) {
	$("#displayArea").html(string);
}

function outputMessage (string) {
	$(".messageArea").html(string);
}

//aey - given an id, remove a truck
function removeTruck () {
	var index = findTruckWithID($("#removeTruck").val());
	
	if(index == -1) {
		outputMessage("Error: ID not found")
	} else if(index == -2 ){
		outputMessage("No trucks in local array")
	} else {
		if(localTruckArray.length == 1) { //if it is the last item
			localTruckArray = [0]; //set to our empty array format
		} else {
			localTruckArray.splice(index, 1);
		}
		printTrucks();				
	}
}

//aey - remove a menu item, given a truck id and a menu item name
function removeMenuItem() {
	var id = $("#removeMenuItemID").val();
	var name = $("#removeMenuItemName").val();
	//aey - first find the truck
	var truckindex = findTruckWithID(id);
	
	//aey - error checking
	if(truckindex == -1) {
		outputMessage("Error: ID not found")
	} else if(truckindex == -2 ) {
		outputMessage("No trucks in local array")
	} else {
		//aey - does menu item exist				
		if(doesMenuItemExist(id, name)) { //aey - if item is there
			var menuindex = getIndexOfMenuItem(id, name); //aey - get the index					
			if(localTruckArray[truckindex].menu.length == 1) { // aey - if only one truck left, change it to 0
				localTruckArray[truckindex].menu[0] = 0;
			} else {
				localTruckArray[truckindex].menu.splice(menuindex, 1); //aey - otherwise, just splice the array
			}
			printTrucks();
		} else outputMessage("Menu item not found");	
	}
}

/*
<select id="editFieldsDropdown">
	<option value="name">Name</option>
	<option value="loca">Location</option>
	<option value="addr">Address</option>
	<option value="cuis">Cuisine</option>
	<option value="lat">Latitude</option>
	<option value="lng">Longitude</option>
	<option value="hrO">Hour open</option>
	<option value="minO">Minute open</option>
	<option value="hrC">Hour closed</option>
	<option value="minC">Minute closed</option>
</select>
Enter new text:
<textarea class="addTableTextArea" id="newField"></textarea>
<br/><button onclick="editTruck()">Submit</button>

*/


//aey - edit a truck based on ID and field
function editTruck() {
	//aey - get the id the user asked for and check if it exists
	var editID = $("#id3").val();
	if(!doesTruckExist(editID)) {
		outputMessage("ID does not exist");
		return -1;
	} else {
		//aey - get user value input and make sure it isn't blank
		var editFieldValue = $("#newField").val();
		outputMessage("hiiii");
		if(editFieldValue = ''){
			outputMessage("New value cannot be blank");
			return -1;
		} else {
			//aey - get the text into a variable
			var userChoice = document.getElementById("editDrop").value;//$("#editFieldsDropdown").text;
			var index = findTruckWithID(editID);
			//aey - based on the selected drop-down option, parse the value
			
			var couldParse = true;
			switch (userChoice) {
				case "name":
					if(parseValue("text", editFieldValue)) {
						localTruckArray[index].name = String(editFieldValue);
					} 
					break;
				case "loca":
					if(parseValue("text", editFieldValue)) {
						localTruckArray[index].location = String(editFieldValue);
					}
					break;
				case "addr":
					if(parseValue("text", editFieldValue)) {
						localTruckArray[index].address = String(editFieldValue);
					}
					break;
				case "cuis":
					if(parseValue("text", editFieldValue)) {
						localTruckArray[index].cuisine = String(editFieldValue);
					}
					break;
				case "lat":
					if(parseValue("lat", editFieldValue)) {
						localTruckArray[index].lat = editFieldValue;
					}
					break;
				case "lng":
					if(parseValue("lng", editFieldValue)) {
						localTruckArray[index].lng = editFieldValue;
					}
					break;
				case "hrO":
					if(parseValue("hr", editFieldValue)) {
						localTruckArray[index].time.open.hour = editFieldValue;
					}
					break;
				case "hrC":
					if(parseValue("hr", editFieldValue)) {
						localTruckArray[index].time.closed.hour = editFieldValue;
					}
					break;
				case "minO":
					if(parseValue("min", editFieldValue)) {
						localTruckArray[index].time.open.minute = editFieldValue;
					}
					break;
				case "minC":
					if(parseValue("min", editFieldValue)) {
						localTruckArray[index].time.closed.minute = editFieldValue;
					}
					break;
				default:
					outputMessage("Invalid dropdown selection");
					break;
			}
		}
	}
}