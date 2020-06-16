if (typeof ManageCameras == 'undefined')
{
    ManageCameras = {};
}

// instantiate the items we want to quantify
var cameraHeight = 0;

// IDs for inputs whose value will be updated when the camera changes
var cameraHeightInputID = 'cameraHeightInputID';

// update the FormIt camera height from the input value
ManageCameras.setCurrentCameraHeightFromInput = function()
{
    var newCameraHeightStr = document.getElementById(cameraHeightInputID).value;

    var args = { "currentCameraData" : ManageCameras.currentCameraData,
                "newCameraHeightStr" : newCameraHeightStr };
    window.FormItInterface.CallMethod("ManageCameras.setCurrentCameraData", args, function(result)
    {

    });
     
    ManageCameras.updateUIWithCameraInfo();
}

ManageCameras.updateUIWithCameraInfo = function()
{
    var args = { };
    window.FormItInterface.CallMethod("ManageCameras.getCurrentCameraData", args, function(result)
    {
        // parse the results
        result = JSON.parse(result);
        ManageCameras.currentCameraData = result.currentCameraData;
        console.log(JSON.stringify(ManageCameras.currentCameraData));

        // get the camera height and set it as the input value
        cameraHeight = result.currentCameraHeight;
        var cameraHeightInput = document.getElementById(cameraHeightInputID);
        cameraHeightInput.value = cameraHeight;
    });
}

// initialize the UI
ManageCameras.initializeUI = function()
{
    // create an overall container for all objects that comprise the "content" of the plugin
    // everything except the footer
    var contentContainer = document.createElement('div');
    contentContainer.id = 'contentContainer';
    contentContainer.className = 'contentContainer'
    window.document.body.appendChild(contentContainer);

    // create the overall header
    var headerContainer = new FormIt.PluginUI.HeaderModule('Manage Cameras', 'Manage camera objects, including the current camera and cameras from Scenes.', 'headerContainer');
    contentContainer.appendChild(headerContainer.element);

    // separator and space
    contentContainer.appendChild(document.createElement('hr'));
    contentContainer.appendChild(document.createElement('p'));

    //
    // create the camera details container
    //

    var cameraDetailsSubheader = new FormIt.PluginUI.HeaderModule('Main Camera', '', 'headerContainer');
    contentContainer.appendChild(cameraDetailsSubheader.element);

    var cameraHeightInputModule = new FormIt.PluginUI.TextInputModule('Camera Height: ', 'cameraHeightInputModule', 'inputModuleContainer', cameraHeightInputID, ManageCameras.setCurrentCameraHeightFromInput);
    contentContainer.appendChild(cameraHeightInputModule.element);

    // separator and space
    contentContainer.appendChild(document.createElement('p'));
    contentContainer.appendChild(document.createElement('hr'));
    contentContainer.appendChild(document.createElement('p'));

    //
    // create the create gamera geometry section
    //
    var generateSceneCamerasSubheader = new FormIt.PluginUI.HeaderModule('Create Scene Cameras', 'Generate camera geometry for every Scene in the project.', 'headerContainer');
    contentContainer.appendChild(generateSceneCamerasSubheader.element);

    var detailsUL = contentContainer.appendChild(document.createElement('ul'));

    var detailsLI1 = detailsUL.appendChild(document.createElement('li'));
    detailsLI1.innerHTML = 'Cameras will be generated in a Group and Layer called "Cameras"';
    var detailsLI2 = detailsUL.appendChild(document.createElement('li'));
    detailsLI2.innerHTML = 'Camera geometry can be used to transfer camera data between FormIt projects, or other apps.';

    // the generate button
    var generateSceneCamerasButton = new FormIt.PluginUI.Button('Create Scene Cameras', function()
    {
        var args = {
        }
    
        window.FormItInterface.CallMethod("ManageCameras.executeGenerateCameraGeometry", args);
    });
    contentContainer.appendChild(generateSceneCamerasButton.element);

    //
    // create the footer
    //
    var footerModule = new FormIt.PluginUI.FooterModule;
    document.body.appendChild(footerModule.element);
}