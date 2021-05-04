var searchResults=$('#search-results')
var cityOrder=0
const delay = ms => new Promise(res => setTimeout(res, ms));

hideSpinner()
//Adding click events to button for searching
$(".city-button").click(async function(){
    var originCity = $(".origin-city").val();    
    var destinationCity = $(".destination-city").val();  
    var maxFlights= 10
    var depDate= $(".depature-date").val();
    var result=true
    // result=searchFlightOffers(originCity,destinationCity,maxFlights,depDate)
    // if (result){
    //     searchHotel(destinationCity)
    // }
    searchDestCode(destinationCity);
    console.log(1);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec
    console.log(2);
    searchOriginCode(originCity);
    console.log(3);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec
    console.log(4);
    console.log(myGlobalOriginCode);
    console.log(myGlobalDestCode);
    searchFlightOffers(myGlobalOriginCode, myGlobalDestCode, maxFlights, depDate);
    console.log(3);
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    console.log(4);
    searchHotel(myGlobalDestCode);
});

async function searchDestCode(destinationCity) {
    // showSpinner()
    $.ajax({
        type: "POST",
        url: "https://test.api.amadeus.com/v1/security/oauth2/token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id": "g74uwdzCBnGRJAPXHD0qN4oFECb0ACTS",
            "client_secret": "rHXwsbMdgjIDrQFK",
        },
        success: function (data) {
            console.log('Starting dest search...');
            var token = data.access_token
            var url = "https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=" + destinationCity;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", 'Bearer ' + token);
            xhr.onreadystatechange = function () {
                console.log(url);
                if (xhr.readyState === 4) {
                    var destCitySearch = (JSON.parse(xhr.responseText));
                    console.log(destCitySearch);
                    destCityCode = destCitySearch.data[0].address.cityCode;
                    console.log("Destination: ", destCityCode);
                    myGlobalDestCode = destCityCode;
                    // hideSpinner()
                }
            };
            xhr.send();
        },
        dataType: "json"
    });
}

async function searchOriginCode(originCity) {
    // showSpinner()
    $.ajax({
        type: "POST",
        url: "https://test.api.amadeus.com/v1/security/oauth2/token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id": "g74uwdzCBnGRJAPXHD0qN4oFECb0ACTS",
            "client_secret": "rHXwsbMdgjIDrQFK",
        },
        success: function (data) {
            console.log('Starting origin search...');
            var token = data.access_token
            var url = "https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=" + originCity;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", 'Bearer ' + token);
            xhr.onreadystatechange = function () {
                console.log(url);
                if (xhr.readyState === 4) {
                    var originCitySearch = (JSON.parse(xhr.responseText));
                    console.log(originCitySearch);
                    originCityCode = originCitySearch.data[0].address.cityCode;
                    console.log("Origin: ", originCityCode);
                    //     hideSpinner()
                    myGlobalOriginCode = originCityCode;
                }
            };
            xhr.send();
        },
        dataType: "json"
    });
}

