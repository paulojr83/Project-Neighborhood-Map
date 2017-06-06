//global for map
var map;
var tasks;
var address = {};
var currInfowindow =false; 
var marker;

$(document).ready(function () {    
   initMap(); 
   //setMarkers(map);
   
   ko.applyBindings(viewModel);   
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
    
    self.name = ko.observable();
    self.description = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();

    self.address = ko.observable('');
    
    self.addAddress = function() {
        self.save("");
        self.name("");
        self.description("");
        self.lat("");
        self.lng("");
    };
    
    self.findPlace = function(){
        
        $.ajax({
            url : 'https://maps.googleapis.com/maps/api/geocode/json',
            type : 'GET',
            data : {
                address : self.address(),
                sensor : false
            },
            async : false,
            success : function(result) {
                
                if(result.status = "OK"){                    
                    try {
                        address.lat = result.results[0].geometry.location.lat;
                        address.lng = result.results[0].geometry.location.lng;
                        address.name = result.results[0].address_components[0].long_name + ' - ' +result.results[0].formatted_address;                        
                        address.place_id = result.results[0].place_id;

                        self.name(address.name);                        
                        self.lat(address.lat);
                        self.lng(address.lng);

                        var position ={lat: parseInt(address.lat), lng: parseInt(address.lng)};  
                        map.setCenter(position);                         
                        
                        marker = new google.maps.Marker({
                            position: position,
                            map: map,
                            title: address.name,
                            draggable: true
                        });                        
                        
                        /*marker.addListener(marker, 'dragend', function (event) {
                            console.log(this.getPosition());
                            self.lat(this.getPosition().lat());
                            self.lng(this.getPosition().lng());                            
                        });
                            marker.addListener(marker, 'drag', function(event) {
                                console.debug('new position is '+event.latLng.lat()+' / '+event.latLng.lng());
                            });
                           */ 
                          marker.addListener(marker, 'drag', function(event) {
                                console.log('final position is '+event.latLng.lat()+' / '+event.latLng.lng());
                            });
                            marker.addListener(marker, 'dragend', function(event) {
                                console.log('final position is '+event.latLng.lat()+' / '+event.latLng.lng());
                            });

                            marker.addListener('click', function() {        
                                       alert('asdas')
                            });
                        marker.setMap( map );   
                        map.panTo( position );  
                    } catch(err) {
                        address = null;
                    }    
                }    
            }
        });      
    };

    ko.bindingHandlers.map = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var position = new google.maps.LatLng(allBindingsAccessor().latitude(), allBindingsAccessor().longitude());
                var marker = new google.maps.Marker({
                    map: allBindingsAccessor().map,
                    position: position,
                    title: name
                });
                viewModel._mapMarker = marker;                
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var latlng = new google.maps.LatLng(allBindingsAccessor().latitude(), allBindingsAccessor().longitude());
                viewModel._mapMarker.setPosition(latlng);
                
            }
    };

    self.showPlace = function(data) {          
        var position = {};
        ko.utils.arrayFilter(self.neighborhoods(), function(item) {
            if(data == item){                
                position = {lat: parseInt(item.lat().toString()), lng: parseInt(item.lng().toString())};  
            }
        });          
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
    })
    .fail(function() {
        console.log( "error" );
    });
 
	self.filteredItems = ko.computed(function () {
        var filter = self.filter();        
        if (!filter) {
            return self.neighborhoods();
        } else {           
            self.itemsFilter = ko.utils.arrayFilter(self.neighborhoods(), function(item, index) {                 
                var neighborhood = item.name().toString().toUpperCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');                
                return neighborhood.indexOf(filter.toUpperCase()) > -1;
            });  
            //setMarkers(map, self.itemsFilter);
            return self.itemsFilter;
        }

    });

    self.save = function() {    
        return $.ajax({
            url: '/neighborhood/new',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
            'name': address.name,
            'description': address.description,
            'lat': address.lat,
            'lng': address.lng,
            'place_id' :address.place_id
            }),
            success: function(data) {
            console.log("Pushing to tasks array");
                var neighborhood = new Neighborhood({ name: data.name, description: data.description, lat:data.lat, lng:data.lng, id: data.id});
                self.neighborhoods.push(neighborhood);
                
            return;
            },
            error: function() {
                return console.log("Failed");
            }
        });
	
    };
}

function initMap(){        
	map = new google.maps.Map($('#map')[0], {
          zoom: 10,
          center: {lat: -23.550520, lng: -46.633309}
    });   
}

 function createMap(neighborhood){    
    var position ={lat: parseInt(neighborhood.lat), lng: parseInt(neighborhood.lng)};     
    var elevator;    
	map = new google.maps.Map($('#map')[0], {
          zoom: 10,
          center: position
    });
	addMarker(position, map, neighborhood.name(),neighborhood.description());
   
}



// Adds marker to the map.
function setMarkers(map, neighborhoods) {	  
  for (var i = 0; i < neighborhoods.length; i++) {    
	var neighborhood = neighborhoods[i];
    
	var position ={lat: parseInt(neighborhood.lat()), lng: parseInt(neighborhood.lng())};   
    addMarker(position, map, neighborhood.name(),neighborhood.description());
  }
}

// Adds markers to the map.
function setMarker(map, neighborhood) {	     
	var position ={lat: parseInt(neighborhood.lat), lng: parseInt(neighborhood.lng)};     
    addMarker(position, map, neighborhood.name(),neighborhood.description());   	
}

// Adds a marker to the map.
function addMarker(position, map, name, description) {      
  var marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
	  zoom: 10
    });  
    var contentString = '<div class="card">'+
                    '<div class="card-header">'+
                    name+
                    '</div>'+    
                    '<div class="card-footer text-muted" style="display: inherit;">'+
                    ' <p>'+ description+
                    '</div>'+
                    '</form>'+
                    '</div>';
    
    var infowindow = new google.maps.InfoWindow({content: contentString});
    
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