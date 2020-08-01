if (typeof ManageCameras == 'undefined')
{
    ManageCameras = {};
}

// IDs for inputs whose value will be updated when the camera changes
var cameraHeightFromLevelInputID = 'cameraHeightFromNearestLevel';
var cameraHeightFromGroundInputID = 'cameraHeightFromGround';
var cameraHeightFromLeveLabelOriginalContents = '';

// update the FormIt camera height from the "above level" input
ManageCameras.setCameraHeightAboveLevelFromInput = function()
{
    var newCameraHeightFromLevelStr = document.getElementById(cameraHeightFromLevelInputID).value;

    var args = { "currentCameraData" : ManageCameras.currentCameraData,
                    "closestLevelElevationStr" : ManageCameras.closestLevelElevationStr,
                    "newCameraHeightFromLevelStr" : newCameraHeightFromLevelStr };

    window.FormItInterface.CallMethod("ManageCameras.setCameraHeightFromLevel", args, function(result)
    {

    });
     
    ManageCameras.updateUI();
}

// update the FormIt camera height from the input value
ManageCameras.setCameraHeightAboveGroundFromInput = function()
{ 
    var newCameraHeightFromGroundStr = document.getElementById(cameraHeightFromGroundInputID).value;

    var args = { "currentCameraData" : ManageCameras.currentCameraData,
                    "newCameraHeightFromGroundStr" : newCameraHeightFromGroundStr };

    window.FormItInterface.CallMethod("ManageCameras.setCameraHeightFromGround", args, function(result)
    {

    });
     
    ManageCameras.updateUI();
}

ManageCameras.updateUI = function()
{
    var args = { };
    window.FormItInterface.CallMethod("ManageCameras.getCurrentCameraData", args, function(result)
    {
        // parse the results
        result = JSON.parse(result);
        ManageCameras.currentCameraData = result.currentCameraData;
        ManageCameras.currentLevelsData = result.currentLevelsData;
        ManageCameras.closestLevelName = result.closestLevelName;
        ManageCameras.closestLevelElevationStr = result.closestLevelElevationStr;

        // get the camera height from the ground, and set it as the input value
        var cameraHeightFromGroundStr = result.cameraHeightAboveGroundStr;
        var cameraHeightFromGroundInput = document.getElementById(cameraHeightFromGroundInputID);
        cameraHeightFromGroundInput.value = cameraHeightFromGroundStr;

        // if there are levels, and if we're above at least one level,
        // show the "camera height above level" module
        if (ManageCameras.currentLevelsData != '' && ManageCameras.closestLevelName != undefined)
        {
            // get the camera height above the nearest level and set it as the input avlue
            var cameraHeightFromLevelInput = document.getElementById(cameraHeightFromLevelInputID);
            var cameraHeightFromLevelModule = cameraHeightFromLevelInput.parentElement;
            var cameraHeightFromLevelLabel = cameraHeightFromLevelModule.querySelector('.inputLabel');

            cameraHeightFromLevelModule.className = 'inputModuleContainer';
            cameraHeightFromLevelInput.value = result.cameraHeightAboveLevelStr;
            if (cameraHeightFromLeveLabelOriginalContents == '')
            {
                cameraHeightFromLeveLabelOriginalContents = cameraHeightFromLevelLabel.innerHTML;
                cameraHeightFromLevelLabel.innerHTML += " (" + result.closestLevelName + "):";
            }
            else 
            {
                cameraHeightFromLevelLabel.innerHTML = cameraHeightFromLeveLabelOriginalContents + " (" + result.closestLevelName + "):";
            }
        }
        // otherwise, hide the "camera height above level" module - it doesn't apply
        else
        {
            var cameraHeightFromLevelInput = document.getElementById(cameraHeightFromLevelInputID);
            var cameraHeightFromLevelModule = cameraHeightFromLevelInput.parentElement;

            cameraHeightFromLevelModule.className = 'hide';
        }
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

    var cameraHeightAboveLevelModule = new FormIt.PluginUI.TextInputModule('Height Above Level ', 'cameraHeightFromLevelModule', 'inputModuleContainer', cameraHeightFromLevelInputID, ManageCameras.setCameraHeightAboveLevelFromInput);
    contentContainer.appendChild(cameraHeightAboveLevelModule.element);

    var cameraHeightAboveGroundModule = new FormIt.PluginUI.TextInputModule('Height Above Ground: ', 'cameraHeightFromGroundModule', 'inputModuleContainer', cameraHeightFromGroundInputID, ManageCameras.setCameraHeightAboveGroundFromInput);
    contentContainer.appendChild(cameraHeightAboveGroundModule.element);

    // separator and space
    contentContainer.appendChild(document.createElement('p'));
    contentContainer.appendChild(document.createElement('hr'));
    contentContainer.appendChild(document.createElement('p'));

    // 
    // create the generate cameras from scenes section
    //
    var generateSceneCamerasSubheader = new FormIt.PluginUI.HeaderModule('Export Scenes to Cameras', "For each Scene in this project, create a Camera object that stores the Scene's camera and metadata", 'headerContainer');
    contentContainer.appendChild(generateSceneCamerasSubheader.element);

    var detailsUL = contentContainer.appendChild(document.createElement('ul'));

    var detailsLI1 = detailsUL.appendChild(document.createElement('li'));
    detailsLI1.innerHTML = 'Use the "Cameras" Layer to control the visibility of these new Camera objects.';
    var detailsLI2 = detailsUL.appendChild(document.createElement('li'));
    detailsLI2.innerHTML = 'Camera geometry can be used to transfer camera data between FormIt projects, or other apps.';

    // the generate button
    var generateSceneCamerasButton = new FormIt.PluginUI.Button('Export Scenes to Cameras', function()
    {
        var args = {
        }
    
        window.FormItInterface.CallMethod("ManageCameras.executeGenerateCameraGeometry", args);
    });
    contentContainer.appendChild(generateSceneCamerasButton.element);

    //
    // create the update scene cameras from geometry section
    //
    var updateScenesFromCamerasSubheader = new FormIt.PluginUI.HeaderModule('Import Scenes from Cameras', 'For each Camera in this project, update or create the corresponding Scene.');
    contentContainer.appendChild(updateScenesFromCamerasSubheader.element);

    var detailsUL = contentContainer.appendChild(document.createElement('ul'));

    var detailsLI1 = detailsUL.appendChild(document.createElement('li'));
    detailsLI1.innerHTML = 'Existing Scenes with the same name will overwritten, and new Scenes will be created as required.', 'headerContainer';

    // the update button
    var generateSceneCamerasButton = new FormIt.PluginUI.Button('Import Scenes from Cameras', function()
    {
        var args = {
        }
    
        window.FormItInterface.CallMethod("ManageCameras.executeUpdateScenesFromCameras", args);
    });
    contentContainer.appendChild(generateSceneCamerasButton.element);

    //
    // create the footer
    //
    var footerModule = new FormIt.PluginUI.FooterModule;
    document.body.appendChild(footerModule.element);
}