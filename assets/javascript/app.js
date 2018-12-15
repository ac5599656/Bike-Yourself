//https: cors - anywhere.herokuapp.com
let currentOrigin;
let currentReplacedOrigin;
let currentDestination;
let currentReplacedDest
const linkArray = [];
//when the first /second form is submit, it calls out the Google Direction API and converts the start and end destination into
//longitude and latitude.  It passes this information to the initMap to render the route and and traffic on the map.
function submit() {
    $("#form, #form-panel").submit(function (event) {
        event.preventDefault();
        console.log("submit works");
        const googleApiKey = 'AIzaSyDzgrHg1NotksoCzY-i-E98LuqKE-SH4Fg';
        let someOriginInput = $(event.currentTarget).find("#start").val().trim();
        someOriginInput = someOriginInput.replace(/\s+/g, '');

        let origin = $(event.currentTarget).find("#start").val().trim();
        let replacedOrigin = origin.split(' ').join('+');


        let someDestinationInput = $(event.currentTarget).find("#end").val().trim();
        someDestinationInput = someDestinationInput.replace(/\s+/g, '');

        currentOrigin = $(event.currentTarget).find("#start").val().trim();
        currentReplacedOrigin = currentOrigin.split(' ').join('+');
        console.log(currentReplacedOrigin);

        let destination = $(event.currentTarget).find("#end").val().trim();
        let replacedDest = destination.split(' ').join('+');
        console.log(someDestinationInput);

        currentDestination = $(event.currentTarget).find("#end").val().trim();
        currentReplacedDest = currentDestination.split(' ').join('+');
        console.log(currentReplacedDest);

        reset();
        let queryURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${someOriginInput}&destination=${someDestinationInput}&avoid=highways&mode=bicycling&key=${googleApiKey}`;
        console.log(queryURL);

        let encodedUrl = encodeURIComponent(queryURL);
        //call to geocodeAPI to get the latitute and longitude
        $.ajax({
            url: `https://corsbridge.herokuapp.com/${encodedUrl}`,
            contentType: 'application/json',
            type: 'GET',
            "success": function (data) {

                if (data.status == 'OK') {
                    console.log(data);
                    let startCoord = data.routes[0].legs[0].start_location;
                    console.log(startCoord);
                    let endCoord = data.routes[0].legs[0].end_location;
                    console.log(endCoord);


                    initMap(startCoord, endCoord);
                    showMap();
                    weatherData();
                }
                else {
                    $("#error").html("No existing bike route");
                }
            },
        })

    });

}

