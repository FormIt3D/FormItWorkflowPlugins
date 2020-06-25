if (typeof ManageCameras == 'undefined')
{
    ManageCameras = {};
}

// define the name of the Group that will contain all cameras
var cameraContainerGroupAndLayerName = "Cameras";
// put the Group of cameras in the Main History (0)
var cameraContainerGroupHistoryID = 0;

// updates variables about the camera
ManageCameras.getCurrentCameraData = function()
{
    var currentCameraData = FormIt.Cameras.GetCameraData();
    var currentCameraHeightAboveGround = currentCameraData.posZ;

    var currentLevelsData = FormIt.Levels.GetLevelsData (0, true);
    var closestLevelName;
    var closestLevelElevation = 0;

    // get the closest level below the camera
    for (var i = 0; i < currentLevelsData.length; i++)
    {
        // only proceed if this level is shorter than the current camera height
        if (currentLevelsData[i].Elevation < currentCameraHeightAboveGround)
        {
            // if we're not at the last Level
            if (i + 1 < currentLevelsData.Length)
            {
                // check if this Level is the closest below the Camera height
                if (currentCameraHeightAboveGround - currentLevelsData[i].Elevation < (currentLevelsData[i + 1].Elevation - currentLevelsData[i].Elevation))
                {
                    closestLevelName = currentLevelsData[i].Name;
                    closestLevelElevation = currentLevelsData[i].Elevation;

                }
            }
            // if we're at the end of the Levels list, this is the highest Level, and thus the closest
            else
            {
                closestLevelName = currentLevelsData[i].Name;
                closestLevelElevation = currentLevelsData[i].Elevation;
            }
        }
    }

    // return the data we need in a json for the web-side to read from
    return {
        "currentCameraData" : FormIt.Cameras.GetCameraData(),
        "cameraHeightAboveGroundStr" : FormIt.StringConversion.LinearValueToString(currentCameraHeightAboveGround),
        "currentLevelsData" : currentLevelsData,
        "closestLevelName" : closestLevelName,
        "closestLevelElevationStr" : FormIt.StringConversion.LinearValueToString(closestLevelElevation),
        "cameraHeightAboveLevelStr" : FormIt.StringConversion.LinearValueToString(currentCameraHeightAboveGround - closestLevelElevation)
    }
}

// updates variables about the camera
ManageCameras.setCameraHeightFromLevel = function(args)
{
    var newCameraHeightFromLevel = 0;
    var closestLevelElevation = 0;

    // if the input value is a number, use it as-is
    if (!isNaN(Number(args.newCameraHeightFromLevelStr)))
    {
        newCameraHeightFromLevel = FormIt.PluginUtils.currentUnits(Number(args.newCameraHeightFromLevelStr));
    }
    // otherwise, convert the string to a number
    else
    {
        newCameraHeightFromLevel = FormIt.StringConversion.StringToLinearValue(args.newCameraHeightFromLevelStr).second;
    }

    // if the input value is a number, use it as-is
    if (!isNaN(Number(args.closestLevelElevationStr)))
    {
        closestLevelElevation = FormIt.PluginUtils.currentUnits(Number(args.closestLevelElevationStr));
    }
    // otherwise, convert the string to a number
    else
    {
        closestLevelElevation = FormIt.StringConversion.StringToLinearValue(args.closestLevelElevationStr).second;
    }

    var newCameraData = args.currentCameraData;
    newCameraData.posZ = closestLevelElevation + newCameraHeightFromLevel;

    FormIt.Cameras.SetCameraData(newCameraData);
}

ManageCameras.setCameraHeightFromGround = function(args)
{
    var newCameraHeightFromGround = 0;

    // if the input value is a number, use it as-is
    if (!isNaN(Number(args.newCameraHeightFromGroundStr)))
    {
        newCameraHeightFromGround = FormIt.PluginUtils.currentUnits(Number(args.newCameraHeightFromGroundStr));
    }
    // otherwise, convert the string to a number
    else
    {
        newCameraHeightFromGround = FormIt.StringConversion.StringToLinearValue(args.newCameraHeightFromGroundStr).second;
    }

    var newCameraData = args.currentCameraData;
    newCameraData.posZ = newCameraHeightFromGround;

    FormIt.Cameras.SetCameraData(newCameraData);
}

