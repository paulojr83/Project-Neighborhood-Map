//global for map
var map;
var tasks;
var address = {};
var currInfowindow =false; 
var marker;
var markers = [];
var geocoder;
var positions = [];    
var appendeddatahtml = "";
var newstr = "";

$(document).ready(function () {
   navigator.geolocation.getCurrentPosition(getLocation);
   ko.applyBindings(viewModel);   
});

function getLocation(location) {
    lat = location.coords.latitude;
    lng = location.coords.longitude;
}

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

        $.ajax({
            type : 'GET',
            url: "https://api.foursquare.com/v2/venues/explore?ll="+lat+","+lng+"&oauth_token=20RNUANVYKUONUGZKDGTUCXLV4LZEFPH5FPHN4X3HVMYOKKG&v=20170626&query="+self.address()+"",
            success : function(result) {
                $("#venues").show();
                var dataobj = result.response.groups[0].items;
                $("#venues").html("");


                $.each( dataobj, function() {
					if (this.venue.categories[0]) {
						str = this.venue.categories[0].icon.prefix;
						newstr = str.substring(0, str.length - 1);
						icon = newstr+this.venue.categories[0].icon.suffix;
					} else {
						icon = "";
					}

					if (this.venue.location.address) {
						address = '<p class="subinfo">'+this.venue.location.address+'<br>';
					} else {
						address = "";
					}

					if (this.venue.rating) {
						rating = '<span class="rating">'+this.venue.rating+'</span>';
					}

					appendeddatahtml = '<div class="item venue"><span>'+this.venue.name + '</span></h2></div>';
					$("#venues").append(appendeddatahtml);

					console.log(appendeddatahtml);

				});
                /*
                if(result.status = "OK"){                    
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
                        
                        showMakerFromFindPlace(address);
                        geocoder = new google.maps.Geocoder();
                        
                    } catch(err) {
                        address = null;
                    }    
                }
                */
            }
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
        for (var j = 0; j < markers.length; j++) {            
                if(markers[j].id == place_id){                
                    map.setZoom(11);
                    markers[j].setAnimation(google.maps.Animation.BOUNCE);
                    markers[j].setMap(map);
                    bounds.extend(markers[j].position);
               }
        }

        var contentString = '<div class="card">'+
                        ' <p class="card-head" >'+ name + '</p>'+
                        ' <p>'+ description+ '</p>'+
                        '</div>';

        var infoWindow = new google.maps.InfoWindow({content: contentString});
        infoWindow.setPosition(position);
        infoWindow.open(map);

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
        console.log( "error" );
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
            success: function(data) {
                console.log("Pushing to tasks array");
                var neighborhood = new Neighborhood({ id: data.id, name: data.name, 
                    description: data.description, lat:data.lat, lng:data.lng, place_id: data.place_id});
                self.neighborhoods.push(neighborhood);
                var position ={lat: parseFloat(data.lat), lng: parseFloat(data.lng)};                 
                if(marker){
                    marker.setMap(null);
                }                 
                addMarker(position, map, data.name,data.description, data.place_id);
                
            return;
            },
            error: function() {
                return console.log("Failed");
            }
        });
	
    };
}

function showMakerFromFindPlace(address){
    if(marker){
        marker.setMap(null);
    }    
    marker = new google.maps.Marker({
        position: address.location,
        //map: map,
        zoom: 8,
        title: address.name,
        draggable: true
    });      

    marker.addListener('click', function() {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }        
    });

    infoWindow = new google.maps.InfoWindow({
        content: "<div class='card'>"+
        "<p class='card-head'>Drag this pin anywhere on the Google Map to know the approximate address of that point.</p>"+
        "</div>"
    });
    
    
    infoWindow.open(map, marker);
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
                infoWindow.setContent(
                    '<div class="card">'+
                    ' <p class="card-head" >'+ name + '</p>'+
                    ' <p>'+ responses[0].formatted_address+ '</p>'+ 
                    '</div>');
                infoWindow.open(map, marker);
            } else {
                alert('Error: Google Maps could not determine the address of this location.');
            }
        });
        map.panTo(marker.getPosition());
    });    
   
    google.maps.event.addListener(marker, 'dragstart', function() {
        infoWindow.close(map, marker);
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
        if(currInfowindow){
            currInfowindow.close();           
        }
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }

        currInfowindow = infowindow;        
        infowindow.open(map, marker);        
    });
    
}


var viewModel = new TaskListViewModel();