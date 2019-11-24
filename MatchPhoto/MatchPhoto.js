if (typeof MatchPhoto == 'undefined')
{
    MatchPhoto = {};
}

// define the name of the Group that will contain all cameras
var cameraContainerGroupAndLayerName = "Cameras";
// put the Group of cameras in the Main History (0)
var cameraContainerGroupHistoryID = 0;

MatchPhoto.GetScreenPointInWorldSpace = function(history, x, y)
{
    // distance from camera position to plane
    var distance = 10;

    // get a pickray at the provided screen point
    var pickray = WSM.Utils.PickRayFromNormalizedScreenPoint(x, y);
    //console.log(JSON.stringify(pickray));

    pickrayPoint = pickray.pickrayLine.point;
    pickrayVector = pickray.pickrayLine.vector;

    newPickrayPointX = pickrayPoint.x + pickrayVector.x * distance;
    newPickrayPointY = pickrayPoint.y + pickrayVector.y * distance;
    newPickrayPointZ = pickrayPoint.z + pickrayVector.z * distance;
    //console.log(newPickrayPointX + ',' + newPickrayPointY + ',' + newPickrayPointZ);

    var pickrayPoint3d = WSM.Geom.Point3d(newPickrayPointX, newPickrayPointY, newPickrayPointZ);

    //var vertex = WSM.APICreateVertex(history, pickrayPoint3d);
    return pickrayPoint3d;
}

MatchPhoto.CreateSceneCameraGeometry = function(nHistoryID, scenes)
{
    console.log("Building scene camera geometry...");
    // current camera to return to
    var currentCamera = FormIt.Cameras.GetCameraData();

    // if the Cameras layer doesn't exist, create it
    if (!FormIt.Layers.LayerExists(cameraContainerGroupAndLayerName))
    {
        FormIt.Layers.AddLayer(nHistoryID, cameraContainerGroupAndLayerName, true);
        console.log("Created a new Cameras layer");
    }
    else 
    {
        console.log("Cameras layer already exists");
    }

    // need to figure out what ID the camera container layer is
    // start by getting all Layers
    var allLayers = FormIt.Layers.GetLayerList();

    // look for the Cameras layer by name, and get the ID
    for (var i = 0; i < allLayers.length; i++)
    {
        if (allLayers[i].Name == cameraContainerGroupAndLayerName)
        {
            var cameraContainerGroupLayerID = allLayers[i].Id;
            //console.log("Matching Layer ID: " + cameraContainerGroupLayerID);
            break;
        }
    }

    // get all the objects on the Cameras layer
    var cameraLayerObjects = FormIt.Layers.GetAllObjectsOnLayers(cameraContainerGroupLayerID);
    //console.log("Objects on Cameras Layer: " + JSON.stringify(cameraLayerObjects));

    // if any objects were found on this Layer...
    if (cameraLayerObjects.length > 0)
    {
        console.log("Objects were found on the Cameras layer");
        for (var i = 0; i < cameraLayerObjects.length; i++)
        {
            //currentSelection[j]["ids"][historyDepth]["Object"]
            var objectID = cameraLayerObjects[i]["ids"][0]["Object"];
            //console.log("Object ID: " + objectID);

            // get this object's properties
            var objectProperties = WSM.APIGetObjectPropertiesReadOnly(nHistoryID, objectID);
            //console.log(JSON.stringify(objectProperties));

            var objectName = objectProperties.sObjectName;
            //console.log("Camera layer object name: " + objectName);

            if (objectName == cameraContainerGroupAndLayerName)
            {
                //console.log("Object to delete: " + objectID);
                WSM.APIDeleteObject(nHistoryID, objectID);
                console.log("Deleted old Cameras");
            }
        }
    }

    // create an empty group for the cameras
    var cameraContainerGroupID = WSM.APICreateGroup(nHistoryID, []);
    //console.log("Group ID: " + cameraContainerGroupID);

    // create a new history for the cameras
    var cameraContainerGroupHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, cameraContainerGroupID);

    // get the instance ID of the Group
    var cameraContainerGroupInstanceID = JSON.parse(WSM.APIGetObjectsByTypeReadOnly(nHistoryID, cameraContainerGroupID, WSM.nInstanceType));
    //console.log("Instance ID: " + cameraContainerGroupInstanceID);

    // put the camera container group on the cameras layer
    FormIt.Layers.AssignLayerToObjects(cameraContainerGroupLayerID, cameraContainerGroupInstanceID);

    // set the name of the camera container group
    WSM.APISetObjectProperties(nHistoryID, cameraContainerGroupInstanceID, cameraContainerGroupAndLayerName, false);

    // set the name of the camera container group instance
    WSM.APISetRevitFamilyInformation(cameraContainerGroupHistoryID, false, false, "", cameraContainerGroupAndLayerName, "", "");
    //WSM.APISetObjectProperties(cameraGroupHistory, cameraGroupID, "Cameras", false, undefined);

    // for each scene, get the camera data and set the current camera to match, then generate the camera geom
    for (var i = 0; i < scenes.length; i++)
    {
        var sceneCamera = scenes[i].camera;
        //console.log("Camera: " + sceneCamera);

        FormIt.Cameras.SetCameraData(sceneCamera);
        MatchPhoto.CreateCurrentCameraGeometry(cameraContainerGroupHistoryID);
    }

    console.log("Built new Cameras");
    
    // return to the camera when the operation started
    FormIt.Cameras.SetCameraData(currentCamera);
}

MatchPhoto.CreateCurrentCameraGeometry = function(nHistoryID)
{
	// get info about the current camera
	var cameraData = FormIt.Cameras.GetCameraData();

	// get the current camera's centerpoint
	var cameraPosX = cameraData.posX;
	var cameraPosY = cameraData.posY;
	var cameraPosZ = cameraData.posZ;

    // create a point3d
    var cameraPosition = WSM.Geom.Point3d(cameraPosX, cameraPosY, cameraPosZ);

    // create the camera position vertex
    WSM.APICreateVertex(nHistoryID, cameraPosition);

    // create the camera corner points
    point0 = MatchPhoto.GetScreenPointInWorldSpace(nHistoryID, 0, 0);
    point1 = MatchPhoto.GetScreenPointInWorldSpace(nHistoryID, 0, 1);
    point2 = MatchPhoto.GetScreenPointInWorldSpace(nHistoryID, 1, 1);
    point3 = MatchPhoto.GetScreenPointInWorldSpace(nHistoryID, 1, 0);

    var points = [point0, point1, point2, point3];

    // connect the points with a rectangle
    var polyline = WSM.APICreatePolyline(nHistoryID, points, true);
}

MatchPhoto.Execute = function()
{
    console.clear();
    console.log("Match Photo plugin\n");

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get all the scenes
    var allScenes = FormIt.Scenes.GetScenes();
    //console.log(JSON.stringify(allScenes));

    //MatchPhoto.CreateCurrentCameraGeometry(nHistoryID);
    MatchPhoto.CreateSceneCameraGeometry(cameraContainerGroupHistoryID, allScenes);
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
MatchPhoto.Submit = function()
{
    var args = {
    //"MoveX": parseFloat(document.a.X.value),
    //"MoveY": parseFloat(document.a.Y.value)
    }
    //console.log("deanstein.MatchPhoto");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the MoveCameras function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("MatchPhoto.Execute", args);
}
