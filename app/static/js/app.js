/**
 * @author Paulo Porto
 * @required knockout.js (http://knockoutjs.com/downloads/index.html)
 * @required jquery.min (https://jquery.com/download/)
 * @required sweetalert.min (http://t4t5.github.io/sweetalert/)
 */

//map var global declaration
var map;
//object global to set infowindow on map
var address = {};
//variable to show current infowindow on map
var currInfowindow =false;
//map marker object to map
var marker;
//list of marker on map
var markers = [];
var geocoder;
//array list of positions marker in the map
var positions = [];

var viewModel =null;

$(document).ready(function () {
   navigator.geolocation.getCurrentPosition(getLocation);
});

function Neighborhood(data) {
    this.id          = ko.observable(data.id);
    this.name        = ko.observable(data.name);
    this.description = ko.observable(data.description);
    this.lat         = ko.observable(data.lat);
    this.lng         = ko.observable(data.lng);
    this.place_id    = ko.observable(data.place_id);
}

function TaskListViewModel() {
	var self = this;
	self.filter = ko.observable('');

	self.neighborhoods = ko.observableArray([]);
    self.itemsFilter = ko.observableArray([]);
    self.venues = ko.observableArray([]);

    self.latLng =  ko.observable();
    self.name = ko.observable();
    self.description = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.place_id = ko.observable();
    self.warning = ko.observable('d-flex justify-content has-warning');
    self.missing = ko.observable('missing');
    self.address = ko.observable('');

    /** Call save address and clean variables */
    self.addAddress = function() {
        self.save();
        self.name("");
        self.description("");
        self.lat("");
        self.lng("");
        self.place_id("");
        self.filter("");
    };

    /** Find all address saved */
    self.findPlace = function(){
        self.venues([]);
        $.ajax({
            type : 'GET',
            url: "https://api.foursquare.com/v2/venues/explore?ll="+lat+","+lng+
                        "&oauth_token=OAUTH_TOKEN&v=20170626&query="+self.address()+"",
            }).done(function(result) {
                $("#venues").removeClass('hidder');
                var dataobj = result.response.groups[0].items;
                if(dataobj.length > 0){
                    $.each( dataobj, function() {
                        if(this.venue.location.address){
                            self.venues.push(this.venue);
                        }
                    });
                    $("#btn-right").removeClass("hidder");
                    $("#btn-right").addClass("active");
                    $("#box-right").addClass("active");
                }else{
                    sweetAlert("Oops...", "That place not found!", "error");
                    return;
                }
            }).fail(function() {
                sweetAlert("Oops...", "Something went wrong!", "error");
                return;
        });
    };

    self.showInMap = function(data){

        var addAddress = "";
        if(!data.location.address){
            addAddress = data.location.address;
        }else{
            addAddress = data.name;
        }

        $.ajax({
            url : 'https://maps.googleapis.com/maps/api/geocode/json',
            type : 'GET',
            data : {
                address : addAddress,
                sensor : false
            },
            async : false,
            }).done(function(result) {
                if(result.status === "OK"){
                    try {
                        address.lat = result.results[0].geometry.location.lat;
                        address.lng = result.results[0].geometry.location.lng;
                        address.name = result.results[0].address_components[0].long_name;
                        address.description = result.results[0].formatted_address;
                        address.place_id = result.results[0].place_id;
                        address.location = result.results[0].geometry.location;

                        for (var i=0; i < result.results[0].address_components.length; i++){
                            for (var f=0; f < result.results[0].address_components[i].types.length; f++){
                                if(result.results[0].address_components[i].types[f] == 'locality' ||
                                    result.results[0].address_components[i].types[f] =='route'){
                                    name = result.results[0].address_components[i].long_name;
                                    break;
                                }
                                continue;
                            }
                            continue;
                        }

                        self.name(address.name);
                        self.lat(address.lat);
                        self.lng(address.lng);
                        self.description(address.description);
                        self.place_id(address.place_id.toString());

                        showMakerFromFindPlace(address,data);
                        geocoder = new google.maps.Geocoder();

                    } catch(err) {
                        address = null;
                    }
                }
                $("#btn-right").removeClass("active");
                $("#box-right").removeClass("active");
            }).fail(function() {
                sweetAlert("Oops...", "Something went wrong!", "error");
                return;
            });
    };

    /** Show place that clicked */
    self.showPlace = function(data) {
        var position = {};
        var place_id = '';
        var name ='';
        var description='';

        ko.utils.arrayFilter(self.neighborhoods(), function(item) {
            if(data == item){
                place_id =  item.place_id().toString();
                name =  item.name().toString();
                description =  item.description().toString();
                position = {lat: parseFloat(item.lat().toString()), lng: parseFloat(item.lng().toString())};
                return;
            }
        });

        var bounds = new google.maps.LatLngBounds();
        //remove all animation
        for (var j = 0; j < markers.length; j++) {
            markers[j].setAnimation(null);
        }

        for (var j = 0; j < markers.length; j++) {
            if(markers[j].id == place_id){
                map.setZoom(10);
                markers[j].setAnimation(google.maps.Animation.BOUNCE);
                markers[j].setMap(map);
                bounds.extend(markers[j].position);
           }else{
                markers[j].setAnimation(null);
           }
        }

        var contentString = '<div class="card">'+
                        ' <p class="card-head" >'+ name + '</p>'+
                        ' <p>'+ description+ '</p>'+
                        '</div>';
        var infoWindow = new google.maps.InfoWindow({content: contentString, pixelOffset: new google.maps.Size(0,-40)});
        if(currInfowindow){
            currInfowindow.close();
        }

        currInfowindow = infoWindow;
        currInfowindow.setPosition(position);
        currInfowindow.open(map);

        map.fitBounds(bounds);
        map.setCenter(position);
    };

	$.getJSON( "/neighborhoods", function(data) {
        var neighborhoods = $.map(data.neighborhoods, function(neighborhood) {
	        return new Neighborhood(neighborhood);
	    });
        self.neighborhoods(neighborhoods);
    })
    .done(function() {
        setMarkers(map, self.neighborhoods());
        showListings();
    })
    .fail(function() {
        sweetAlert("Oops...", "Something went wrong!", "error");
    });

    /* show all markers when filter is blank*/
    ko.bindingHandlers.showAllMarkersWhenClearFilter= {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = allBindingsAccessor().value();
            if(!value){
                self.itemsFilter = ko.utils.arrayFilter(self.neighborhoods(), function(item, index) {
                    positions.push({'place_id':item.place_id().toString()});
                    return true;
                });

                if(self.itemsFilter.length > 0){
                    showListings();
                }
            }
        }
    };

    self.clearFilter = function(){
        self.filter("");
        showListings();
        map.setZoom(10);
    };

    /**Filter on list by name that place what you looking for*/
	self.filteredItems = ko.computed(function () {
        positions =[];
        var filter = self.filter();
        if (!filter) {
            return self.neighborhoods();
        }else{

            self.itemsFilter = ko.utils.arrayFilter(self.neighborhoods(), function(item, index) {
                var neighborhood = item.name().toString().toUpperCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                positions.push({'place_id':item.place_id().toString()});
                return neighborhood.indexOf(filter.toUpperCase()) > -1;
            });
            showListings();
            return self.itemsFilter;
        }
    });

    self.save = function() {
        return $.ajax({
            url: '/neighborhood/new',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
            'name': self.name(),
            'description': self.description(),
            'lat': self.lat(),
            'lng': self.lng(),
            'place_id': self.place_id()
            }),
        }).done(function(data) {
                var neighborhood = new Neighborhood({ id: data.id, name: data.name,
                    description: data.description, lat:data.lat, lng:data.lng, place_id: data.place_id});
                self.neighborhoods.push(neighborhood);
                var position ={lat: parseFloat(data.lat), lng: parseFloat(data.lng)};
                if(marker){
                    marker.setMap(null);
                }
                addMarker(position, map, data.name,data.description, data.place_id);

            swal("Good job!", "New place was saved!", "success");
            return;
         }).fail(function() {
            sweetAlert("Oops...", "Something went wrong!", "error");
            return;
        });

    };
}