async function searchFlightOffers(originCityCode,destCityCode,max,departureDate){  
    showSpinner()
    $.ajax({
        type: "POST",
        url: "https://api.amadeus.com/v1/security/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id":"ZlNa8ALtEvqAK9GisfbhwVQXPtG948IQ",
            "client_secret":"i9G2pT6GN8Ux7Hev"
        },
        success: function(data) {
          var token=data.access_token
          origin=myGlobalOriginCode;
          destination=myGlobalDestCode;
          var url="https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode="+myGlobalOriginCode+"&destinationLocationCode="+myGlobalDestCode+"&departureDate="+departureDate+"&adults=1&nonStop=true&max="+max
          var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onloadend = function() {
                if(xhr.status === 404 || xhr.status === 400){ 
                    $("#modal-button-error").click()
                     hideSpinner()
                    throw new Error(url);
                }
            }  
            xhr.setRequestHeader("Authorization", 'Bearer '+token);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4  && xhr.status==200) {                
                    var flights = (JSON.parse(xhr.responseText));
                    if (flights.data.length==0){
                        $("#modal-button-not-found").click()
                        hideSpinner()
                        return false
                    }
                    var out=""
                    for(a = 0; a < flights.data.length; a++) {
                        out +=flights.data[a].itineraries[0].segments[0].departure.iataCode+" "+flights.data[a].itineraries[0].segments[0].departure.at+"-------->"+flights.data[a].itineraries[0].segments[0].arrival.iataCode+" "+ flights.data[a].itineraries[0].segments[0].arrival.at+'<br/>';
                    }
                     document.getElementById("origin-destination").innerHTML = myGlobalOriginCode+"-------->"+myGlobalDestCode+" "+departureDate;
                     document.getElementById("flights-content").innerHTML = out; 
                     cityOrder++
                     
                     var parameters={
                         origin:origin,
                         destination:destination,
                         departureDate:departureDate,
                         adults:1,
                         nonStop:true,
                         max:max,
                     }
                    

                    //Persisting Data
                     // Put the object into storage
                     localStorage.setItem(cityOrder,JSON.stringify(parameters)); 

                     var cityNameButton=document.createElement('button')
                    searchResults.append(cityNameButton)
                    cityNameButton.setAttribute("id",origin+"-"+destination)
                    cityNameButton.setAttribute("class", "button primary expanded")
                    cityNameButton.textContent=origin+"-"+destination

                    //Adding Click Events For Each Origin And Destination City Button Added
                    $("#"+origin+"-"+destination).on('click', {origin,destination,max,departureDate}, function(e) {
                        searchFlightOffersButtons(e.data.origin,e.data.destination,e.data.max,e.data.departureDate);
                        searchHotelButtons(e.data.destination);
                      });
                     hideSpinner()
                }
            };
            xhr.send();
        },
        dataType: "json"
      });  
      return true    
} 

async function searchHotel(myGlobalDestCode){  
    showSpinner()
    $.ajax({
        type: "POST",
        url: "https://api.amadeus.com/v1/security/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id":"ZlNa8ALtEvqAK9GisfbhwVQXPtG948IQ",
            "client_secret":"i9G2pT6GN8Ux7Hev"
        },
        success: function(data) {
          var token=data.access_token
          var url = "https://api.amadeus.com/v2/shopping/hotel-offers?cityCode="+myGlobalDestCode;
          var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", 'Bearer '+token);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {                
                    var hotels = (JSON.parse(xhr.responseText));
                    var hotelContainer=document.getElementById("cards")
                    hotelContainer.innerHTML=""
                    $(hotelContainer).empty()
                    var idHotel=""
                    for(i = 0; i < hotels.data.length; i++) { 
                        var card = document.createElement('div');
                        var cardHeader=document.createElement('div');
                        hotelContainer.append(card);
                        card.classList.add("card");
                        card.append(cardHeader);
                        cardHeader.classList.add("card-divider");
                        cardHeader.textContent = hotels.data[i].hotel.name
                    }
                    hideSpinner()
                }
            };
            xhr.send();                        
        },
        dataType: "json"
      });      
} 

function hideSpinner() {
    document.getElementById('spinner')
            .style.display = 'none';
} 

