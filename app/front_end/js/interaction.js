import {GeoJSON,WFS,GML} from 'ol/format';
import {intersects as intersectsFilter,equalTo as equalToFilter, and as andFilter} from 'ol/format/filter';
import {fromCircle} from 'ol/geom/Polygon';
import {unByKey} from 'ol/Observable';
import Overlay from 'ol/Overlay';
import {singleClick} from 'ol/events/condition';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source'; 
import ApiConstants from './secrets';	
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import {map} from './map';
import {iconStyle,drawing_style,boundaryStyle,vector_style} from './style';
import Select from 'ol/interaction/Select';
import {Draw, Modify, Snap} from 'ol/interaction';
import { pointerMove} from 'ol/events/condition';
import {Stroke, Style} from 'ol/style';
import Feature from 'ol/Feature';
import {tool_tip} from './tooltip';
import {draw_isochrone} from './isochrones';


const userid = Math.floor(Math.random() * 10000000);

var objectid; 	
var formatWFS = new WFS();
var formatGeoJSON = new GeoJSON();
var formatGML;
var number_calculations = 0;

var xs = new XMLSerializer();

var cql="userid="+userid.toString();
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////LineLineLine///////////////////////////////////////////////////////////////////////


var source_drawnLine = new VectorSource({
    loader: function (extent) {
        $.ajax(ApiConstants.address_geoserver+'wfs?', {
            type: 'GET',
            data: {
                service: 'WFS',
                version: '1.1.0',
                request: 'GetFeature',
                typename: 'cite:input_network',
                srsname: 'EPSG:3857',
                CQL_FILTER: cql
                //bbox: extent.join(',') + ',EPSG:3857'
            }
        }).done(function (response) {
            source_drawnLine.addFeatures(formatWFS.readFeatures(response));
            
        });
    },
    //strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ()),
    strategy: bboxStrategy,
    projection: 'EPSG:3857'
});



var drawnLine = new VectorLayer({
    source: source_drawnLine,
   style: drawing_style
});

map.addLayer(drawnLine);



	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////PointPointPoint///////////////////////////////////////////////////////////////////////
	
var sourceWFS_point = new VectorSource({
    loader: function (extent) {
        $.ajax(ApiConstants.address_geoserver+'wfs?', {
            type: 'GET',
            data: {
                service: 'WFS',
                version: '1.1.0',
                request: 'GetFeature',
                typename: 'cite:starting_point_isochrones',
                srsname: 'EPSG:3857',
                CQL_FILTER: cql
                //bbox: extent.join(',') + ',EPSG:3857'
            }
        }).done(function (response) {
            var resp = formatWFS.readFeatures(response);
            
            sourceWFS_point.addFeatures(resp);
        });
    },
    //strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ()),
    strategy: bboxStrategy,
    projection: 'EPSG:3857'
});


	
var layerWFS_point = new VectorLayer({
    source: sourceWFS_point,
    style: iconStyle
});

map.addLayer(layerWFS_point);	



var interaction;

var interactionSelectPointerMove = new Select({
    condition: pointerMove
});

var interactionSelect = new Select({
    style: new Style({
        stroke: new Stroke({
            color: '#FF2828'
        })
    })
});
	
	
	

	

//wfs-t
var dirty = {};
var transactWFS = function (mode, f,formatGML,way_type) {
	
    var node;
    objectid = Math.floor(Math.random() * 10000000);
    var geometry = f.getGeometry().clone();
    geometry.transform("EPSG:3857", "EPSG:4326");

    var  newFeature = new Feature({	
		 
		userid : userid,                
        geometry: geometry,
        objectid:objectid,
        number_calculation:number_calculations + 1,
        way_type : way_type 
       
    });
    newFeature.setGeometryName("geometry");
    newFeature.setProperties(newFeature.getProperties());
    newFeature.setId(f.getId());
    

    switch (mode) {
        case 'insert':
            node = formatWFS.writeTransaction([newFeature], null, null, formatGML);       
            break;
        case 'update':
            node = formatWFS.writeTransaction(null, [newFeature], null, formatGML);
            break;
        case 'delete':
            node = formatWFS.writeTransaction(null, null, [newFeature], formatGML);
            break;
    }
    var payload = xs.serializeToString(node);
    $.ajax(ApiConstants.address_geoserver+'wfs', {
        type: 'POST',
        dataType: 'xml',
        processData: false,
        contentType: 'text/xml',
        data: payload
    }).done(function() {
        sourceWFS_point.clear();
        source_drawnLine.clear();
    });
};
	