ManageCameras.getScreenPointInWorldSpace = function(x, y, planeDistance)
{
    // get a pickray at the provided screen point (normalized 0-1)
    var pickray = WSM.Utils.PickRayFromNormalizedScreenPoint(x, y);
    //console.log(JSON.stringify(pickray));

    pickrayPoint = pickray.pickrayLine.point;
    pickrayVector = pickray.pickrayLine.vector;

    newPickrayPointX = pickrayPoint.x + pickrayVector.x * planeDistance;
    newPickrayPointY = pickrayPoint.y + pickrayVector.y * planeDistance;
    newPickrayPointZ = pickrayPoint.z + pickrayVector.z * planeDistance;
    //console.log(newPickrayPointX + ',' + newPickrayPointY + ',' + newPickrayPointZ);

    var pickrayPoint3d = WSM.Geom.Point3d(newPickrayPointX, newPickrayPointY, newPickrayPointZ);

    return pickrayPoint3d;
}

ManageCameras.getViewportAspectRatioByPickray = function(distance)
{
    // get the lower left and upper right screen points
    var lowerLeftPoint = ManageCameras.getScreenPointInWorldSpace(0, 1, distance);
    var lowerRightPoint = ManageCameras.getScreenPointInWorldSpace(1, 1, distance);
    var upperLeftPoint = ManageCameras.getScreenPointInWorldSpace(0, 0, distance);

    // calculate the viewport width and height
    var viewportWidth = getDistanceBetweenTwoPoints(lowerRightPoint.x, lowerRightPoint.y, lowerRightPoint.z, lowerLeftPoint.x, lowerLeftPoint.y, lowerLeftPoint.z);
    var viewportHeight = getDistanceBetweenTwoPoints(upperLeftPoint.x, upperLeftPoint.y, upperLeftPoint.z, lowerLeftPoint.x, lowerLeftPoint.y, lowerLeftPoint.z);

    // determine the aspect ratio
    var aspectRatio = viewportWidth/viewportHeight;

    // TODO: replace this function with one that doesn't require a pickray
    // the following API will be available in v20 - will be fewer steps to get the aspect ratio, and won't require pickray
    //var viewportSize = FormIt.Cameras.GetViewportSize();
    
    return aspectRatio;
}

// gets an object in this history by name, optionally searching a smaller array of objects
ManageCameras.getObjectOnLayerByName = function(nHistoryID, keyName, layerID)
{    
    // get all the objects on the provided Layer
    var layerObjects = FormIt.Layers.GetAllObjectsOnLayers(layerID);

    // TODO: find out why this API ^^^ returns something different when editing a Group, vs. Main Sketch

    for (var i = 0; i < layerObjects.length; i++)
    {
        var objectID = layerObjects[i]["ids"][0]["Object"];
        //console.log("Object ID: " + objectID);

        // get this object's properties
        var objectProperties = WSM.APIGetObjectPropertiesReadOnly(nHistoryID, objectID);
        //console.log(JSON.stringify(objectProperties));

        var objectName = objectProperties.sObjectName;
        //console.log("Camera layer object name: " + objectName);

        // if we found the object, return its ID; otherwise, return false
        if (objectName == keyName)
        {
            console.log("Found existing object " + "'" + objectName + "'" + " with ID " + objectID);
            return objectID;
        }
        else
        {
            return null;
        }
    }
}

