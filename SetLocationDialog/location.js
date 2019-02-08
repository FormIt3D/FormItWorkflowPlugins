//Used by Pyramid
window.prepareBindings = (bindings) =>{
    _map_global_bindings = bindings;
}

class FormItMap {
    constructor(){
        this._addressInput = document.getElementById('AddressInput');
        this._importMapContainer = document.getElementById('ImportMapContainer');
        this._importMapControl = document.getElementById('ImportMapControl');

        this._importModeButtons = document.getElementById('ImportModeButtons');
        this._locationModeButtons = document.getElementById('LocationModeButtons');

        this._importButton = document.getElementById('StartImportButton');
        this._setLocationButton = document.getElementById('SetLocationButton');
        this._cancelLocationButton = document.getElementById('CancelLocationButton');
        
        this._finishImportButton = document.getElementById('FinishImportButton');
        this._cancelImportButton = document.getElementById('CancelImportButton');

        this._importButton.addEventListener('click', this._startImport.bind(this));
        this._finishImportButton.addEventListener('click', this._finishImport.bind(this));
        this._cancelImportButton.addEventListener('click', this._cancelImport.bind(this));

        this._setLocationButton.addEventListener('click', this._saveLocationOnly.bind(this));
        this._cancelLocationButton.addEventListener('click', this._cancelLocation.bind(this));

        this._addressInput.addEventListener('keypress', (event) => {
            //enter key
            if (event.keyCode === 13){
                this._address = this._addressInput.value;
                this._location = undefined;
                this._geocodeLocationAddress(() => {
                    this._updatePushPin();
                    this._focusLocation();

                    //now reverseGeocode to get a formatted location
                    this._address = "";
                    this._geocodeLocationAddress(() => {
                        this._addressInput.value = this._address;
                    });
                });
            }
        });

        this._setLocationButton = document.getElementById('SetLocationButton');
        this._cancelLocationButton = document.getElementById('CancelLocationButton');

        this._maxMapImportSize = 640;

        //Boulder
        const defaultLocation = new Microsoft.Maps.Location(40.019253, -105.274239);

        this._locationMap = new Microsoft.Maps.Map('#LocationMapControl', {
            location: defaultLocation,
            disableStreetside: true,
            disableBirdseye: true
        });

        Microsoft.Maps.loadModule('Microsoft.Maps.Search', () => {
            this._searchManager = new Microsoft.Maps.Search.SearchManager(this._locationMap);
        });

        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', () => {
            const manager = new Microsoft.Maps.AutosuggestManager({ map: this._locationMap });
            manager.attachAutosuggest('#AddressInput', '#LocationSearchContainer', this._searchLocationSelected.bind(this));
        });

        this._importMap = new Microsoft.Maps.Map('#ImportMapControl', {
            mapTypeId: Microsoft.Maps.MapTypeId.aerial,
            showDashboard: false,
            disableStreetside: true
        });

        this._importMap.setView({
            labelOverlay: Microsoft.Maps.LabelOverlay.hidden,
            zoom:18
        });

        Microsoft.Maps.Events.addHandler(this._importMap, 'viewchange', () => {
            this._syncMaps();
        });

        //window.addEventListener('resize', this._handleResize.bind(this));
        Microsoft.Maps.Events.addHandler(this._locationMap, 'mapresize', () => {
            this._handleResize();
        });

        //Fix for resize bug FORMIT-9236
        //https://social.msdn.microsoft.com/Forums/SECURITY/en-US/fa924dad-fab4-46ad-b5d6-cecdeb9721c7/bing-map-control-v8-returns-wrong-values-after-resize?forum=bingmapsajax
        this._handleResize();
        this.resetAddress();
    }

    setBindings (bindings){
        this._bindings = bindings;
    }

    resetAddress (){
        this._location = undefined;
        this._address = "";

        //Really annoying bug with Bing maps...
        //on first load, if we try to query bing apis from map control and the map isn't rendered,
        //the userMapView size will be invalid and bing APIs will fail.
        //  From Bing http response: "userMapView: This parameter value is out of range."
        //So just put a little timeout to give the map some time to load.

        //Is there an event hook to know if Bing maps is ready? Apparently not!
        //https://docs.microsoft.com/en-us/bingmaps/v8-web-control/map-control-api/map-class#events
        window.setTimeout(() => {
            if (this._bindings && this._bindings.getAddressAsync){
                this._bindings.getAddressAsync((address) => {
                    this._setAddress(address);
                });
            }
        },100)
    }

    _setAddress (address){
        if (!address){
            return;
        }

        this._address = address;
        this._addressInput.value = address;
        this._location = undefined;

        this._geocodeLocationAddress(() => {
            this._updatePushPin();
            this._focusLocation();
        });
    }

    _geocode(address, callback){
        if (address && address !== ""){
            this._searchManager.geocode({
                count: 1,
                callback: callback,
                errorCallback: (error) => {
                    console.log(`Geocode error looking up address ${JSON.stringify(error)}`);
                },
                where: address
            });
        }
    }

    _reverseGeocode(latitude, longitude, callback){
        this._searchManager.reverseGeocode({
            location: new Microsoft.Maps.Location(latitude, longitude),
            callback: callback,
            count: 1,
            errorCallback: (error) => {
                console.log(`Reverse geocode error looking up by location ${JSON.stringify(error)}`);
            }
        });
    }

    _geocodeLocationAddress(callback){
        if(!this._address && this._location){
            this._reverseGeocode(this._location.latitude, this._location.longitude, (result) => {
                this._address = result.name;
                callback();
            });
        }else if (this._address && !this._location){
            this._geocode(this._address, (result) => {
                this._location = result.results[0].location;
                callback();
            });
        }else{
            callback();
        }
    }

    _startImport(){
        this._importMapContainer.style.display = 'block';
        this._importModeButtons.style.display = 'block';
        this._locationModeButtons.style.display = 'none';

        this._importMap.setView({
            center: this._locationMap.getCenter(),
            zoom: 20
        });

        this._syncMaps();
    }

    _finishImport(){
        //Get current UI pixel size, but clamp to 640x640
        let pixelWidth = this._importMapControl.clientWidth;
        let pixelHeight = this._importMapControl.clientHeight;

        const bounds = this._importMap.getBounds();

        var west = bounds.getNorthwest().latitude;
        var east = bounds.getSoutheast().latitude;
        var north = bounds.getSoutheast().longitude;
        var south = bounds.getNorthwest().longitude;

        const latSpan = west - east;
        const lonSpan = north - south;


        if (pixelWidth > 640){
            latSpan *= 640 / pixelWidth;
            pixelWidth = 640;
        }

        if (pixelHeight > 640){
            lonSpan *= 640 / pixelHeight;
            pixelHeight = 640;
        }

        const centerLat = this._importMap.getCenter().latitude;
        const centerLon = this._importMap.getCenter().longitude;

        const westPt = new Microsoft.Maps.Location(centerLat - latSpan/2, centerLon);
        const eastPt = new Microsoft.Maps.Location(centerLat + latSpan/2, centerLon);
        const northPt = new Microsoft.Maps.Location(centerLat , centerLon + lonSpan/2);
        const southPt = new Microsoft.Maps.Location(centerLat, centerLon - lonSpan/2);

        Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', () => {
            const meterWidth = Microsoft.Maps.SpatialMath.getDistanceTo(westPt, eastPt);
            const meterHeight = Microsoft.Maps.SpatialMath.getDistanceTo(northPt, southPt);

            //formit internal unit is in feet
            const metersToFeet = 3.28;
            const physicalWidth = meterWidth * metersToFeet;
            const physicalHeight = meterHeight * metersToFeet;

            this._reverseGeocode(centerLat, centerLon, (result) => {
                this._importMapContainer.style.display = 'none';
                this._importModeButtons.style.display = 'none';
                this._locationModeButtons.style.display = 'block';

                this._location = new Microsoft.Maps.Location(centerLat, centerLon);
                this._address = result.name;
                this._addressInput.value = this._address;
                this._updatePushPin();
                this._focusLocation();
                
                this._bindings.finishImport({
                    centerLat: centerLat,
                    centerLon: centerLon, 
                    latSpan: Math.abs(latSpan),
                    lonSpan: Math.abs(lonSpan),
                    pixelWidth: pixelWidth,
                    pixelHeight: pixelHeight,
                    physicalWidth: physicalWidth,
                    physicalHeight: physicalHeight,
                    address: this._address
                });
            });
        });
    }

    _cancelImport(){
        this._importMapContainer.style.display = 'none';
        this._importModeButtons.style.display = 'none';
        this._locationModeButtons.style.display = 'block';
    }

    _saveLocationOnly(){
        if (!this._address && !this._location){
            //TODO better dialog.
            alert("Please choose a location");
            return;
        }

        this._geocodeLocationAddress(() => {
            this._bindings.saveLocation(this._address, this._location.latitude, this._location.longitude);
        });
    }

    _cancelLocation(){
        this._bindings.cancel();
    }

    _focusLocation(){
        this._locationMap.setView({
            center: this._location,
            zoom: 18
        });
    }

    _searchLocationSelected (result) {
        this._address = result.formattedSuggestion;
        this._location = result.location

        this._updatePushPin();
        this._focusLocation();
    }

    _updatePushPin(){
        this._locationMap.entities.clear();

        this._locationPin = new Microsoft.Maps.Pushpin(this._location, {
            color: '#f00',
            draggable: true
        });

        this._locationMap.entities.push(this._locationPin);

        Microsoft.Maps.Events.addHandler(this._locationPin, 'dragend', () => { 
            this._location = this._locationPin.getLocation();
            this._address = "";
            this._focusLocation();
            this._geocodeLocationAddress(() => {
                this._addressInput.value = this._address;
            });
        })
    }

    _handleResize () {
        const minLength = Math.min(window.innerHeight, window.innerWidth, this._maxMapImportSize);

        //keep import map square by minium length
        this._importMapControl.style.height = `${minLength}px`;
        this._importMapControl.style.width = `${minLength}px`;
        
        this._importMap.setView({
            center: this._location,
            width: minLength, 
            height: minLength 
        });

        this._syncMaps();
    }

    _syncMaps () {
        //keep location map in sync
        this._locationMap.setView({
            center: this._importMap.getCenter(),
            zoom: this._importMap.getZoom()
        });
    }    
}

//global object needed so bing can properly load
//defined in Bing library url param "callback"
window.FormItMapGlobalInit = () => {
    const map = new FormItMap();
    window.setBindings = map.setBindings.bind(map);
    window.resetAddress = map.resetAddress.bind(map);

    //Support for Pyramid.
    if (window._map_global_bindings){
        window.setBindings(_map_global_bindings);
    }
}