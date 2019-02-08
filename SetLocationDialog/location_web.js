LocationDialog = {};

LocationDialog.GetLocation = function(callback)
{
    console.log("WEB:LocationDialog.GetLocation");

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
}

LocationDialog.FinishImport = function(importSettings)
{
    FormItInterface.CallMethod("LocationDialog.FinishImport", importSettings);
    PluginDialog.Close();
}
