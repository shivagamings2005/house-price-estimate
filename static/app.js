console.log("app.js loaded");

function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");
    for(var i in uiBathrooms) {
        if(uiBathrooms[i].checked) {
            return parseInt(i)+1;
        }
    }
    return -1; 
}

function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");
    for(var i in uiBHK) {
        if(uiBHK[i].checked) {
            return parseInt(i)+1;
        }
    }
    return -1; 
}

function onClickedEstimatePrice() {
    console.log("Estimate price button clicked");
    var sqft = document.getElementById("uiSqft");
    var bhk = getBHKValue();
    var bathrooms = getBathValue();
    var location = document.getElementById("uiLocations");
    var estPrice = document.getElementById("uiEstimatedPrice");

    console.log("Inputs:", {
        sqft: sqft.value,
        bhk: bhk,
        bathrooms: bathrooms,
        location: location.value
    });

    if (sqft.value <= 0 || bhk === -1 || bathrooms === -1 || !location.value) {
        estPrice.innerHTML = "<h2>Please fill all fields correctly</h2>";
        console.log("Validation failed");
        return;
    }

    var url = "/predict"; // Relative URL
    console.log("Sending POST to:", url);

    $.post(url, {
        total_sqft: parseFloat(sqft.value),
        bhk: bhk,
        bath: bathrooms,
        location: location.value
    }, function(data, status) {
        console.log("Response:", data, "Status:", status);
        if (status === "success" && data.estimated_price !== undefined) {
            estPrice.innerHTML = "<h2>" + data.estimated_price.toString() + " Lakh</h2>";
            console.log("Predicted Price:", data.estimated_price);
        } else {
            estPrice.innerHTML = "<h2>Error: " + (data.error || "Prediction failed") + "</h2>";
            console.log("Error:", data.error || "No estimated_price in response");
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        estPrice.innerHTML = "<h2>Error: Server request failed</h2>";
        console.log("Request failed:", textStatus, errorThrown, jqXHR.responseText);
    });
}

function onPageLoad() {
    console.log("Document loaded");
    var url = "/get_location"; // Relative URL
    console.log("Fetching locations from:", url);
    $.get(url, function(data, status) {
        console.log("Got response for location_names request:", data);
        if (data && data.locations) {
            var locations = data.locations;
            var uiLocations = document.getElementById("uiLocations");
            $('#uiLocations').empty();
            $('#uiLocations').append(new Option("Choose a Location", "", true, true));
            for (var i in locations) {
                var opt = new Option(locations[i]);
                $('#uiLocations').append(opt);
            }
        } else {
            console.log("Error loading locations:", data.error || "No locations in response");
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Location request failed:", textStatus, errorThrown, jqXHR.responseText);
    });
}

$(document).ready(function() {
    console.log("Document ready");
    $('#estimateButton').on('click', onClickedEstimatePrice);
    onPageLoad();
});