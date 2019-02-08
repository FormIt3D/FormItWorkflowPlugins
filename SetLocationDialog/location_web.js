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