$('button').click(function () {

    map.removeInteraction(interaction);
    interactionSelect.getFeatures().clear();
    map.removeInteraction(interactionSelect);

    switch ($(this).attr('class')) {

        case 'draw_way':

         //Define Format and table for POST
         	var way_type = this.id.replace('btn','');

			formatGML = new GML({
				featureNS: 'muc',
				featureType: 'cite:input_network'//,
				//srsName: 'EPSG:3857'
			});
	        
        
            interaction = new Draw({
                type: 'LineString',
                source: drawnLine.getSource()
            });
            var interactionSnap = new Snap({
    				source: drawnLine.getSource()
				});
            map.addInteraction(interaction);
            map.addInteraction(interactionSnap);
            interaction.on('drawend', function (e) {
                transactWFS('insert', e.feature,formatGML,way_type);
               
            });
            tool_tip(interaction,'line');
            break;
		 
		 case 'draw_isochrone':

				
		 //Define Format and table for POST
		 	
            formatGML = new GML({
    				featureNS: 'muc',
    				featureType: 'cite:starting_point_isochrones'//,
    			//	srsName: 'EPSG:3857'
			});
  
           
            interaction = new Draw({
               	type:'Point',
                source: layerWFS_point.getSource()
            });

           
           
            tool_tip(interaction,'point');
            var interactionSnap = new Snap({
    			source: layerWFS_point.getSource()
			});

            map.addInteraction(interaction);
            interaction.on('drawend', function (e) {
                transactWFS('insert', e.feature,formatGML);
                number_calculations = number_calculations + 1;
					 
                var feature=e.feature;
                map.removeInteraction(interaction);
                var coordinates = feature.getGeometry().getCoordinates();
                console.log(coordinates);
                var modus = document.getElementById('modus').value;
     	
 					if (modus=='double_calculation'){
 						var new_objectid = Math.floor(Math.random() * 10000000);
				
					   draw_isochrone(coordinates,new_objectid,objectid);  //A objectid for the second isochrone is created and the first objectid is used as parent_id 
 					   draw_isochrone(coordinates,objectid,1);		
	
 					}
 					else if (modus=="2"){
						draw_isochrone(coordinates,objectid,2);	     					
 					}
 					else{
            		draw_isochrone(coordinates,objectid,1);
            		
            	}
                	
            });
            	            
            break;
            
        case 'btnDelete':
    		formatGML = new GML({
				featureNS: 'muc',
				featureType: 'cite:input_network'//,
			//	srsName: 'EPSG:3857'
			});
				
            interaction = new Select();
            interaction.getFeatures().on('add', function (e) {
                transactWFS('delete', e.target.item(0),formatGML);
                interactionSelectPointerMove.getFeatures().clear();
                interaction.getFeatures().clear();
            });
            map.addInteraction(interaction);
            break;

        default:
            break;
    }
});




//////////////////////////////--- WAYS LAYER USER INTERACTION ---//////////////////////////////

var sketch; 
var measureTooltipElement;
var measureTooltip;
function createMeasureTooltip() {
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
  }

  
var formatLength = function(line) {
    var length = getLength(line);
    var output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) +
          ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) +
          ' ' + 'm';
    }
    return output;
  };




