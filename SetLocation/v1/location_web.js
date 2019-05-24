LocationDialog = {};

LocationDialog.GetLocation = function(callback)
{
    FormItInterface.CallMethod("LocationDialog.GetLocation", "", function(locationJSON)
        {
            let location = JSON.parse(locationJSON);
            callback(location);
        }
    );
}

LocationDialog.Cancel = function()
{
    PluginDialog.Close();
}

LocationDialog.SaveLocation = function(address, latitude, longitude)
{
    let args = {
        "address": address,
        "latitude": latitude,
        "longitude": longitude
        }
    FormItInterface.CallMethod("LocationDialog.SaveLocation", args);
    PluginDialog.Close();
}

LocationDialog.FinishImport = function(importSettings)
{
    FormItInterface.CallMethod("LocationDialog.FinishImport", importSettings);
    PluginDialog.Close();
}

LocationDialog.ShowNotification = function(messageObj)
{
    FormItInterface.CallMethod("LocationDialog.ShowNotification", messageObj);
}

LocationDialog.FetchNearestWeatherStations = function(locationObj, callback)
{
    FormItInterface.CallMethod(
        "LocationDialog.FetchNearestWeatherStations",
        locationObj,
        function(result){
            //TODO Why is this stringified twice?
            callback(JSON.parse(JSON.parse(result)));
        }
    );
}

LocationDialog.IsImperialUnitType = function(callback)
{
    FormItInterface.CallMethod(
        "LocationDialog.IsImperialUnitType",
        "",
        function(result){
            callback(JSON.parse(result));
        }
    );
}

LocationDialog.FetchDashboardWidgets = function (callback)
{
    FormItInterface.CallMethod(
        "LocationDialog.FetchDashboardWidgets",
        "",
        function(result){
            //Not entirely sure why this is stringified twice...
            callback(JSON.parse(JSON.parse(result)));
        }
    );
}

LocationDialog.FetchWidgetsForStation = function (stationId, widgetIds, widgetVersions, callback)
{
    const args = {
        stationId,
        widgetIds,
        widgetVersions
    };

    FormItInterface.CallMethod(
        "LocationDialog.FetchWidgetsForStation",
        args,
        function(result){
            //Not entirely sure why this is stringified twice...
            callback(JSON.parse(JSON.parse(result)));
        }
    );
}

LocationDialog.CheckLogin = function (callback)
{
    FormItInterface.CallMethod(
        "LocationDialog.CheckLogin",
        "",
        function(result){
            callback(JSON.parse(result));
        }
    );
}