function showSpinner() {
    document.getElementById('spinner')
            .style.display = 'block';
} 

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function init(){
    if (localStorage.length!=0){

        //Getting Local Storage Key Values Pairs
        let arrayOfKeys = Object.keys(localStorage);
        let arrayOfValues = Object.values(localStorage);
        let localstorage = {};

        //Building An Object From Local Storage Key Values Pairs
        for (var i = 0; i < localStorage.length; i++){
            localstorage[arrayOfKeys[i]] = arrayOfValues[i]
        }

        let citiesNames = [];

        //Building A Multidimentional Array From Local Storage Object
        for (var item in localstorage) {
            citiesNames.push([item, localstorage[item]]);
        }
        

        let numOfCities =citiesNames.length
        var objParameters={}
        //Loop For Filling Origin And Destination City Names Button
        for (var i=0; i<numOfCities;i++){ 
            objParameters=(JSON.parse(citiesNames[i][1]))
            var cityNameButton=document.createElement('button')
            searchResults.append(cityNameButton)
            cityNameButton.setAttribute("id",objParameters.origin+"-"+objParameters.destination)
            cityNameButton.setAttribute("class", "button primary expanded")
            cityNameButton.textContent=objParameters.origin+"-"+objParameters.destination            
            
            $("#"+objParameters.origin+"-"+objParameters.destination).on('click', {objParameters}, function(e) {
                searchFlightOffersButtons(e.data.objParameters.origin,e.data.objParameters.destination,e.data.objParameters.max,e.data.objParameters.departureDate);
                searchHotelButtons(e.data.objParameters.destination);
              });
              cityOrder++
        }    
    }
}

function searchFlightOffersButtons(origin,destination,max,departureDate){  
    showSpinner()
    $.ajax({
        type: "POST",
        url: "https://api.amadeus.com/v1/security/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id":"ZlNa8ALtEvqAK9GisfbhwVQXPtG948IQ",
            "client_secret":"i9G2pT6GN8Ux7Hev"
        },
        success: function(data) {
          var token=data.access_token
          var url="https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode="+origin+"&destinationLocationCode="+destination+"&departureDate="+departureDate+"&adults=1&nonStop=true&max="+max
          var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onloadend = function() {
                if(xhr.status === 404 || xhr.status === 400){ 
                    $("#modal-button-error").click()
                     hideSpinner()
                    throw new Error(url);
                }
            }  
            xhr.setRequestHeader("Authorization", 'Bearer '+token);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4  && xhr.status==200) {                
                    var flights = (JSON.parse(xhr.responseText));
                    if (flights.data.length==0){
                        $("#modal-button-not-found").click()
                        hideSpinner()
                        return false
                    }
                    var out=""
                    for(a = 0; a < flights.data.length; a++) {
                        out +=flights.data[a].itineraries[0].segments[0].departure.iataCode+" "+flights.data[a].itineraries[0].segments[0].departure.at+"-------->"+flights.data[a].itineraries[0].segments[0].arrival.iataCode+" "+ flights.data[a].itineraries[0].segments[0].arrival.at+'<br/>';
                    }
                     document.getElementById("origin-destination").innerHTML = origin.toUpperCase()+"-------->"+destination.toUpperCase()+" "+departureDate;
                     document.getElementById("flights-content").innerHTML = out; 
                     
                     hideSpinner()
                }
                
            };
            xhr.send();
        },
        dataType: "json"
      });  
      return true    
} 

function searchHotelButtons(city){  
    showSpinner()
    $.ajax({
        type: "POST",
        url: "https://api.amadeus.com/v1/security/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
            "grant_type": "client_credentials",
            "client_id":"ZlNa8ALtEvqAK9GisfbhwVQXPtG948IQ",
            "client_secret":"i9G2pT6GN8Ux7Hev"
        },
        success: function(data) {
          var token=data.access_token
          var url = "https://api.amadeus.com/v2/shopping/hotel-offers?cityCode="+city;
          var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", 'Bearer '+token);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {                
                    var hotels = (JSON.parse(xhr.responseText));
                    var hotelContainer=document.getElementById("cards")
                    hotelContainer.innerHTML=""
                    $(hotelContainer).empty()
                    var idHotel=""
                    for(i = 0; i < hotels.data.length; i++) { 
                        var card = document.createElement('div');
                        var cardHeader=document.createElement('div');
                        hotelContainer.append(card);
                        card.classList.add("card");
                        card.append(cardHeader);
                        cardHeader.classList.add("card-divider");
                        cardHeader.textContent = hotels.data[i].hotel.name
                    }
                    hideSpinner()
                }
            };
            xhr.send();                        
        },
        dataType: "json"
      });      
}

init()