var staticUserId = 1; //temporary
function WfsRequestFunction (srsName,namespace,workspace,layerName,filter){
    console.log(srsName,namespace,workspace,layerName,filter);
    var wfs = new WFS().writeGetFeature({
        srsName: srsName,
        featureNS: namespace,
        featurePrefix: workspace,
        featureTypes: [layerName],
        outputFormat: 'application/json',
        filter: filter
    });
    var xmlparser = xs.serializeToString(wfs);
    return xmlparser;
}


    //Add the query layer to the map
var QueryLayerSouce = new VectorSource({wrapX: false});
var QueryLayer = new VectorLayer({
        source: QueryLayerSouce,
        style: drawing_style
    });
    QueryLayer.setMap(map);

    //Ways Layer
var ExtractStreetsSource = new VectorSource({wrapX: false});
var ExtractStreetsLayer = new VectorLayer({
    source: ExtractStreetsSource,
    style: boundaryStyle
});

ExtractStreetsLayer.setMap(map);

//Add the radius layer to the map
var CircleRadiusLayerSource = new VectorSource({wrapX: false});
var CircleRadiusLayer = new VectorLayer({
        source: CircleRadiusLayerSource,
        style: drawing_style
    });
CircleRadiusLayer.setMap(map);

//Selected Layer
var SelectedLayerSource = new VectorSource({wrapX: false});
var SelectedLayer = new VectorLayer({
        source: SelectedLayerSource,
        style: vector_style
    });
SelectedLayer.setMap(map);



var CircleRadius = {
    radiusInteraction: null,
    mapListener: null,
    circleCenterCoordinates: null,
    CircleRadiusLength: null,
    pointerMoveHandler: function(evt){
        if (evt.dragging ||searchInteraction.circleRadius == null) {
            return;
        }
        var centerCoord = CircleRadius.circleCenterCoordinates;
        var currentCoord = evt.coordinate;
     if (centerCoord == null){
        CircleRadius.circleCenterCoordinates = currentCoord;
        centerCoord = currentCoord;
     }

     var deltaX = Math.pow(currentCoord[0]-centerCoord[0],2);
     var deltaY = Math.pow(currentCoord[1]-centerCoord[1],2);
     var radiusLength = Math.sqrt(deltaX+deltaY).toFixed(); // this one is used to check if the radius is greater than 1000m, not dependended from interaction
    CircleRadius.CircleRadiusLength = radiusLength;
     //Add the radius length in tooltip overlay
     if (CircleRadius.CircleRadiusLength > 1000){
        measureTooltipElement.innerHTML = "Maximum Circle Radius is 1000 m";
     } else {
        measureTooltipElement.innerHTML = searchInteraction.circleRadius;
     }
    
     measureTooltip.setPosition(currentCoord);
    },
    add: function(){
        this.remove();
       createMeasureTooltip();
       var CircleRadiusInteraction = new Draw({
            source: CircleRadiusLayerSource,
            type: 'LineString',
            condition: function(mapBrowserEvent){
                if (CircleRadius.CircleRadiusLength > 1000) {
                    return false;
               } else {
                   return true;
               }
            }
          });
          map.addInteraction(CircleRadiusInteraction);
          CircleRadius.radiusInteraction = CircleRadiusInteraction;
          CircleRadius.mapListener = map.on('pointermove',CircleRadius.pointerMoveHandler);
    },
    remove: function(){
          map.removeInteraction(CircleRadius.radiusInteraction);
          CircleRadius.circleCenterCoordinates = null;
          CircleRadius.CircleRadiusLength = null;
          unByKey(CircleRadius.mapListener);
          if(measureTooltipElement){
            $( ".tooltip-static" ).remove();
         }
         if (measureTooltipElement) {
            $(".tooltip").remove();
        }
    }
}