function showMakerFromFindPlace(address, data){
    viewModel.name(data.name);
    viewModel.description(data.location.address);
    if(marker){
        marker.setMap(null);
    }
    marker = new google.maps.Marker({
        position: address.location,
        zoom: 8,
        title: data.name,
        draggable: true
    });

    marker.addListener('click', function() {
        for (var j = 0; j < markers.length; j++) {
            markers[j].setAnimation(null);
        }

        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    });

    var contentString = '<div class="card">'+
                        ' <p class="card-head" >'+ data.name + '</p>'+
                        ' <p>'+ data.location.address+ '</p>'+
                        ' <p class="card-head">Drag this pin anywhere on the Google Map to know the approximate address of that point.</p>'+
                        '</div>';

    var infoWindow = new google.maps.InfoWindow({content: contentString});
    if(currInfowindow){
       currInfowindow.close();
    }
    currInfowindow = infoWindow;
    currInfowindow.open(map, marker);
    google.maps.event.addListener(marker, 'dragend', function() {
        geocoder.geocode({latLng: marker.getPosition()}, function(responses) {
            viewModel.lat(marker.getPosition().lat());
            viewModel.lng(marker.getPosition().lng());
            var name = "";
            for (var i=0; i < responses[0].address_components.length; i++){
                for (var f=0; f < responses[0].address_components[i].types.length; f++){
                    if(responses[0].address_components[i].types[f] =='route' || responses[0].address_components[i].types[f] == 'locality'){
                        name = responses[0].address_components[i].long_name;
                        break;
                    }
                    continue;
                }
                continue;
            }
            viewModel.name(name);
            viewModel.place_id(responses[0].place_id);
            viewModel.description(responses[0].formatted_address);
            if (responses && responses.length > 0) {
                currInfowindow.setContent(
                    '<div class="card">'+
                    ' <p class="card-head" >'+ name + '</p>'+
                    ' <p>'+ responses[0].formatted_address+ '</p>'+
                    '</div>');
                currInfowindow.open(map, marker);
            } else {
                sweetAlert("Oops...", "Google Maps could not determine the address of this location.", "error");
            }
        });
        map.panTo(marker.getPosition());
    });

    google.maps.event.addListener(marker, 'dragstart', function() {
        currInfowindow.close(map, marker);
    });

    map.setCenter(address.location);
    marker.setMap( map );
    map.panTo( address.location );
}

