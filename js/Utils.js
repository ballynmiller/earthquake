/*
* This code requires jQuery. 
*/
jQuery.support.cors = true;
var Ballyn = Ballyn || {};
Ballyn.Utils = {
	google_url : "http://maps.googleapis.com/maps/api/geocode/json?", 
	geonames_earthquake_url : "http://api.geonames.org/earthquakesJSON?",
	bounds : {
		north : 0, 
		south : 0, 
		east : 0, 
		west : 0 
	},
	location : null, 
	defaults : {
		username : "bdotmillz", 
		tableContainer : null, 
		mapContainer : null, 
		recentContainer : null
	},
	init : function(options){
		for(var index in this.defaults){
			if(typeof options[index] !== "undefined"){
				this.defaults[index] = options[index];	
			}
		}
		var table = $("<table/>", {
			id:"foo"
		});
		var tr = $("<tr />"); 
		var text_field = $("<input />", {
			id : "searchText", 
			type : "text", 
			value : "Type City, State or Country.",
			onblur : "if(this.value=='')this.value='Type City, State or Country.'", 
			onfocus : "if(this.value=='Type City, State or Country.')this.value='';"
		});
		var button = $("<button />", {
			click : this.getLongLat, 
			text : "Search"
		}); 
		tr.append($("<td />").append(text_field));
		tr.append($("<td />").append(button));
		table.append(tr);
		$(this.defaults["tableContainer"]).append(table);
		Ballyn.Utils.getTopTenEarthquakes();
	},
	getLongLat : function(){
		 $("#error").remove();
		 jQuery.ajax({
			url : Ballyn.Utils.google_url, 
			data : { "address" : $("#searchText").val(), "sensor" : false},
			dataType: "json",
			success : function(data){
				if(data["status"] !== "ZERO_RESULTS"){
					Ballyn.Utils.bounds["north"] = data.results[0]["geometry"]["bounds"]["northeast"]["lat"];
					Ballyn.Utils.bounds["east"] = data.results[0]["geometry"]["bounds"]["northeast"]["lng"];
					Ballyn.Utils.bounds["south"] = data.results[0]["geometry"]["bounds"]["southwest"]["lat"];
					Ballyn.Utils.bounds["west"] = data.results[0]["geometry"]["bounds"]["southwest"]["lng"];
					Ballyn.Utils.location = data.results[0]["geometry"]["location"];
					Ballyn.Utils.getEarthquakes();
				} else {
					$(Ballyn.Utils.defaults["tableContainer"]).append($("<h1/>", {
						id : "error", 
						text : "No location found for string specified. Please try another location."
					}));
				}
			}
		}); 
	}, 
	getEarthquakes : function(){
		var date = new Date();
		jQuery.ajax({
			url: Ballyn.Utils.geonames_earthquake_url, 
			data: {
				username : Ballyn.Utils.defaults["username"],
				north : Ballyn.Utils.bounds["north"], 
				south : Ballyn.Utils.bounds["south"], 
				east : Ballyn.Utils.bounds ["east"], 
				west : Ballyn.Utils.bounds ["west"], 
				date : date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
			},
			dataType: "json",
			success: function(data){
				 var mapOptions = {
					center : new google.maps.LatLng(Ballyn.Utils.location["lat"], Ballyn.Utils.location["lng"]), 
					zoom : 7, 
					mapTypeId : google.maps.MapTypeId.ROADMAP
				 };
				 var map = new google.maps.Map(document.getElementById(Ballyn.Utils.defaults["mapContainer"]), mapOptions);
				 for(index in data.earthquakes){
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(data.earthquakes[index]["lat"],data.earthquakes[index]["lng"]),
						map: map, 
						title : "Depth: "+data.earthquakes[index]["depth"]+"\nMagnitude: "+data.earthquakes[index]["magnitude"]+"\nDate: "+data.earthquakes[index]["datetime"]
					});
				 }
			}
		});
	},
	getTopTenEarthquakes : function(){
		var date = new Date();
		jQuery.ajax({
			url: Ballyn.Utils.geonames_earthquake_url, 
			data: {
				username : Ballyn.Utils.defaults["username"],
				north : 0, 
				south : 90, 
				east : 0, 
				west : 180,
				date : date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
			},
			contentType: "text/plain",
			crossDomain: true,
			dataType:"json",
			error: function(xhr, data, text){
				console.log(text);
			},
			success: function(data){
				var ul = $("<ul />"); 
				for( index in data.earthquakes){
					var li = $("<li/>",{
						text: "Depth: "+data.earthquakes[index]["depth"]+" Magnitude: "+data.earthquakes[index]["magnitude"]+" Date: "+data.earthquakes[index]["datetime"]
					}); 
					ul.append(li);
				}
				$(Ballyn.Utils.defaults["recentContainer"]).append(ul);
			}
		});
	} 
};
