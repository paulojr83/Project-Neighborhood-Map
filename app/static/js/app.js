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
   createMap();  
   //setMarkers(map);
   ko.applyBindings(viewModel);
});

function Task(data) {
    this.id = ko.observable(data.id);
    this.title = ko.observable(data.title);
    this.description = ko.observable(data.description);
}

function TaskListViewModel() {
	var self = this;    
	self.Lat = ko.observable(12.24);
    self.Lng = ko.observable(24.54);
	
	self.filter = ko.observable('');

    self.currentFilter = ko.observable(); // property to store the filter

    self.tasks = ko.observableArray([]);
    self.newTaskTitle = ko.observable();
    self.newTaskDesc = ko.observable();

    self.addTask = function() {
	self.save();
	self.newTaskTitle("");
	self.newTaskDesc("");
    };

    $.getJSON('/tasks', function(model) {
	var t = $.map(model.tasks, 
		function(item) {
	    return new Task(item);
	});
	self.tasks(t);		
		setMarkers(map, model.tasks);
    });	
	
	self.items = ko.observableArray(["apples", "apple pie", "apple sauce", "pumpkin pie", "peaches"]);
  
	
	self.filteredItems = ko.computed(function() {
		var filter = self.filter();
		if (!filter) { 
			return self.items(); 
		}
		return self.items().filter(function(i) { return i.indexOf(filter) > -1; });
	});

    self.save = function() {
	return $.ajax({
	    url: '/tasks/new',
	    contentType: 'application/json',
	    type: 'POST',
	    data: JSON.stringify({
		'title': self.newTaskTitle(),
		'description': self.newTaskDesc()
	    }),
	    success: function(data) {
		console.log("Pushing to tasks array");
		var task = new Task({ title: data.title, description: data.description, id: data.id});
		self.tasks.push(task);
		setMarker(map, task);
		return;
	    },
	    error: function() {
		return console.log("Failed");
	    }
	});
	
    };
}

 function createMap(){    
    var elevator;
	var position ={lat: 12.24, lng: 24.54};	
    
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
    //map = new google.maps.Map($('#map')[0], myOptions);		
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
function setMarkers(map, tasks) {	
  var image = {
    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20, 32),

    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),

    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };
  
  var shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };
  for (var i = 0; i < tasks.length; i++) {
	var task = tasks[i];
	var position ={lat: task.description, lng: task.title};	

	var infowindow = new google.maps.InfoWindow({content: contentString});
	var marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: image,
      shape: shape,
	  zoom: 10
      //title: task.title
    });

	marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
  }
}

// Adds markers to the map.
function setMarker(map, task) {	
  var image = {
    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20, 32),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };	
	var shape = {
		coords: [1, 1, 1, 20, 18, 20, 18, 1],
		type: 'poly'
	};
  
	var position ={lat: task.description, lng: task.title};

	var infowindow = new google.maps.InfoWindow({content: contentString});

    var marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: image,
      shape: shape,
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