LocationDialog = {};
LocationDialog.PluginLocation = "PLUGINLOCATION";
LocationDialog.ShowDialog = function()
{
    var dialogParams = {
    "PluginName": "Specify the location",
    "DialogBox": "PLUGINLOCATION/location.html",
    "DialogBoxWidth": 800,
    "DialogBoxHeight": 800,
    "DialogBoxType": "Modal"};

    //console.log("LocationDialog.ShowDialog: " + LocationDialog.PluginLocation );
    FormIt.CreateDialogBox(JSON.stringify(dialogParams));
}
FormIt.Commands.RegisterJSCommand("LocationDialog.ShowDialog");

LocationDialog.GetLocation = function()
{
    console.log("WEB:LocationDialog.GetLocation");
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