submit();
//reset form
function reset() {
    $('.form-input').val("");
}
//call the map function to render the route and traffic on the map
function initMap(startCoord, endCoord) {

    let directionsDisplay = new google.maps.DirectionsRenderer;
    let directionsService = new google.maps.DirectionsService;
    let start = new google.maps.LatLng(startCoord);
    let end = new google.maps.LatLng(endCoord);

    let mapOptions = {
        zoom: 15,
        center: start
    };
    let map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('right-panel'));
    calcRoute(start, end, directionsService, directionsDisplay);
    map.setMapTypeId('hybrid');

    let trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    // Dark green routes indicated dedicated bicycle routes. Light green routes indicate streets with dedicated “bike lanes.” Dashed routes indicate streets or paths otherwise recommended for bicycle usage.
    let bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);
}
//calcuate bike route
function calcRoute(start, end, directionsService, directionsDisplay) {
    let request = {
        origin: start,
        destination: end,
        travelMode: 'BICYCLING',

    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
    $("#right-panel").empty();

}
$('#new-route-button').on('click', function () {
    $("#form-panel").show();
    $("#new-route-button").hide();
})


//open weather data
function weatherData() {
    let URL = "https://api.openweathermap.org/data/2.5/weather";
    let key = "58c218efb9618338868686af4eb8ad1e";
    let units = "units=imperial";
    $.ajax({
        // ajax call takes url, type of connection, type of data we want to recieve from the api, then a callback function
        url: `https://api.openweathermap.org/data/2.5/weather?q=Tucson&${units}&APPID=${key}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            // invoking (calling the function) the results from the api 
            // weatherResults(data);

            weatherResult(data);
            console.log(data);
            console.log(data.main.temp);
            let temp = data.main.temp;
            console.log(data.weather[0].description);
            let descript = data.weather[0].description;
            console.log(data.weather[0].icon);
            let icon = data.weather[0].icon;
            console.log(data.wind.speed);
            let wind = data.wind.speed;

        },

    });
}
//show weather data 
function weatherResult(data) {
    let results = `  
    <div class="results">
    <h3>Weather for ${data.name},${data.sys.country}</h3>
    <p><span class="strong">Weather:</span> ${data.weather[0].main}<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" id="icon"></p>
    <p><span class="strong">Description: ${data.weather[0].description}</p>
    <p><span class="strong">Temperature: ${data.main.temp} &deg;</p>
    <p><span class="strong">Pressure: ${data.main.pressure} hpa</p>
    <p><span class="strong">Humidity: ${data.main.humidity} %</p>
    <p><span class="strong">Wind Speed: ${data.wind.speed} m/s</p>
    <p><span class="strong">Wind Direction: ${data.wind.deg} &deg;</p> 
    </div>`;
    $("#weatherInfo").html(results);
}
//hide weather info
$("#hide").click(function () {
    $("#weatherInfo").hide();
});
//show weather info
$("#show").click(function () {
    $("#weatherInfo").show();
});
//display first page
function displaySearch() {

    $(".buttonContainer").hide();
    $("#weatherInfo").hide();
    $("#new-route-button").hide();
    $('#hide').hide();
    $('#show').hide();
    $("#save-route").hide();
    $("body").removeClass(".secondpage");
    $("body").addClass(".landpage");
}
//display the second page
function showMap() {

    $('.logoGif').hide();
    $('.logo').show();
    $('.dropdown').show();
    $(".buttonContainer").show();
    $("#weatherInfo").show();
    $("#new-route-button").show();
    $('#hide').show();
    $('#show').show();
    $("#save-route").show();
    $("#right-panel").css('display');
    $(".map").css('display', 'block');
    $(".secondpage").show();
    $("body").removeClass(".landpage");
    $("body").addClass(".seconpage")
    $(".tucsonImage").hide();

}
//gets the start and destination to be part of the route link
$(document).on("click", '#save-route', function (event) {

    console.log('`saveRoute` ran');
    const mapLink = `https://www.google.com/maps/dir/?api=1&origin=${currentReplacedOrigin}&destination=${currentReplacedDest}&travelmode=bicycling`;
    console.log(mapLink);
    addItemToDropDown(mapLink);
    renderLinkList();
});

//push the maplink into the linkArray
function addItemToDropDown(mapLink) {
    console.log(`Adding "${mapLink}" to link list`);
    linkArray.push({ name: mapLink, checked: false });
}

function renderLinkList() {
    // render the link list in the DOM
    console.log('`renderLinkList` ran');
    const listItemsString = generateLinkItemsString(linkArray);

    // insert that HTML into the DOM
    $('.dropdown-menu').html(listItemsString);
}
//generate string using the object in the linkArray
function generateLinkItemsString(linkArray) {
    console.log("Generating link list element");

    const items = linkArray.map((item, index) => generateItemElement(item, index));
    console.log(items);
    return items.join("");

}
//when the dropdwon menu is clicked, getItemIndexFromElement and renderLinklist are called.
function handleItemCheckClicked() {
    $('.dropdown-menu').on('click', `.js-item-toggle`, event => {
        console.log('`handleItemCheckClicked` ran');
        const itemIndex = getItemIndexFromElement(event.currentTarget);
        renderLinkList();
    });
}
//return a li with the map link and the delete button
function generateItemElement(item, itemIndex, template) {
    return `
   <li class=" dropdown-item js-item-index-element" data-item-index="${itemIndex}">
    <a class="link-item" href= "${item.name}"target="_blank"}>${item.name}</a>
    <div class="link-item-controls">
     <button class="link-item-delete js-item-delete">
       <span class="button-label">delete</span>
     </button>
    </div>
   </li>`;
}
//get index from the item
function getItemIndexFromElement(item) {
    const itemIndexString = $(item)
        .closest('.js-item-index-element')
        .attr('data-item-index');
    return parseInt(itemIndexString, 10);
}
//delete the link
function deleteItem(itemIndex) {
    console.log("Adding checked property for item at index " + itemIndex);
    linkArray.splice(itemIndex, 1);
}

function handleDeleteItemClicked() {
    // this function will be responsible for when users want to delete a link list
    // item

    $('.dropdown-menu').on('click', '.js-item-delete', event => {
        console.log('`handleDeleteItemClicked` ran');
        const itemIndex = getItemIndexFromElement(event.currentTarget);
        deleteItem(itemIndex);
        renderLinkList();

    });
}
//calls out the renderLinkList, handleItemCheckClicked,and handleDeleteItemClick
function handleLinkList() {
    renderLinkList();
    handleItemCheckClicked();
    handleDeleteItemClicked();
}
//call handleLinkList method
handleLinkList();