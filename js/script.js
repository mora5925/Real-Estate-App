let city = $(".city").val();
let state = $(".state").val();
let bedsMin = $(".beds-min").val();
let bathsMin = $(".baths-min").val();
let priceMax = $(".price-max").val();
let limit = $(".results-limit").val();
let zip = '';
let lat = '';
let long = '';
let propertyID = '';
let listingID = '';

//Takes care of the form submission. If someone searches without entering a city, it will fire the errorModal function, otherwise, we are good to move on to the next function.
$('body').on('submit', '.search', function (e) {
  e.preventDefault();
  if ($(".city").val() === '') {
    errorModal();
    return false;
  }
  state = $(".state").val();
  city = $(".city").val();
  bedsMin = $(".beds-min").val();
  bathsMin = $(".baths-min").val();
  priceMax = $(".price-max").val();
  limit = $(".results-limit").val();
  doTheThing();
});

//If someone tries to search without entering a value to the "city" text input, kindly ask them to enter a city and try again.
function errorModal() {
  UIkit.modal("#my-id").show();
}

//When a user clicks the "More Info" button, we make additional calls for data specific to that property. 
$('body').on('click', '.more-info', function (e) {
  e.preventDefault();

//Grab the listing/property id's that we added to each info button in the initial search. These will be used to get more data about the individual properties.  
  propertyID = e.target.getAttribute("property-id");
  listingID = e.target.getAttribute("listing-id");

//Before populating the modal, make sure everything is emptied out from any earlier viewings
  $(".slideshow-h1").empty();
  $(".slideshow-h3").empty();
  $(".uk-slideshow-items").empty();
  $(".property-details").empty();
  $(".property-desc").empty();
  $(".property-info").empty();
  $(".additional-info").empty();

//Give each column a header
  var propertyInfoH2 = $("<h2>");
  var additionalInfoH2 = $("<h2>");
  propertyInfoH2.addClass("modal-h2");
  additionalInfoH2.addClass("modal-h2");
  propertyInfoH2.text("Property Info");
  additionalInfoH2.text("Local Info");
  $(".property-info").append(propertyInfoH2);
  $(".additional-info").append(additionalInfoH2);


//Use the saved listing/property id's to make another call which provides more detailed information about the property. 
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://realtor.p.rapidapi.com/properties/detail?listing_id=" + listingID + "&prop_status=for_safor_rent&property_id=" + propertyID,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "realtor.p.rapidapi.com",
      "x-rapidapi-key": "f01f3e944fmsh3ad5fc7e5b2eef4p165b37jsn480129929052"
    }
  }
  $.ajax(settings).done(function (response) {
  
  //Save the latitude, longitude, and zip code for the property, so we can grab some <very> localized data that may be interesting and useful for the user.
    lat = response.listing.address.lat;
    long = response.listing.address.long;
    zip = response.listing.address.postal_code;
    $(".slideshow-h1").text(response.listing.address.line);
    $(".slideshow-h3").text(response.listing.address.city + ", " + response.listing.address.state_code);
    $(".property-desc").text(response.listing.description);


  //Set up area for local school information
    var schoolsHeader = $("<h3>");
    schoolsHeader.text("Local Schools:")
    var schoolsUL = $("<ul>");
    schoolsUL.addClass("modal-ul");

  //Make sure the school data is there, and then add the info if it is
    if (response.listing.school_catchments != null) {
      for (i = 0; i < response.listing.school_catchments.length; i++) {
        var schoolNames = $("<li>");
        schoolNames.text(response.listing.school_catchments[i].name);
        schoolsUL.append(schoolNames);
      }
    }

  //Display amenities provided
    var featuresHeader = $("<h3>");
    featuresHeader.text("Amenities:");
    var featuresUL = $("<ul>")
    featuresUL.addClass("modal-ul");
  
  //Create list for amenities
    for (i = 0; i < response.listing.features[1].text.length; i++) {
      var featuresLi = $("<li>");
      featuresLi.text(response.listing.features[1].text[i]);
      featuresUL.append(featuresLi);
    }

  //Add slideshow with all photos provided
    for (i = 0; i < response.listing.photos.length; i++) {
      var slideShowLi = $("<li>");
      var slideShowImage = $("<img>");
      slideShowImage.attr("src", response.listing.photos[i].href);
      slideShowImage.attr("uk-cover", '');
      slideShowLi.append(slideShowImage);
      $(".uk-slideshow-items").append(slideShowLi);
      $(".slideshowContainer").removeClass("hide");
    }

  //Add the elements to the modal
    $(".property-info").append(featuresUL);
    $(".property-info").append(schoolsUL);
    featuresUL.prepend(featuresHeader);
    schoolsUL.prepend(schoolsHeader);

    // Weather API call
    // Weather (uses the zip for the specific property chosen)
    var weatherURL = "https://api.worldweatheronline.com/premium/v1/weather.ashx?key=5be4b040100d48a7b1d235820202409&q=" + zip + "&date=2020-01-01&enddate=2020-12-31&format=json";

    $.ajax({
      url: weatherURL,
      method: "GET"
    }).then(function (weatherResponse) {

      // Header's for average seasonal temperture
      var weatherh3 = $("<h3>");
      weatherh3.text("City's Average Seasonal Temperatures: ");

      // Variables for the various UL's and Il's for the list
      var weatherUl = $("<ul>");
      var springLi = $("<li>");
      var springLiTemp = $("<li>");
      var summerLi = $("<li>");
      var summerLiTemp = $("<li>");
      var fallLi = $("<li>");
      var fallLiTemp = $("<li>");
      var winterLi = $("<li>");
      var winterLiTemp = $("<li>");

      // Spring min/max temp
      springLi.text("Spring's Temperatures: ")
      springLiTemp.text(weatherResponse.data.ClimateAverages[0].month[3].avgMinTemp_F + "\xB0" + " - " + weatherResponse.data.ClimateAverages[0].month[3].absMaxTemp_F + "\xB0");
      // Summer min/max temp
      summerLi.text("Summer's Temperatures: ")
      summerLiTemp.text(weatherResponse.data.ClimateAverages[0].month[5].avgMinTemp_F + "\xB0" + " - " + weatherResponse.data.ClimateAverages[0].month[5].absMaxTemp_F + "\xB0");
      // Fall min/max temp
      fallLi.text("Fall's Temperatures: ")
      fallLiTemp.text(weatherResponse.data.ClimateAverages[0].month[8].avgMinTemp_F + "\xB0" + " - " + weatherResponse.data.ClimateAverages[0].month[8].absMaxTemp_F + "\xB0");
      // Winter min/max temp
      winterLi.text("Winter's Temperatures: ")
      winterLiTemp.text(weatherResponse.data.ClimateAverages[0].month[11].avgMinTemp_F + "\xB0" + " - " + weatherResponse.data.ClimateAverages[0].month[11].absMaxTemp_F + "\xB0");

      // Weather information Appends
      weatherUl.append(weatherh3)
      weatherUl.append(springLi);
      weatherUl.append(springLiTemp);
      weatherUl.append(summerLi);
      weatherUl.append(summerLiTemp);
      weatherUl.append(fallLi);
      weatherUl.append(fallLiTemp);
      weatherUl.append(winterLi);
      weatherUl.append(winterLiTemp);

      //Weather information styling
      weatherUl.addClass("modal-ul");
      springLi.addClass("noStyle");
      summerLi.addClass("noStyle");
      fallLi.addClass("noStyle");
      winterLi.addClass("noStyle");

      // Append ul
      $(".additional-info").append(weatherUl)

    });

    // Air quality API call
    // Air quality (uses the stored lat/lon of the property. Very localized data, which is great.)
    var airURL = "https://api.weatherbit.io/v2.0/forecast/airquality?lat=" + lat + "&lon=" + long + "&key=dfa7440a3f3e4f539ce11b040f486d22";

    $.ajax({
      url: airURL,
      method: "GET"
    }).then(function (airResponse) {

      // Header's for current air quality
      var airH3 = $("<h3>");
      airH3.text("City's Current Air Quality: ");

      //Variables for the various UL's and Il's for the list
      var airUl = $("<ul>");
      var airLi = $("<li>");
      var airSpan = $("<span>")

      // Current air quality
      airLi.text("Air Quality Index: ")
      airSpan.text(airResponse.data[0].aqi);

      // Append h3
      airUl.append(airH3);
      airLi.append(airSpan);

      // Append ul
      airUl.append(airLi);
      $(".additional-info").append(airUl)

      //Air quality styling
      airUl.addClass("modal-ul");

      if (airResponse.data[0].aqi < 51){
        airSpan.addClass("good-airQuality")
        airSpan.removeClass("fair-airQuality")
        airSpan.removeClass("poor-airQuality")
        airSpan.removeClass("bad-airQuality")
      }
      if (airResponse.data[0].aqi > 50 && airResponse.data[0].aqi < 101){
        airSpan.removeClass("good-airQuality")
        airSpan.addClass("fair-airQuality")
        airSpan.removeClass("poor-airQuality")
        airSpan.removeClass("bad-airQuality")
      }
      if (airResponse.data[0].aqi > 101 && airResponse.data[0].aqi < 151){
        airSpan.removeClass("good-airQuality")
        airSpan.removeClass("fair-airQuality")
        airSpan.addClass("poor-airQuality")
        airSpan.removeClass("bad-airQuality")
      }
      if (airResponse.data[0].aqi > 150){
        airSpan.removeClass("good-airQuality")
        airSpan.removeClass("fair-airQuality")
        airSpan.removeClass("poor-airQuality")
        airSpan.addClass("bad-airQuality")
      }
    });

    // Gas price API call
    // Gas price (also allows us to search based on coordinates, in order to provide a more accurate representation of local prices)
    var gasURL = "https://api.collectapi.com/gasPrice/fromCoordinates?lng=" + long + "&lat=" + lat;

    $.ajax({
      url: gasURL,
      method: "GET",
      headers: { "Authorization": "apikey 1eoi3HRiAnugLyw6Y99v9Y:2uljHBfqlMNhbJkWQUyDBa" }
    }).then(function (gasResponse) {
   
      //Header's for gas current price
      var gasH3 = $("<h3>");
      gasH3.text("City's Current Gas Price: ");

      ///Variables for the various UL's and Il's for the list
      var gasUl = $("<ul>");
      var gasLi = $("<li>");

      // Current gas price
      gasLi.text("Gas price: $" + Math.round(gasResponse.result.gasoline * 100) / 100);

      // Append h3
      gasUl.append(gasH3);

      // Append ul
      gasUl.append(gasLi);
      $(".additional-info").append(gasUl)

      // Gas price styling
      gasUl.addClass("modal-ul");
    });
  });
});