var searchInteraction = {
    interaction: null,
    circleRadius: null,
    drawStartEvent: function (evt){
       evt.feature.getGeometry().on('change', function(evt) {
        var geom = evt.target;
        var radiusLength = geom.getRadius().toFixed().toString() + ' m';
        searchInteraction.circleRadius = radiusLength;

       });
    },
    drawStopEvent: function (evt){
        $('#mySpinner').addClass('spinner');
        searchInteraction.circleRadius = null
        //1 - SPATIAL INTERSECT WITH ORIGINAL DATA
       var circle = evt.feature.getGeometry();  
       var circleGeom = fromCircle(circle);
       var filterIntersect = intersectsFilter('geom', circleGeom, 'EPSG:3857');

        //Get the feature that intersect with geometry
       var wfsRequestXmlStringOriginalTable = WfsRequestFunction('EPSG:3857',ApiConstants.geoserver_namespaceURI, ApiConstants.geoserver_workspace,'ways',filterIntersect);
       var originalTableRequest = fetch(ApiConstants.wfs_url,{
            method: 'POST',
            body: wfsRequestXmlStringOriginalTable,
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml'
            }
        }).then(function(response){
            return response.json();
        })

         //2 - USER INPUT FILTER BASED ON USER ID
       var filterUserInputTable = equalToFilter('userid', staticUserId);
       var combinedFilter = andFilter(filterUserInputTable,filterIntersect)
       var wfsRequestXmlStringUserInputTable = WfsRequestFunction('EPSG:3857',ApiConstants.geoserver_namespaceURI, ApiConstants.geoserver_workspace,'ways_userinput',combinedFilter);
        var userInputTableRequest = fetch(ApiConstants.wfs_url,{
            method: 'POST',
            body: wfsRequestXmlStringUserInputTable,
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml'
            }
        }).then(function(response){
            return response.json();
        });

        //3- START THE REQUESTS AND FILTER THE RESULTS
        Promise.all([originalTableRequest,userInputTableRequest]).then(function(values){
            $('#mySpinner').removeClass('spinner');
            var originalFeatures = new GeoJSON().readFeatures(values[0]); 
            var userInputFeatures = new GeoJSON().readFeatures(values[1]);
            ExtractStreetsSource.addFeatures(originalFeatures);
           
            ///Filter out original features from user drawned features
            var userInputFeaturesWithOriginalId  = [];
            var originalIdsArr = []
            var userInputFeaturesWithoutOriginalId = [];

            var i;

            for (i=0;i<userInputFeatures.length;i++){
                var currentFeature = userInputFeatures[i];
                var id = parseInt(currentFeature.getId().split(".")[1]);
                currentFeature.setId(id);
                
                if (currentFeature.getProperties().original_id != null){
                    userInputFeaturesWithOriginalId.push(currentFeature)
                    originalIdsArr.push(currentFeature.getProperties().original_id);
                } else {
                    userInputFeaturesWithoutOriginalId.push(currentFeature);
                }
                console.log(currentFeature.getId());
            }

            for (var i=0;i<originalFeatures.length;i++){
                var currentFeature = originalFeatures[i];
                var original_id = currentFeature.getProperties().id;
                if (originalIdsArr.includes(original_id)){
                    ExtractStreetsSource.removeFeature(currentFeature);
                }
            }
            ExtractStreetsSource.addFeatures(userInputFeaturesWithOriginalId);
            ExtractStreetsSource.addFeatures(userInputFeaturesWithoutOriginalId);

           
        });
        //4- CLEAR OUT
        ExtractStreetsSource.clear();
        searchInteraction.stop();
        CircleRadius.remove();
        
    },
    init: function(){
        this.stop();
        waysInteraction.remove();
        QueryLayer.getSource().clear();
        ExtractStreetsSource.clear();
        //Add circle interaction to search for the geojson features on the map
        var circleDraw = new Draw({
            source: QueryLayer.getSource(),
            type: 'Circle',
            condition: function(mapBrowserEvent){
                if (CircleRadius.CircleRadiusLength > 1000) {
                    return false;
               } else {
                   return true;
               }
            }
        });
        this.interaction = circleDraw;
        map.addInteraction(circleDraw);
        circleDraw.on('drawend',this.drawStopEvent);
        circleDraw.on('drawstart',this.drawStartEvent);
    },
    stop: function (){
        if (this.interaction != null){
            map.removeInteraction(this.interaction);
        }
        this.interaction = null;
        
    }
}

