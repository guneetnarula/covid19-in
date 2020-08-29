(function ($) {

	$.fn.choropleth_map = function(data, metadata){

		return this.each(function() {

      var $el = jQuery( this );

			var map, gjLayerDist, gjLayerStates;

      // CREATE ELEMENTS ON THE FLY
      function createElements(){

        var $map = jQuery( document.createElement( 'div' ) );
        $map.attr('id', 'map');
        $map.appendTo( $el );

				var $goTop = jQuery( document.createElement( 'a' ) );
        $goTop.attr('id', 'top-btn');
				$goTop.attr('href', '#sidebar');
				$goTop.addClass('d-md-none d-lg-none d-xl-none')
				$goTop.html('<i class="fa fa-caret-up"></i>')
        $goTop.appendTo( $el );

				var $legend = jQuery( document.createElement( 'div' ) );

				$legend.html('<strong>Number of cases:</strong><br><p class="key-item" style="background-color:#feebe2"> Nil</p><p class="key-item" style="background-color:#fbb4b9"> 1 to 500 </p><p class="key-item" style="background-color:#f768a1"> 501 to 2000 </p><p class="key-item" style="background-color:#c51b8a;color:white"> 2001 to 5000 </p><p class="key-item" style="background-color:#7a0177;color:white"> 5001 to 8000 </p><p class="key-item" style="background-color:#360134;color:white"> 8000+ </p>');

        $legend.appendTo('#legend');

				$("#timestamp").empty().append(metadata["Last Update"]);

				//NATIONAL LEVEL TOTALS
				var totals = [0,0,0,0]
				var counter = 0;
				for (var i in data){
					for (var j in data[i].districtData){
						totals[0] = totals[0] + data[i].districtData[j].confirmed;
						totals[1] = totals[1] + data[i].districtData[j].recovered;
						totals[2] = totals[2] + data[i].districtData[j].deceased;
						totals[3] = totals[3] + data[i].districtData[j].active;

						if (data[i].districtData[j].district != "Unknown" || data[i].districtData[j].district != "Other State" ) {
							if (data[i].districtData[j].confirmed > 0) counter++;
						}
					}
				}
				$('#tot_conf').empty().append(totals[0]);
				$('#tot_disch').empty().append(totals[1]);
				$('#tot_death').empty().append(totals[2]);
				$('#tot_act').empty().append(totals[3]);
				//$("#st_aff").empty().append('<span>'+data.length+'/37<span>');
				//$("#st_aff").attr('style', 'width:'+(data.length/37)*100+'%');

				//$("#dt_aff").empty().append('<span>'+counter+'/734<span>');
				//$("#dt_aff").attr('style', 'width:'+(counter/734)*100+'%');

				//MODAL INFO
				$('#abt-modal').click( function () {
					$("#infoModalLabel").empty().append("About this Map");
					$(".modal-body").empty().append('<p>This map is an attempt at tracking CoVid-19 cases in India at the district level. The source of this data is <s>news reports and state bulletins, and the official <a href="http://www.mohfw.gov.in/" target="_blank">numbers from MoHFW</a> are only used as a reference. The <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRlSCAn1nS4h9n9Fp25iuOsH54RfMUjj3xX5CZqjGUqYCVXgwgtJojuqVeqekazs2TkSJ95Jwplo7lL/pubhtml#" target="_blank">data is compiled here</a></s> <a href="https://api.covid19india.org/" target="_blank">the covid19india.org API</a>. The data is updated once every six hours. Please see <a href="https://www.covid19india.org/" target="_blank">covid19india.org</a> for more detailed and up-to-date numbers.</p><p>Some issues to consider: a) some state are reporting cases that do not have district information known yet, these are not represented on the map yet but are part of the state totals b) Data for Ladakh does not accurately reflect the situation in Aksai Chin Occupied Kashmir.</p><p>Feedback is more than welcome. Please DM <a href="https://twitter.com/guneetnarula" target="_blank">@guneetnarula</a>, or <a href="https://github.com/guneetnarula/covid19-in" target="_blank">create an issue here</a>, or write an <a href="mailto:guneet@sputznik.com?subject=covid19 india district map feedback">email</a>. Thank you!</p><hr><p>If you need help or more information about the pandemic, consider the following links:</p><ul><li><a href="https://www.who.int/health-topics/coronavirus" target="_blank">World Health Organization</a></li><li><a href="http://www.mohfw.gov.in/" target="_blank">Ministry of Health and Family Welfare</a></li><li><a href="https://github.com/datameet/covid19" target="_blank">DataMeet Archive on CoVID19</a></li><li><a href="https://www.covid19india.org/" target="_blank">India CoVID 19 tracker</a></li><li><a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a></li><li><a href="https://www.coronasafe.in/" target="_blank">Coronasafe</a></li></ul>');
				});
				$('#ct-modal').click( function () {
					$("#infoModalLabel").empty().append("Contribute to this Map");
					$(".modal-body").empty().append('<p>If you are familiar with Leaflet and jQuery, check out the <a href="https://github.com/guneetnarula/covid19-in" target="_blank">git repo</a> and contribute</p><p>If you are a journalist or someone carefully tracking news, you can help maintain the data. See the <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRlSCAn1nS4h9n9Fp25iuOsH54RfMUjj3xX5CZqjGUqYCVXgwgtJojuqVeqekazs2TkSJ95Jwplo7lL/pubhtml#" target="_blank"">readme sheet here</a>.</p>');
				});
				$('#st-modal').click( function () {
					$("#infoModalLabel").empty().append("State Level Data");
					$(".modal-body").empty().append(stateData());
				});
				$('#dt-modal').click( function () {
					$("#infoModalLabel").empty().append("District Level Data");
					$(".modal-body").empty().append(districtData());
				});
      }

      function drawMap(){

        // HIDE THE LOADER
        $('.loader').hide();

				//SETUP BASEMAP
				map = L.map('map').setView( [22.27, 80.37], 5 );

        //var hybUrl='https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3VuZWV0bmFydWxhIiwiYSI6IldYQUNyd0UifQ.EtQC56soqWJ-KBQqHwcpuw';
        var hybUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        var hybAttrib = 'Map data © <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors & <a href="http://datameet.org" target="_blank">Data{Meet}</a>';
        var hyb = new L.TileLayer(hybUrl, {minZoom: 4, maxZoom: 7, attribution: hybAttrib, opacity:1}).addTo(map);

        //---------------ADD DISTRICT BOUNDARIES

				gjLayerDist = L.geoJson( geodist, { style: styledist, onEachFeature: onEachDist } );
				gjLayerDist.addTo(map);

        //---------------ADD STATE BOUNDARIES


        gjLayerStates = L.geoJson( geoStates, { style: stylestate } );
        gjLayerStates.addTo(map);

      }
			//END OF drawMap

			function popContent( feature ) {
        //FOR DISTRICT POP UPS ON CLICK
				for(var i in data) {
					if (data[i].state == feature.properties["st_nm"]) {
						for (var j in data[i].districtData) {

							if (data[i].districtData[j].district == feature.properties["district"]) {
		        		return '<h4>'+feature.properties["district"]+', '+feature.properties["st_nm"]+'</h4><hr><p>Confirmed Cases: <b>'+data[i].districtData[j].confirmed+'</b> out of '+counter("state", feature) +' in the state</p><p>Discharged/Recovered: '+data[i].districtData[j].recovered+'</p><p>Deaths: '+data[i].districtData[j].deceased+'</p><p>Active Cases: '+data[i].districtData[j].active+'</p><hr><small>'+data[i].districtData[j].notes+'</small>';
							}

						}
					}
				}
      }
			//-----------------------------

			function stylestate( feature ) {
        //STATE STYLES

				//var c_count = counter("State", feature);
				return {
          weight: 1,
          opacity: 0.9,
          color: "#000",
          fill: false
        };
      }

			function styledist( feature ) {
        //DISTRICTS STYLES - CHOROPLETH COLORS BASED ON RANGE ONLY
        var color = "#feebe2";

				// var c_count = counter("District", feature); //JUST FINDS THE CORRECT ROW

				var c_count = 0;
				for (var i in data) {
					if (feature.properties["st_nm"] == data[i].state) {
						for (var j in data[i].districtData) {
  						if (feature.properties["district"] == data[i].districtData[j].district)
  						c_count = data[i].districtData[j].confirmed;
  					}
					}
				}

				if (c_count > 8000) color = "#360134";
				else if (c_count > 5000 && c_count <= 8000) color = "#7a0177";
				else if (c_count > 2000 && c_count <= 5000 ) color = "#c51b8a";
				else if (c_count > 500 && c_count <= 2000) color = "#f768a1";
				else if (c_count > 0 && c_count <= 500) color = "#fbb4b9";
				else {color = "#feebe2";}

				return {
          fillColor: color,
          weight: 1,
          opacity: 0.4,
          color: 'black',
          dashArray: '1',
          fillOpacity: 1
        };
      }

			function counter(level, feature){
				//CASE COUNTER FOR STATES
				var count = 0;

				for (var i in data){
					if (data[i].state == feature.properties['st_nm']) {
						for (var j in data[i].districtData) {
							count = count + data[i].districtData[j].confirmed;
						}
					}
        }
				return count;
			}

      function onEachDist( feature, layer ) {
        //CONNECTING TOOLTIP AND POPUPS TO DISTRICTS
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
        });
				layer.on('click', function(e, feature){
					zoomToFeature(e);
				});
        layer.bindTooltip( feature.properties["district"] + ', ' + feature.properties["st_nm"], {
          direction : 'auto',
          className : 'statelabel',
          permanent : false,
          sticky    : true
        } );
        layer.bindPopup(popContent(feature), {maxWidth:700});

      }

      function highlightFeature(e) {
        //DISTRICT HIGHLIGHT ON MOUSEOVER
        var layer = e.target;

        layer.setStyle( {
          weight: 3,
          color: 'violet',
          opacity: 0.8
        } );
        if ( !L.Browser.ie && !L.Browser.opera ) {
          layer.bringToFront();
        }
      }

      function resetHighlight(e) {
          //RESET HIGHLIGHT ON MOUSEOUT
          var layer = e.target;
          layer.setStyle({
            weight: 1,
            color: 'black',
            opacity: 0.4
          });
					if ( !L.Browser.ie && !L.Browser.opera ) {
	          layer.bringToBack();
	        }
      }

      function zoomToFeature(e) {
				//ZOOM TO DISTRICT ON CLICK
        map.fitBounds(e.target.getBounds().pad(1.6));
      }

			$('#resetZoom').click(function(){
				map.setZoom(5);
			});

			//STATE COUNTS FOR MODAL
			function stateData(){
				return '<p class="text-center alert alert-info">Will be available again in the next update!</p>';
				/*var s_totals = [];
				var flag = 0;

				for ( var i = 0; i < data.length; i++ ){
					flag = 0; //CHECKS IF ARRAY ALREADY HAS STATE
					s_totals.forEach( function(state){
						if(state.name == data[i]["State"]) flag = 1;
					});

					if (flag == 0) {
						var totals = allCounts("State", data[i]["State"]);
						s_totals.push({name:data[i]["State"],cc:totals[0],di:totals[1],de:totals[2],ac:totals[3]});
					}
				}

				s_totals.sort((a,b) => b.cc - a.cc); //SORT BY CONFIRMED CASES

				var stateHTML = "<table><tbody><tr><th>State</th><th>Confirmed Cases</th><th>Discharged / Recovered</th><th>Deaths</th><th>Active Cases</th></tr>";
				s_totals.forEach( function(state) {
					stateHTML = stateHTML + '<tr><td>'+state.name+'</td><td>'+state.cc+'</td><td>'+state.di+'</td><td>'+state.de+'</td><td>'+state.ac+'</td></tr>';
				});
				stateHTML = stateHTML + '</tbody></table>';

				return stateHTML;*/
			}
			//CASES COUNTS FOR STATES
			function allCounts(level, name) {
				var totals = [0,0,0,0];
				for ( var i = 0; i < data.length; i++ ){
					if (data[i][level] == name) {
						totals[0] = totals[0] + Number(data[i]["Confirmed Cases"]);
						totals[1] = totals[1] + Number(data[i]["Discharged"]);
						totals[2] = totals[2] + Number(data[i]["Deaths"]);
						totals[3] = totals[3] + Number(data[i]["Active"]);
					}
				}
				return totals;
			}

			//DISTRICTS MODAL
			function districtData() {
				return '<p class="text-center alert alert-info">Will be available again in the next update!</p>';
				/*
				data.sort((a,b) => b["Confirmed Cases"] - a["Confirmed Cases"]);
				var districtHTML = "<table><tbody><tr><th>District</th><th>State</th><th>Confirmed Cases</th><th>Discharged / Recovered</th><th>Deaths</th><th>Active Cases</th><th>Notes</th></tr>";
				data.forEach( function(district) {
					districtHTML = districtHTML + '<tr><td>'+district["District"]+'</td><td>'+district["State"]+'</td><td>'+district["Confirmed Cases"]+'</td><td>'+district["Discharged"]+'</td><td>'+district["Deaths"]+'</td><td>'+district["Active"]+'</td><td>'+district["Notes"]+'</td></tr>';
				});
				districtHTML = districtHTML + '</tbody></table>';

				return districtHTML;*/
			}

      // INITIALIZE FUNCTION
      function init(){

        // CREATE ALL THE DOM ELEMENTS FIRST
        createElements();

        // RENDER THE MAP IN THE CORRECT DOM
        drawMap();
      }

      init();

    });
  };
}(jQuery));

jQuery(document).ready(function(){

	var data, metadata = [];

	$.ajax({
		url: 'data/data.json',
		async: false,
		dataType: 'json',
		success: function (json) {
			data = json;
		}
	});

	$.ajax({
		url: 'data/meta.json',
		async: false,
		dataType: 'json',
		success: function (json) {
			metadata = json;
		}
	});


	jQuery( '[data-behaviour~=choropleth-map]' ).choropleth_map(data, metadata);

	/*Tabletop.init( { key: "1AL1cj_33m3D7JkT-_wPB7LPJAqIfV2Y5XVMui7nczy4", callback: getdata, simpleSheet: false } );

	function getdata(d, tabletop) {
		data = tabletop.sheets("raw").elements;
		metadata = tabletop.sheets("readme").elements;

		jQuery( '[data-behaviour~=choropleth-map]' ).choropleth_map(data, metadata);
	}*/

});