/* 
Main search function for the page. Appends user's form selections to an initial API call, which populates the page with data from the response.
*/
function doTheThing() {

  $("#searchResults").empty();
  
      //change footer css (needs to start as fixed)
      $("#footer").css("position", "fixed");

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://realtor.p.rapidapi.com/properties/v2/list-for-rent?sort=relevance&city=" + city + "&state_code=" + state + "&beds_min=" + bedsMin + "&baths_min=" + bathsMin + "&price_max=" + priceMax + "&limit=" + limit + "&offset=0",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "realtor.p.rapidapi.com",
      "x-rapidapi-key": "f01f3e944fmsh3ad5fc7e5b2eef4p165b37jsn480129929052"
    }
  }

  $.ajax(settings).done(function (response) {

    //Grid area for the cards
    var cardGrid = $("<div>");

    //Creates a card with the various elements needed for displaying response info
    for (i = 0; i < response.properties.length; i++) {
      var cardDiv = $("<div>");
      var propertyInfo = $("<ul>");
      var innerDiv = $("<div>");
      var propertyImage = $("<img>");
      var address = $("<li>");
      var cityState = $("<li>");
      var propertyType = $("<li>");
      var propertyURL = $("<li>");
      var infoButton = $("<button>");

    //This is necessary to ensure no errors for any listing that does not have a photo. Checks the photo count, and if it is more than 0, add the image.
    if (response.properties[i].photo_count != 0) {
        propertyImage.attr("src", response.properties[i].photos[0].href);
      }

    //Add the various classes for each card element
      cardGrid.addClass("uk-grid-column-small uk-grid-row-large uk-child-width-1-3@s uk-text-center");
      cardDiv.addClass("uk-card uk-card-default uk-card-body");
      infoButton.addClass("button");
      infoButton.addClass("more-info uk-button uk-button-default uk-margin-small-right");
      propertyInfo.addClass("card-ul");
      cardDiv.addClass("card");
      propertyImage.addClass("property-image");
      innerDiv.addClass("result-card");
    
    //Set data attributes necessary for uikit, and add the listing id/property id to each button and photo for access later.
      cardGrid.attr("uk-grid", "");
      infoButton.attr("type", "button");
      infoButton.attr("tpye", "button");
      infoButton.attr("uk-toggle", "target: #modal-close-default");
      infoButton.attr("listing-id", response.properties[i].listing_id);
      infoButton.attr("property-id", response.properties[i].property_id);
      propertyImage.attr("listing-id", response.properties[i].listing_id);
      propertyImage.attr("property-id", response.properties[i].property_id);
      innerDiv.attr("result", i);

    //Add appropriate text to each element, and append to page.
      address.text(response.properties[i].address.line);
      cityState.text(city + ', ' + state);
      propertyType.text(response.properties[i].prop_type);
      infoButton.text("More Info");
      propertyURL.html("<a href=" + response.properties[i].rdc_web_url + ">Link to Property</a>");
      propertyInfo.append(address);
      propertyInfo.append(cityState);
      propertyInfo.append(propertyType);
      propertyInfo.append(propertyURL);
      cardDiv.append(propertyInfo);
      cardDiv.append(infoButton);
      cardDiv.prepend(propertyImage);
      innerDiv.append(cardDiv);
      $(".uk-grid-column-small").append(innerDiv);

    //change footer css (needs to start as fixed)
      $("#footer").css("position", "relative");
    }
  })
}