ExtractStreetsSource.on('changefeature',function (evt){
    if (waysInteraction.interactionType == 'modify'){
        var index = waysInteraction.featuresToCommit.findIndex(i => i.ol_uid == evt.feature.ol_uid )
        if (index == -1){
            waysInteraction.featuresToCommit.push(evt.feature)
        } else {
            waysInteraction.featuresToCommit[index]=evt.feature;
        }
    }
});



//BUTTON EVENT HANDLERS





var waysInteraction = {
    featuresToCommit: [],
    featuresIDsToDelete: [],
    currentInteraction: null,
    interactionType: null,
    snapInteraction: null,
    deleteListenerKey: null,
    featureToDelete: null,
    popupDeleteYesFn: function (evt){
        var f = waysInteraction.featureToDelete;
        waysInteraction.transact();
        ExtractStreetsSource.removeFeature(waysInteraction.featureToDelete);
        closePopupFn();
    },
    deleteFeature: function(evt){
        //This function will be added on map click event 
        SelectedLayerSource.clear();
        var coord = evt.coordinate;
        var feature = ExtractStreetsSource.getClosestFeatureToCoordinate(coord);
        if (feature != null){
            var geometry = feature.getGeometry();
            var coordinates = geometry.getCoordinates();
            var startCoord = coordinates[0];
            waysInteraction.featureToDelete = feature;
            SelectedLayerSource.addFeature(feature);
            console.log(feature);
            popupOverlay.setPosition(startCoord);    
        }
    },
    interactionStart: function (evt) {
        waysInteraction.featuresToCommit = [];
    },
    interactionEnd: function (evt){
        if (waysInteraction.interactionType == 'draw'){
            var feature = evt.feature;
            waysInteraction.featuresToCommit.push(feature);
        }
     console.log(waysInteraction.featuresToCommit);
     waysInteraction.transact();
    },
    remove: function(){
     if (this.snapInteraction != null){
         map.removeInteraction(this.snapInteraction);
     }
     if (this.currentInteraction != null){
         map.removeInteraction(this.currentInteraction);
     }
     //Unbound delete function listener key
     unByKey(this.deleteListenerKey);
     popupOverlay.setPosition(undefined);
     this.featuresToCommit = [];
     this.featureToDelete = null;
    },
    add: function (interaction,type){
        this.remove();
        //Draw and modify interaction
        this.interactionType = type;
        if (interaction != null){
            map.addInteraction(interaction);
            var snap = new Snap({source: ExtractStreetsSource});
            map.addInteraction(snap);
            this.currentInteraction = interaction;
            interaction.on(type+'start',this.interactionStart);
            interaction.on(type+'end',this.interactionEnd);
            this.snapInteraction = snap    
        } else {
            this.deleteListenerKey  = map.on('click',this.deleteFeature);
        }
    },
    transact: function (){
        
        //DRAW/MODIFY INTERACTION
        if (this.interactionType == 'draw' || this.interactionType == 'modify'){
            // 1- Get the features, transform geometry and properties
            var featuresToAdd = [];
            var featuresToUpdate = [];
            var featuresToRemoveArr = [];
            //There is the case on update interaction when some features needs to be added
            //and the features that are already in table needs to be updated
            var i;
            for (i=0;i<this.featuresToCommit.length;i++){
                var f = this.featuresToCommit[i];
                //Feature Properties
                var props = f.getProperties();
                //Transform the feature
                var geometry = f.getGeometry().clone();
                geometry.transform("EPSG:3857", "EPSG:4326");

             

                var transformed = new Feature({	
                    userid : staticUserId,                
                    geom: geometry,
                    class_id: f.getProperties().class_id
                });
                transformed.setGeometryName("geom");

                if (!props.hasOwnProperty('original_id') && ((this.interactionType == 'modify'))){
                    transformed.set('original_id',f.getProperties().id);
                }

                if ((typeof f.getId() == 'undefined' && Object.keys(props).length == 1) || !props.hasOwnProperty('original_id')){
                    featuresToAdd.push(transformed);
                    featuresToRemoveArr.push(f);

                } else if((props.hasOwnProperty('original_id')) && (this.interactionType == 'modify')) {
                    transformed.setId(f.getId());
                    featuresToUpdate.push(transformed);
                }
            }
        } else if (this.interactionType == 'delete'){
            if (this.featureToDelete.getProperties().original_id != null){
                return;
            }
        } else {
            return;
        }
        


    console.log(ApiConstants.geoserver_workspace);
    formatGML = {
        featureNS: ApiConstants.geoserver_namespaceURI,
        featureType: 'ways_userinput',
        srsName: 'urn:x-ogc:def:crs:EPSG:4326'
    };
       var node;
    
    console.log(this.featureToDelete);
    console.log(this.interactionType);
    switch (this.interactionType) {
            case 'draw':
                node = formatWFS.writeTransaction(featuresToAdd, null, null, formatGML);       
                break;
            case 'modify':
                node = formatWFS.writeTransaction(featuresToAdd,featuresToUpdate,null,formatGML);
                break;
            case 'delete':
            console.log('passed here');
                node = formatWFS.writeTransaction(null, null, this.featureToDelete, formatGML);
                break;
        }
        console.log(node);
     var payload = xs.serializeToString(node);
     console.log(payload)
    
    $.ajax({
        type: "POST",
        url: ApiConstants.wfs_url,
        data: new XMLSerializer().serializeToString(node),
        contentType: 'text/xml',
        success: function(data) {
            if (this.interactionType == 'delete'){
                return;
            }
            console.log(data);
            var result = formatWFS.readTransactionResponse(data);
            var FIDs = result.insertIds;
            console.log(result);
            if (FIDs != undefined && FIDs[0]!="none"){
                var i;
                for (i=0;i<FIDs.length;i++){
                    var id = parseInt(FIDs[i].split(".")[1]);
                    ExtractStreetsSource.removeFeature(featuresToRemoveArr[i])
                    featuresToAdd[i].setId(id);
                    featuresToAdd[i].getGeometry().transform("EPSG:4326", "EPSG:3857")
                    ExtractStreetsSource.addFeature(featuresToAdd[i]);
                }
            }
        },
        error: function(e) {
         
        },
        context: this
    });


    }


}





 /**
 * Popup Dialog Box for delete function.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
container.style.visibility = 'visible';
var popupOverlay = new Overlay({
element: container,
autoPan: true,
autoPanAnimation: {
    duration: 250
}
});
map.addOverlay(popupOverlay)

function closePopupFn (){
popupOverlay.setPosition(undefined);
SelectedLayerSource.clear();
closer.blur();
return false;
}


closer.onclick = closePopupFn
btnNoDeleteFeature.onclick = closePopupFn
btnYesDeleteFeature.onclick = waysInteraction.popupDeleteYesFn;



//Button click events
$('.expert_draw').click(function () {
    let buttonID = this.id;
    if (buttonID == 'btnQuery'){
        searchInteraction.init();
        CircleRadius.add();
        return;
    }

    switch(buttonID){
        case 'btnDraw':
       var drawInteraction = new Draw({
                source: ExtractStreetsSource,
                type: 'LineString'
                });
        waysInteraction.add(drawInteraction,'draw');
        tool_tip(drawInteraction,'line');
        break;
        case 'btnModify':
        var modifyInteraction = new Modify({
                source: ExtractStreetsSource,
                });
                console.log('modify executed');
        waysInteraction.add(modifyInteraction,'modify');
        break
        case 'btnDelete':
        // ADD BUTTON DELETE
        waysInteraction.add(null,'delete');
        break;
    }

 


})


export {userid,number_calculations,layerWFS_point,drawnLine};