function initApp(){
	map = new google.maps.Map($('#map')[0], {
          zoom: 8,
          center: {lat: -23.550520, lng: -46.633309}
    });
    viewModel = new TaskListViewModel();
    ko.applyBindings(viewModel);
}

function googleError(){
    sweetAlert("Oops...", "Something went wrong!", "error");
}

// This function will loop through the markers array and display them all.
function showListings() {
    for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
    }

    if(positions.length == 0){
        positions = viewModel.neighborhoods();
    }else{
        positions = viewModel.itemsFilter;
    }
    var bounds = new google.maps.LatLngBounds();
    for (var i=0; i < positions.length; i++){
        // Extend the boundaries of the map for each marker and display the marker
        for (var j = 0; j < markers.length; j++) {
            if(markers[j].id == positions[i].place_id()){
                markers[j].setMap(map);
                bounds.extend(markers[j].position);
            }
        }
    }

    if ( positions.length > 1) {
            map.fitBounds(bounds);

        }
        else if (positions.length == 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(10);
    }
}

// Adds marker to the map.
function setMarkers(map, neighborhoods) {
  for (var i = 0; i < neighborhoods.length; i++) {
	var neighborhood = neighborhoods[i];
	var position ={lat: parseFloat(neighborhood.lat()), lng: parseFloat(neighborhood.lng())};
    addMarker(position, map, neighborhood.name(),neighborhood.description(), neighborhood.place_id());
  }
}

// Adds a marker to the map.
function addMarker(position, map, name, description,_id) {
  var marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
      id:_id
    });
    var contentString = '<div class="card">'+
                        ' <p class="card-head" >'+ name + '</p>'+
                        ' <p>'+ description+ '</p>'+
                        '</div>';

    var infowindow = new google.maps.InfoWindow({content: contentString});

    markers.push(marker);
    marker.addListener('click', function() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setAnimation(null);
        }

        if(currInfowindow){
            currInfowindow.close();
        }
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }

        currInfowindow = infowindow;
        currInfowindow.open(map, marker);
    });

}
/*Get current location*/
function getLocation(location) {
    if(location){
	lat = location.coords.latitude;
    	lng = location.coords.longitude;
    }else{
	lat = -23.550520;
	lng = -46.633309;
    }
}

