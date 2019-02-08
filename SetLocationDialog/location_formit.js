LocationDialog = {};
LocationDialog.PluginLocation = "PLUGINLOCATION";
LocationDialog.ShowDialog = function()
{
    var dialogParams = {
    "PluginName": "Specify the location",
    "DialogBox": "PLUGINLOCATION/location.html",
    "DialogBoxWidth": 1000,
    "DialogBoxHeight": 700,
    "DialogBoxType": "Modal"};

    //console.log("LocationDialog.ShowDialog: " + LocationDialog.PluginLocation );
    FormIt.CreateDialogBox(JSON.stringify(dialogParams));
}
FormIt.Commands.RegisterJSCommand("LocationDialog.ShowDialog");

LocationDialog.GetLocation = function()
{
    return FormIt.SunAndLocation.GetProjectAddress();
}

LocationDialog.SaveLocation = function(args)
{
    FormIt.SunAndLocation.SetLocation(args.longitude, args.latitude);
    FormIt.SunAndLocation.SetProjectAddress(args.address);
}

LocationDialog.FinishImport = function(importSettings)
{
    FormIt.SunAndLocation.AddSatelliteImage(
        importSettings.centerLat,
        importSettings.centerLon,
        importSettings.latSpan,
        importSettings.lonSpan,
        importSettings.pixelWidth,
        importSettings.pixelHeight,
        importSettings.physicalWidth,
        importSettings.physicalHeight,
        importSettings.address
    );
}