// look for a Group with this name, in this history and if found, delete it
ManageCameras.deleteObjectByName = function(nHistoryID, objectsArray, keyName)
{
    for (var i = 0; i < objectsArray.length; i++)
    {
        //currentSelection[j]["ids"][historyDepth]["Object"]
        var objectID = objectsArray[i];
        //console.log("Object ID: " + objectID);

        // get this object's properties
        var objectProperties = WSM.APIGetObjectPropertiesReadOnly(nHistoryID, objectID);
        //console.log(JSON.stringify(objectProperties));

        var objectName = objectProperties.sObjectName;
        //console.log("Camera layer object name: " + objectName);

        if (objectName == keyName)
        {
            //console.log("Object to delete: " + objectID);
            WSM.APIDeleteObject(nHistoryID, objectID);
            console.log("Deleted camera: " + objectName);
        }
    }
}

// create a Group by name, if it doesn't exist already, and return its ID
ManageCameras.getOrCreateGroupOnLayerByName = function(nHistoryID, groupName, layer)
{
    // first, check if this Group exists
    var groupID = ManageCameras.getObjectOnLayerByName(nHistoryID, groupName, layer);

    // if this Group doesn't exist, create it
    if (!groupID)
    {
        groupID = WSM.APICreateGroup(nHistoryID, []);
        //console.log("Group ID: " + groupID);
    }
    
    return groupID;
}

// create a layer by name, if it doesn't exist already, and return its ID
ManageCameras.getOrCreateLayerByName = function(nHistoryID, layerName)
{
    // if the named layer doesn't exist, create it
    if (!FormIt.Layers.LayerExists(layerName))
    {
        FormIt.Layers.AddLayer(nHistoryID, layerName, true);
        console.log("Created a new Layer: " + "'" + layerName + "'");
    }
    else 
    {
        console.log("Layer " + "'" + layerName + "'" + " already exists");
    }

    // need to figure out what ID is
    // start by getting all Layers
    var allLayers = FormIt.Layers.GetLayerList();

    // look for the Cameras layer by name, and get the ID
    for (var i = 0; i < allLayers.length; i++)
    {
        if (allLayers[i].Name == layerName)
        {
            var layerID = allLayers[i].Id;
            //console.log("Matching Layer ID: " + cameraContainerGroupLayerID);
            break;
        }
    }
    
    return layerID;
}

ManageCameras.createSceneCameraGeometry = function(nHistoryID, scenes, aspectRatio)
{
    console.log("Building scene camera geometry...");

    // create or find the Cameras layer, and get its ID
    var camerasLayerID = ManageCameras.getOrCreateLayerByName(cameraContainerGroupHistoryID, cameraContainerGroupAndLayerName);

    // find or create the Cameras container Group on the Cameras Layer, and get its ID
    var cameraContainerGroupID = ManageCameras.getOrCreateGroupOnLayerByName(nHistoryID, cameraContainerGroupAndLayerName, camerasLayerID);
    // get the instance ID of the Group
    var cameraContainerGroupInstanceID = JSON.parse(WSM.APIGetObjectsByTypeReadOnly(nHistoryID, cameraContainerGroupID, WSM.nInstanceType));
    // create a new history for the cameras
    var cameraContainerGroupRefHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, cameraContainerGroupID);

    // put the camera container group on the cameras layer
    FormIt.Layers.AssignLayerToObjects(camerasLayerID, cameraContainerGroupInstanceID);

    // set the name of the camera container group
    WSM.APISetObjectProperties(nHistoryID, cameraContainerGroupInstanceID, cameraContainerGroupAndLayerName, false);
    // set the name of the camera container group instance
    WSM.APISetRevitFamilyInformation(cameraContainerGroupRefHistoryID, false, false, "", cameraContainerGroupAndLayerName, "", "");

    // TODO: add an option to delete all cameras not tracked by a Scene

    // for each scene, get the camera data and set the current camera to match, then generate the camera geometry
    for (var i = 0; i < scenes.length; i++)
    {
        var sceneCameraData = scenes[i].camera;
        //console.log("Camera: " + sceneCamera);

        var sceneName = scenes[i].name;
        //console.log("Scene name: " + sceneName);

        // get all the camera objects in the container
        var cameraObjects = WSM.APIGetAllObjectsByTypeReadOnly(cameraContainerGroupRefHistoryID, WSM.nInstanceType);
        
        // look for any Camera Groups matching this name, and delete it
        ManageCameras.deleteObjectByName(cameraContainerGroupRefHistoryID, cameraObjects, sceneName);

        // create the geometry for this camera
        ManageCameras.createCameraGeometryFromData(sceneCameraData, cameraContainerGroupRefHistoryID, sceneName, aspectRatio);

        console.log("Built new camera: " + sceneName);
    }
}

