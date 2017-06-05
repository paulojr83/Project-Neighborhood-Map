//global for map
var map;
var tasks;



var contentString = '<div class="card">'+
    '<div class="card-header">'+
    '    Edit category'+
    '</div>'+    
    '<div class="card-footer text-muted" style="display: inherit;">'+
	' <p> Colocar aqui alguma informação'+
    '</div>'+
    '</form>'+
	'</div>';


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

    self.addTask = function() {
	    self.save();	    
        self.name("");
        self.description("");
        self.lat("");
        self.lng("");
    };
    
	$.getJSON( "/neighborhoods", function(data) {           
        var neighborhoods = $.map(data.neighborhoods, function(neighborhood) {
	        return new Neighborhood(neighborhood);
	    });                   
        self.neighborhoods(neighborhoods);
        console.log( "success" );
    })
    .done(function() {                        
        console.log( "second success");
    })
    .fail(function() {
        console.log( "error" );
    })    
    .always(function() {        
        setMarkers(map, self.neighborhoods());
        console.log( "complete" );
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
            setMarkers(map, self.itemsFilter);
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
		'lng': self.lng()
	    }),
	    success: function(data) {
		console.log("Pushing to tasks array");
            var neighborhood = new Neighborhood({ name: data.name, description: data.description, lat:data.lat, lng:data.lng, id: data.id});
            self.neighborhoods.push(neighborhood);
		    //setMarker(map, task);
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
    console.log(position);
    var elevator;    
	map = new google.maps.Map($('#map')[0], {
          zoom: 10,
          center: position
    });
	
	var infowindow = new google.maps.InfoWindow({content: contentString});
	var marker = new google.maps.Marker({
          position: position,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
   
}

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

// Adds marker to the map.
function setMarkers(map, neighborhoods) {	  
  for (var i = 0; i < neighborhoods.length; i++) {    
	var neighborhood = neighborhoods[i];
	var position ={lat: parseInt(neighborhood.lat), lng: parseInt(neighborhood.lng)};   
	var infowindow = new google.maps.InfoWindow({content: contentString});
	var marker = new google.maps.Marker({
      position: position,
      map: map,      
	  zoom: 10
      //title: task.title
    });

	marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
  }
}

// Adds markers to the map.
function setMarker(map, neighborhood) {	
	var position ={lat: parseInt(neighborhood.lat), lng: parseInt(neighborhood.lng)};   
	var infowindow = new google.maps.InfoWindow({content: contentString});
    var marker = new google.maps.Marker({
      position: position,
      map: map,
	  zoom: 10
      //title: task.title
    });  

	marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
}


function showMaxZoom(e) {
  maxZoomService.getMaxZoomAtLatLng(e.latLng, function(response) {
    if (response.status !== 'OK') {
      infoWindow.setContent('Error in MaxZoomService');
    } else {
      infoWindow.setContent(
          'The maximum zoom at this location is: ' + response.zoom);
    }
    infoWindow.setPosition(e.latLng);
    infoWindow.open(map);
  });
}

var viewModel = new TaskListViewModel();