// creates camera geometry from camera data
ManageCameras.createCameraGeometryFromData = function(cameraData, nHistoryID, cameraInstanceName, aspectRatio)
{
    // distance from the point to the camera plane
    var cameraDepth = 5;

    // cameras will need to be moved to the origin, then Grouped, then moved back (to get the LCS correct)
    var origin = WSM.Geom.Point3d(0, 0, 0);

    // get the FOV from the camera data
    var FOV = cameraData.FOV;

    // determine the normalized view width and height
    if (aspectRatio <= 1.0) {
        width = Math.tan(FOV);
        height = width / aspectRatio;
    } else {
        height = Math.tan(FOV);
        width = height * aspectRatio;
    }

    // multiply the width and height by distance
    height *= cameraDepth;
    width *= cameraDepth;

    // construct the camera forward vector
    var cameraForwardVector = multiplyVectorByQuaternion(0, 0, -1, cameraData.rotX, cameraData.rotY, cameraData.rotZ, cameraData.rotW);
    // scale the vector by the distance
    cameraForwardVector = scaleVector(cameraForwardVector, cameraDepth);
    var cameraForwardVector3d = WSM.Geom.Vector3d(cameraForwardVector[0], cameraForwardVector[1], cameraForwardVector[2]);
    //console.log(JSON.stringify(cameraForwardVector3d));

    // construct the camera up vector
    var cameraUpVector = multiplyVectorByQuaternion(0, 1, 0, cameraData.rotX, cameraData.rotY, cameraData.rotZ, cameraData.rotW);   
    // scale the vector by the  height
    cameraUpVector = scaleVector(cameraUpVector, height);
    var cameraUpVector3d = WSM.Geom.Vector3d(cameraUpVector[0], cameraUpVector[1], cameraUpVector[2]);
    //console.log(JSON.stringify(cameraUpVector3d));

    // construct the camera right vector
    var cameraRightVector = multiplyVectorByQuaternion(-1, 0, 0, cameraData.rotX, cameraData.rotY, cameraData.rotZ, cameraData.rotW);
    // scale the vector by the  width
    cameraRightVector = scaleVector(cameraRightVector, width);
    var cameraRightVector3d = WSM.Geom.Vector3d(cameraRightVector[0], cameraRightVector[1], cameraRightVector[2]);
    //console.log(JSON.stringify(cameraRightVector3d));

	// get the current camera's position
    var cameraPosition = WSM.Geom.Point3d(cameraData.posX, cameraData.posY, cameraData.posZ);
    //console.log(JSON.stringify(cameraPosition));

    // construct the 4 corners of the camera

    // lower left
    var point0x = cameraPosition.x + cameraForwardVector3d.x - cameraRightVector3d.x - cameraUpVector3d.x;
    var point0y = cameraPosition.y + cameraForwardVector3d.y - cameraRightVector3d.y - cameraUpVector3d.y;
    var point0z = cameraPosition.z + cameraForwardVector3d.z - cameraRightVector3d.z - cameraUpVector3d.z;
    var point0 = WSM.Geom.Point3d(point0x, point0y, point0z);

    // upper left
    var point1x = cameraPosition.x + cameraForwardVector3d.x - cameraRightVector3d.x + cameraUpVector3d.x;
    var point1y = cameraPosition.y + cameraForwardVector3d.y - cameraRightVector3d.y + cameraUpVector3d.y;
    var point1z = cameraPosition.z + cameraForwardVector3d.z - cameraRightVector3d.z + cameraUpVector3d.z;
    var point1 = WSM.Geom.Point3d(point1x, point1y, point1z);

    // upper right
    var point2x = cameraPosition.x + cameraForwardVector3d.x + cameraRightVector3d.x + cameraUpVector3d.x;
    var point2y = cameraPosition.y + cameraForwardVector3d.y + cameraRightVector3d.y + cameraUpVector3d.y;
    var point2z = cameraPosition.z + cameraForwardVector3d.z + cameraRightVector3d.z + cameraUpVector3d.z;
    var point2 = WSM.Geom.Point3d(point2x, point2y, point2z);

    // lower right
    var point3x = cameraPosition.x + cameraForwardVector3d.x + cameraRightVector3d.x - cameraUpVector3d.x;
    var point3y = cameraPosition.y + cameraForwardVector3d.y + cameraRightVector3d.y - cameraUpVector3d.y;
    var point3z = cameraPosition.z + cameraForwardVector3d.z + cameraRightVector3d.z - cameraUpVector3d.z;
    var point3 = WSM.Geom.Point3d(point3x, point3y, point3z);

    // all camera points
    var points = [point0, point1, point2, point3];

    // the end points of the camera frustum lines
    var frustumLineEndoints0 = [cameraPosition, point0];
    var frustumLineEndpoints1 = [cameraPosition, point1];
    var frustumLineEndpoints2 = [cameraPosition, point2];
    var frustumLineEndpoints3 = [cameraPosition, point3];

    // set up an array to capture all camera geometry objects
    var cameraObjectIDs = [];

    // create a vertex at the camera position
    var cameraPosVertexObjectID = WSM.APICreateVertex(nHistoryID, cameraPosition);

    var frustumLinesObjectIDs = [];
    // create lines from the camera position to the camera corners
    var frustumLine0 = WSM.APICreatePolyline(nHistoryID, frustumLineEndoints0, false);
    frustumLinesObjectIDs.push(WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, WSM.nEdgeType).created);
    var frustumLine1 = WSM.APICreatePolyline(nHistoryID, frustumLineEndpoints1, false);
    frustumLinesObjectIDs.push(WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, WSM.nEdgeType).created);
    var frustumLine2 = WSM.APICreatePolyline(nHistoryID, frustumLineEndpoints2, false);
    frustumLinesObjectIDs.push(WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, WSM.nEdgeType).created);
    var frustumLine3 = WSM.APICreatePolyline(nHistoryID, frustumLineEndpoints3, false);
    frustumLinesObjectIDs.push(WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, WSM.nEdgeType).created);

    // connect the points with a rectangle - this will create a rectangular surface in front of the camera
    WSM.APICreatePolyline(nHistoryID, points, true);

    // get the faces and push it into the array
    var faceObjectID = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, WSM.nFaceType).created;

    // add the camera position vertex and the frustum lines to the camera geometry array
    //cameraObjectIDs.push(cameraPosVertexObjectID);
    cameraObjectIDs.push(frustumLinesObjectIDs);
    cameraObjectIDs.push(faceObjectID);

    cameraObjectIDs = flattenArray(cameraObjectIDs);

    //
    // we want to put the camera in a Group, and set the LCS to align with the camera geometry
    // to do this, we need to move the camera to the origin, and rotate it in 3D to point along an axis
    // then make it into a Group, so the Group's origin and axis alignments match the camera plane
    // 

    // get the vector from the camera's position to the origin
    var cameraToOriginVector = getVectorBetweenTwoPoints(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0, 0, 0);
    // convert the vector to the resulting WSM point3d
    var translatedCameraPositionPoint3d = WSM.Geom.Point3d(cameraToOriginVector[0], cameraToOriginVector[1], cameraToOriginVector[2]);

    // create a transform for moving the camera to the origin, keeping its current orientation
    var cameraMoveToOriginTransform = WSM.Geom.MakeRigidTransform(translatedCameraPositionPoint3d, WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1));


    // create a transform for rotating the camera to face an axis
    // this requires the geometry to be at the world origin
    // the position of cameraForwardVector3d determines which axis the camera will face
    var cameraRotateToAxisTransform = WSM.Geom.MakeRigidTransform(origin, cameraRightVector3d, cameraUpVector3d, cameraForwardVector3d);
    // invert the transform
    var cameraRotateToAxisTransformInverted = WSM.Geom.InvertTransform(cameraRotateToAxisTransform);

    // first, only move the camera to the origin (no rotation)
    WSM.APITransformObjects(nHistoryID, cameraObjectIDs, cameraMoveToOriginTransform);

    // now rotate the camera to face the axis
    WSM.APITransformObjects(nHistoryID, cameraObjectIDs, cameraRotateToAxisTransformInverted);

    // 
    // now that the camera is at the origin, and aligned correctly, we can Group it
    //

    // create a new Group for this Scene's Camera
    var cameraGroupID = WSM.APICreateGroup(nHistoryID, cameraObjectIDs);
    // get the instance ID of the Group
    var cameraGroupInstanceID = JSON.parse(WSM.APIGetObjectsByTypeReadOnly(nHistoryID, cameraGroupID, WSM.nInstanceType));
    // create a new history for the camera
    var cameraGroupHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, cameraGroupID);

    //
    // put the camera plane in its own Group, with the origin at the centroid
    //

    // get the face - this is the camera plane
    // this assumes there's only 1 face represented from the camera geometry
    var newContextCameraViewPlaneFaceID = JSON.parse(WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(cameraGroupHistoryID, WSM.nFaceType).created);
    
    var cameraViewPlaneCentroidPoint3d = WSM.APIGetFaceCentroidPoint3dReadOnly(cameraGroupHistoryID, newContextCameraViewPlaneFaceID);
    //console.log(cameraViewPlaneCentroidPoint3d);

    // set the name of the camera group
    WSM.APISetRevitFamilyInformation(cameraGroupHistoryID, false, false, "", "Camera", "", "");
    // set the name of the camera group instance
    WSM.APISetObjectProperties(nHistoryID, cameraGroupInstanceID, cameraInstanceName, false);

    var cameraViewPlaneMoveToOriginVector = getVectorBetweenTwoPoints(cameraViewPlaneCentroidPoint3d.x, cameraViewPlaneCentroidPoint3d.y, cameraViewPlaneCentroidPoint3d.z, 0, 0, 0);
    var translatedCameraPlanePositionPoint3d = WSM.Geom.Point3d(cameraViewPlaneMoveToOriginVector[0], cameraViewPlaneMoveToOriginVector[1], cameraViewPlaneMoveToOriginVector[2]);

    // create a transform for moving the camera plane to the origin
    var cameraPlaneMoveToOriginTransform = WSM.Geom.MakeRigidTransform(translatedCameraPlanePositionPoint3d, WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1));

    // create a transform for moving the camera plane back to its original position
    var cameraViewPlaneReturnToPosTransform = WSM.Geom.MakeRigidTransform(cameraViewPlaneCentroidPoint3d, WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1));

    // move the camera plane to the origin
    WSM.APITransformObjects(cameraGroupHistoryID, newContextCameraViewPlaneFaceID, cameraPlaneMoveToOriginTransform);

    // create a new Group for the camera viewplane
    var cameraViewPlaneGroupID = WSM.APICreateGroup(cameraGroupHistoryID, newContextCameraViewPlaneFaceID);

    // get the instanceID of the Group
    var cameraViewPlaneGroupInstanceID = JSON.parse(WSM.APIGetObjectsByTypeReadOnly(cameraGroupHistoryID, cameraViewPlaneGroupID, WSM.nInstanceType));
    // create a new history for the camera view plane
    var cameraViewPlaneGroupHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(cameraGroupHistoryID, cameraViewPlaneGroupID);

    // set the name of the view plane group
    WSM.APISetRevitFamilyInformation(cameraViewPlaneGroupHistoryID, false, false, "", "ViewPlane", "", "");
    // set the name of the view plane instance
    WSM.APISetObjectProperties(cameraViewPlaneGroupHistoryID, cameraViewPlaneGroupInstanceID, "View Plane", false);

    // move the view plane instance back to where it belongs
    WSM.APITransformObjects(cameraGroupHistoryID, cameraViewPlaneGroupID, cameraViewPlaneReturnToPosTransform);

    //
    // move the frustum lines into their own group
    // 

    var newContextFrustumLinesObjectIDs = WSM.APIGetAllObjectsByTypeReadOnly(cameraGroupHistoryID, WSM.nEdgeType);

    // move the camera frustum lines to the origin
    WSM.APITransformObjects(cameraGroupHistoryID, newContextFrustumLinesObjectIDs, cameraPlaneMoveToOriginTransform);

    // create a new Group for the camera frustum lines
    var cameraFrustumLinesGroupID = WSM.APICreateGroup(cameraGroupHistoryID, newContextFrustumLinesObjectIDs);
    // get the instanceID of the Group
    var cameraFrustumLinesGroupInstanceID = JSON.parse(WSM.APIGetObjectsByTypeReadOnly(cameraGroupHistoryID, cameraFrustumLinesGroupID, WSM.nInstanceType));
    // create a new history for the camera view plane
    var cameraFrustumLinesGroupHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(cameraGroupHistoryID, cameraFrustumLinesGroupID);

    // set the name of the view plane group
    WSM.APISetRevitFamilyInformation(cameraFrustumLinesGroupHistoryID, false, false, "", "FrustumLines", "", "");
    // set the name of the view plane instance
    WSM.APISetObjectProperties(cameraFrustumLinesGroupHistoryID, cameraFrustumLinesGroupInstanceID, "Frustum Lines", false);

    // move the frustum lines instance back to where it belongs
    WSM.APITransformObjects(cameraGroupHistoryID, cameraFrustumLinesGroupID, cameraViewPlaneReturnToPosTransform);

    //
    // now move the Group Instance back to the camera's original position
    //

    // create a tranform to move the camera back and reset its alignment to where it was
    var cameraReturnToCameraPosTransform = WSM.Geom.MakeRigidTransform(cameraPosition, cameraRightVector3d, cameraUpVector3d, cameraForwardVector3d);

    // move and rotate the camera back
    WSM.APITransformObjects(nHistoryID, cameraGroupInstanceID, cameraReturnToCameraPosTransform);

    //
    // move the camera position vertex into the camera Group
    //

    WSM.APICopyOrSketchAndTransformObjects(nHistoryID, cameraGroupHistoryID, cameraPosVertexObjectID, cameraMoveToOriginTransform, 1);
    WSM.APIDeleteObject(nHistoryID, cameraPosVertexObjectID);

}

// this is called by the submit function from the panel - all steps to execute the generation of camera geometry
ManageCameras.executeGenerateCameraGeometry = function()
{
    console.clear();
    console.log("Manage Scene Cameras plugin\n");

    // get all the scenes
    var allScenes = FormIt.Scenes.GetScenes();
    //console.log(JSON.stringify(allScenes));

    // get the current camera aspect ratio to use for geometry
    // the distance supplied here is arbitrary
    var currentAspectRatio = ManageCameras.getViewportAspectRatioByPickray(10);

    // start an undo manager state - this should suspend WSM and other updates to make this faster
    FormIt.UndoManagement.BeginState();

    // create the camera geometry for all scenes
    ManageCameras.createSceneCameraGeometry(cameraContainerGroupHistoryID, allScenes, currentAspectRatio);

    // end the undo manager state
    FormIt.UndoManagement.EndState("Create camera geometry");
}
