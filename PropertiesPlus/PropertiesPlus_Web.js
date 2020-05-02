if (typeof PropertiesPlus == 'undefined')
{
    PropertiesPlus = {};
}

// since this process isn't running in FormIt, we need to use integers for object types, so here's a reference list:
"WSM.nUnSpecifiedType = 0;"
"WSM.nBodyType = 1;"
"WSM.nLumpType = 2;"
"WSM.nShellType = 3;"
"WSM.nFaceType = 4;"
"WSM.nLoopType = 5;"
"WSM.nCoedgeType = 6;"
"WSM.nEdgeType = 7;"
"WSM.nVertexType = 8;"
"WSM.nMaterialAttributeType = 9;"
"WSM.nMaterialType = 10;"
"WSM.nCircleAttributeType = 11;"
"WSM.nObjectPropertiesAttributeType = 12;"
"WSM.nTextureType = 13;"
"WSM.nLevelAttributeType = 14;"
"WSM.nLevelType = 15;"
"WSM.nSketchPropertiesType = 16;"
"WSM.nSplineCurveAttributeType = 17;"
"WSM.nCylinderSurfaceAttributeType = 18;"
"WSM.nSphereSurfaceAttributeType = 19;"
"WSM.nExtrudeSurfaceAttributeType = 20;"
"WSM.nImageType = 21;"
"WSM.nSatelliteDataAttributeType = 22;"
"WSM.nGroupType = 23;"
"WSM.nInstanceType = 24;"
"WSM.nLayerAttributeType = 25;"
"WSM.nLayerType = 26;"
"WSM.nGeneratedGeometryInformationType = 27;"
"WSM.nFaceUVDataAttributeType = 28;"
"WSM.nEdgeStyleAttributeType = 29;"
"WSM.nBlendAttributeType = 30;"
"WSM.nStringAttributeType = 31;"
"WSM.nMeshType = 32;"
"WSM.nLineMeshType = 33;"
"WSM.nPointMeshType = 34;"
"WSM.nNumObjectTypes = 35;"

// instantiate the items we want to count
var objectCount = 0;

var vertexCount = 0;
var edgeCount = 0;
var faceCount = 0;
var bodyCount = 0;
var groupCount = 0;
var groupInstanceCount = 0;
var identicalGroupInstanceCount = 0;
var meshCount = 0;

var isMultipleObjects = false;
var isOneOrMoreVertices = false;
var isOneOrMoreEdges = false;
var isOneOrMoreFaces = false;
var isOneOrMoreBodies = false;
var isOneOrMoreMeshes = false;
var isSingleGroupInstanceOnly = false;
var isOneOrMoreGroupInstances = false;
var isMultipleGroupInstances = false;

// objects that will be updated (contents or visibility) when the selection changes
var objectCountDiv;
var objectCountLabel; 
var objectCountHorizontalRule;
var vertexCountDiv;
var vertexCountLabel;
var edgeCountDiv;
var edgeCountLabel;
var faceCountDiv;
var faceCountLabel;
var bodyCountDiv;
var bodyCountLabel;
var groupInstanceCountDiv;
var groupInstanceCountLabel;
var meshCountDiv;
var meshCountLabel;
var identicalGroupInstanceCountDiv;
var identicalGroupInstanceCountLabel;

var singleGroupDetailsContainerDiv;
var singleGroupInstanceDetailsContainerDiv;
var multiGroupInstanceDetailsContainerDiv;

// IDs for inputs whose value will be updated when selection changes
var singleGroupNameInputID = 'singleGroupNameInput';
var singleGroupInstanceNameInputID = 'singleGroupInstanceNameInput';
var singleGroupInstancePosXInputID = 'singleGroupInstancePosXInput';
var singleGroupInstancePosYInputID = 'singleGroupInstancePosYInput';
var singleGroupInstancePosZInputID = 'singleGroupInstancePosZInput';
var multiGroupInstanceNameInputID = 'multiGroupInstanceNameInput';

// a flag to display work-in-progress features
var displayWIP = false;

// rename a Group family
PropertiesPlus.submitGroupRename = function()
{
    var args = {
    "singleGroupRename": singleGroupNameInput.value
    }

    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS engine process and the FormIt process.
    window.FormItInterface.CallMethod("PropertiesPlus.renameGroup", args);
}

// rename a single selected Group instance, or multiple instances
PropertiesPlus.submitGroupInstanceRename = function()
{
    var args = {
    "singleGroupInstanceRename": singleGroupInstanceNameInput.value,
    "multiGroupInstanceRename": multiGroupInstanceNameInput.value
    }

    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS engine process and the FormIt process.
    window.FormItInterface.CallMethod("PropertiesPlus.renameGroupInstances", args);
}

// all UI initialization
// must be called from the HTML page
PropertiesPlus.initializeUI = function()
{
    //
    // create the selection count container - this is always visible
    //
    var selectionInfoContainerDiv = document.createElement('div');
    selectionInfoContainerDiv.id = 'selectionInfoContainer';
    selectionInfoContainerDiv.className = 'infoContainer';

    var selectionInfoHeaderDiv = document.createElement('div');
    selectionInfoHeaderDiv.id = 'selectionInfoHeaderDiv';
    selectionInfoHeaderDiv.className = 'infoHeader';
    selectionInfoHeaderDiv.innerHTML = 'Selection Count';

    objectCountDiv = document.createElement('div');
    objectCountDiv.className = 'infoList';
    objectCountLabel = "Total objects: ";
    objectCountDiv.innerHTML = objectCountLabel + objectCount;

    objectCountHorizontalRule = document.createElement('hr'); // horizontal line
    objectCountHorizontalRule.className = 'hide';

    window.document.body.appendChild(selectionInfoContainerDiv);
    selectionInfoContainerDiv.appendChild(selectionInfoHeaderDiv);
    selectionInfoContainerDiv.appendChild(objectCountDiv);
    
    // create the specific object counts list - these are hidden until the selection contains them
    selectionInfoContainerDiv.appendChild(objectCountHorizontalRule);

    vertexCountDiv = document.createElement('div');
    vertexCountLabel = "Vertices: ";
    vertexCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(vertexCountDiv);

    edgeCountDiv = document.createElement('div');
    edgeCountLabel = "Edges: ";
    edgeCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(edgeCountDiv);

    faceCountDiv = document.createElement('div');
    faceCountLabel = "Faces: ";
    faceCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(faceCountDiv);

    bodyCountDiv = document.createElement('div');
    bodyCountLabel = "Bodies: ";
    bodyCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(bodyCountDiv);

    meshCountDiv = document.createElement('div');
    meshCountLabel = "Meshes: ";
    meshCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(meshCountDiv);

    groupInstanceCountDiv = document.createElement('div');
    groupInstanceCountLabel = "Group instances: ";
    groupInstanceCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(groupInstanceCountDiv);

    identicalGroupInstanceCountDiv = document.createElement('div');
    identicalGroupInstanceCountLabel = "Identical instances in model: ";
    identicalGroupInstanceCountLabel.className = 'infoListIndented';
    selectionInfoContainerDiv.appendChild(identicalGroupInstanceCountDiv);

    //
    // create the single group details container - starts hidden
    //
    singleGroupDetailsContainerDiv = document.createElement('div');
    singleGroupDetailsContainerDiv.id = 'singleGroupInfoContainer';
    singleGroupDetailsContainerDiv.className = 'hide';

    var singleGroupDetailsHeaderDiv = document.createElement('div');
    singleGroupDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    singleGroupDetailsHeaderDiv.className = 'infoHeader';
    singleGroupDetailsHeaderDiv.innerHTML = 'Group Details';

    window.document.body.appendChild(singleGroupDetailsContainerDiv);
    singleGroupDetailsContainerDiv.appendChild(singleGroupDetailsHeaderDiv);

    // rename module
    var singleGroupNameContainer = FormIt.PluginUI.createTextInputModule(singleGroupDetailsContainerDiv, 'Name: ', 'singleGroupNameContainer', 'inputModuleContainer', singleGroupNameInputID, PropertiesPlus.submitGroupRename);

    //
    // create the single group instance details container - starts hidden
    //
    singleGroupInstanceDetailsContainerDiv = document.createElement('div');
    singleGroupInstanceDetailsContainerDiv.id = 'singleGroupInfoContainer';
    singleGroupInstanceDetailsContainerDiv.className = 'hide';

    var singleGroupInstanceDetailsHeaderDiv = document.createElement('div');
    singleGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    singleGroupInstanceDetailsHeaderDiv.className = 'infoHeader';
    singleGroupInstanceDetailsHeaderDiv.innerHTML = 'Group Instance Details';

    window.document.body.appendChild(singleGroupInstanceDetailsContainerDiv);
    singleGroupInstanceDetailsContainerDiv.appendChild(singleGroupInstanceDetailsHeaderDiv);

    // rename module
    var singleGroupInstanceNameContainer = FormIt.PluginUI.createTextInputModule(singleGroupInstanceDetailsContainerDiv, 'Name: ', 'singleGroupInstanceNameContainer', 'inputModuleContainer', singleGroupInstanceNameInputID, PropertiesPlus.submitGroupInstanceRename);

    // this is a work in progress
    if (displayWIP)
    {
        // spacer
        var spacerDiv2 = document.createElement('div');
        spacerDiv2.className = 'horizontalSpacer';

        // position modules
        var positionCoordinatesContainerDiv = FormIt.PluginUI.createHorizontalModuleContainer(singleGroupInstanceDetailsContainerDiv);

        var positionCoordinatesXModule = FormIt.PluginUI.createTextInputModule(positionCoordinatesContainerDiv, 'Position X: ', 'positionCoordinatesX', 'inputModuleContainer', singleGroupInstancePosXInputID, PropertiesPlus.submitGroupInstanceRename);

        var positionCoordinatesYModule = FormIt.PluginUI.createTextInputModule(positionCoordinatesContainerDiv, 'Position Y: ', 'positionCoordinatesY', 'inputModuleContainer', singleGroupInstancePosYInputID, PropertiesPlus.submitGroupInstanceRename);

        var positionCoordinatesZModule = FormIt.PluginUI.createTextInputModule(positionCoordinatesContainerDiv, 'Position Z: ', 'positionCoordinatesZ', 'inputModuleContainer', singleGroupInstancePosZInputID, PropertiesPlus.submitGroupInstanceRename);
    }


    //
    // create the multi-group details container - starts hidden
    //
    multiGroupInstanceDetailsContainerDiv = document.createElement('div');
    multiGroupInstanceDetailsContainerDiv.id = 'multiGroupInfoContainer';
    multiGroupInstanceDetailsContainerDiv.className = 'hide';

    var multiGroupInstanceDetailsHeaderDiv = document.createElement('div');
    multiGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    multiGroupInstanceDetailsHeaderDiv.className = 'infoHeader';
    multiGroupInstanceDetailsHeaderDiv.innerHTML = 'Multi Group Instance Details';

    window.document.body.appendChild(multiGroupInstanceDetailsContainerDiv);
    multiGroupInstanceDetailsContainerDiv.appendChild(multiGroupInstanceDetailsHeaderDiv);

    // rename module
    var multiGroupInstanceNameContainer = FormIt.PluginUI.createTextInputModule(multiGroupInstanceDetailsContainerDiv, 'Name: ', 'multiGroupInstanceNameContainer', 'inputModuleContainer', multiGroupInstanceNameInputID, PropertiesPlus.submitGroupInstanceRename);
}



// update the values in the UI based on the current FormIt selection
PropertiesPlus.updateQuantification = function(currentSelectionInfo)
{
    currentSelectionInfo = JSON.parse(currentSelectionInfo);

    // update object count and HTML
    objectCount = currentSelectionInfo.selectedObjectsIDArray.length;
    objectCountDiv.innerHTML = objectCountLabel + objectCount;

    //
    // set flags based on selection
    //

    // if mulitple objects are selected, set a flag
    if (objectCount > 0)
    {
        isMultipleObjects = true;
    }
    else
    {
        isMultipleObjects = false;
    }

    // if one or more vertices (WSM object #8) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 8)
        {
            //console.log("At least one vertex is selected.");
            isOneOrMoreVertices = true;
            break;
        }
        else
        {
            isOneOrMoreVertices = false;
        }
    }

    // if one or more edges (WSM object #7) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 7)
        {
            //console.log("At least one edge is selected.");
            isOneOrMoreEdges = true;
            break;
        }
        else
        {
            isOneOrMoreEdges = false;
        }
    }

    // if one or more faces (WSM object #4) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 4)
        {
            //console.log("At least one face is selected.");
            isOneOrMoreFaces = true;
            break;
        }
        else
        {
            isOneOrMoreFaces = false;
        }
    }

    // if one or more bodies (WSM object #1) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 1)
        {
            //console.log("At least one body is selected.");
            isOneOrMoreBodies = true;
            break;
        }
        else
        {
            isOneOrMoreBodies = false;
        }
    }

    // if one or more meshes (WSM object #32), lineMeshes (WSM object #33), or pointMeshes (WSM object #34) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 32 || 
            currentSelectionInfo.selectedObjectsTypeArray[i] == 33 ||
            currentSelectionInfo.selectedObjectsTypeArray[i] == 34)
        {
            //console.log("At least one mesh is selected.");
            isOneOrMoreMeshes = true;
            break;
        }
        else
        {
            isOneOrMoreMeshes = false;
        }
    }

    // if there's just one object selected, and it's a Group instance (WSM object #24), set a flag
    if ((currentSelectionInfo.selectedObjectsTypeArray.length == 1) && (currentSelectionInfo.selectedObjectsTypeArray[0] == 24))
    {
        //console.log("Only a single instance selected.");
        isSingleGroupInstanceOnly = true;
    }
    else 
    {
        isSingleGroupInstanceOnly = false;
    }

    // if one or more Group instances (WSM object #24) are selected, set a flag
    for (var i = 0; i < objectCount; i++)
    {
        if (currentSelectionInfo.selectedObjectsTypeArray[i] == 24)
        {
            //console.log("At least one instance is selected.");
            isOneOrMoreGroupInstances = true;
            break;
        }
        else
        {
            isOneOrMoreGroupInstances = false;
        }
    }

    // if multiple Group instances are selected, set a flag
    if (currentSelectionInfo.groupInstanceCount > 1)
    {
        //console.log("At least one instance is selected.");
        isMultipleGroupInstances = true;
    }
    else
    {
        isMultipleGroupInstances = false;
    }

    //
    // update counts or hide UI based on flags 
    //

    // if multiple items, enable HTML
    if (isMultipleObjects)
    {
        objectCountHorizontalRule.className = 'show';
    }

    // if any vertices are selected, enable HTML and update it
    if (isOneOrMoreVertices)
    {
        vertexCountDiv.className = 'infoList';
        vertexCount = currentSelectionInfo.vertexCount;
        vertexCountDiv.innerHTML = vertexCountLabel + vertexCount;
    }
    else 
    {
        vertexCountDiv.className = 'hide';  
    }

    // if any edges are selected, enable HTML and update it
    if (isOneOrMoreEdges)
    {
        edgeCountDiv.className = 'infoList';
        edgeCount = currentSelectionInfo.edgeCount;
        edgeCountDiv.innerHTML = edgeCountLabel + edgeCount;
    }
    else
    {
        edgeCountDiv.className = 'hide'; 
    }

    // if any faces are selected, enable HTML and update it
    if (isOneOrMoreFaces)
    {
        faceCountDiv.className = 'infoList';
        faceCount = currentSelectionInfo.faceCount;
        faceCountDiv.innerHTML = faceCountLabel + faceCount;
    }
    else
    {
        faceCountDiv.className = 'hide';
    }

    // if any bodies are selected, enable HTML and update it
    if (isOneOrMoreBodies)
    {
        bodyCountDiv.className = 'infoList';
        bodyCount = currentSelectionInfo.bodyCount;
        bodyCountDiv.innerHTML = bodyCountLabel + bodyCount;
    }
    else
    {
        bodyCountDiv.className = 'hide';
    }

    // if any meshes are selected, enable HTML and update it
    if (isOneOrMoreMeshes)
    {
        meshCountDiv.className = 'infoList';
        meshCount = currentSelectionInfo.meshCount;
        meshCountDiv.innerHTML = meshCountLabel + meshCount;
    }
    else
    {
        meshCountDiv.className = 'hide';
    }

    // if any instances are selected, enable HTML and update it
    if (isOneOrMoreGroupInstances)
    {
        groupInstanceCountDiv.className = 'infoList';
        groupInstanceCount = currentSelectionInfo.groupInstanceCount;
        groupInstanceCountDiv.innerHTML = groupInstanceCountLabel + groupInstanceCount;
    }
    else
    {
        groupInstanceCountDiv.className = 'hide';
    }

    // if a single instance is selected, enable HTML and update it
    if (isSingleGroupInstanceOnly)
    {
        identicalGroupInstanceCountDiv.className = 'infoListIndented';
        identicalGroupInstanceCount = currentSelectionInfo.identicalGroupInstanceCount;
        identicalGroupInstanceCountDiv.innerHTML = identicalGroupInstanceCountLabel + identicalGroupInstanceCount;

        singleGroupDetailsContainerDiv.className = 'infoContainer';

        singleGroupInstanceDetailsContainerDiv.className = 'infoContainer';

        var groupInstanceName = currentSelectionInfo.selectedObjectsNameArray[0];
        var singleGroupInstanceNameInput = document.getElementById(singleGroupInstanceNameInputID);
        singleGroupInstanceNameInput.value = groupInstanceName;

        var groupName = currentSelectionInfo.selectedObjectsGroupFamilyNameArray[0];
        var singleGroupNameInput = document.getElementById(singleGroupNameInputID);
        singleGroupNameInput.value = groupName;
    }
    else
    {
        singleGroupDetailsContainerDiv.className = 'hide';
        singleGroupInstanceDetailsContainerDiv.className = 'hide';
    }

    // if multiple group instances are selected, enable HTML and update it
    if (isMultipleGroupInstances)
    {
        multiGroupInstanceDetailsContainerDiv.className = 'infoContainer';

        // if all of the instance names are consistent, display the common name as placeholder text
        if (currentSelectionInfo.isConsistentGroupInstanceNames == true)
        {
            var groupInstanceName = currentSelectionInfo.groupInstanceNameArray[0];
            multiGroupInstanceNameInput.value = groupInstanceName;
        }
        // otherwise indicate that the names vary
        else 
        {
            var groupInstanceName = "*varies*";
            multiGroupInstanceNameInput.setAttribute("placeholder", groupInstanceName);
            multiGroupInstanceNameInput.value = '';
        }
    }
    else
    {
        multiGroupInstanceDetailsContainerDiv.className = 'hide'; 
    }
    
    // hide elements that shouldn't display with no selection
    if (objectCount === 0)
    {
        objectCountHorizontalRule.className = 'hide';
        vertexCountDiv.className = 'hide';
        edgeCountDiv.className = 'hide';
        faceCountDiv.className = 'hide';
        bodyCountDiv.className = 'hide';
        meshCountDiv.className = 'hide';
        groupInstanceCountDiv.className = 'hide';
        identicalGroupInstanceCountDiv.className = 'hide';
        singleGroupInstanceDetailsContainerDiv.className = 'hide';
        multiGroupInstanceDetailsContainerDiv.className = 'hide';
    }

    // hide elements that shouldn't display with more than one object in the selection
    if (objectCount > 1)
    {
        singleGroupInstanceDetailsContainerDiv.className = 'hide'; 
        identicalGroupInstanceCountDiv.className = 'hide';
    }
    
    // hide elements that shouldn't display with just 1 object in the selection
    if (objectCount == 1)
    {
        multiGroupInstanceDetailsContainerDiv.className = 'hide'; 
    }
}

// UpdateUI runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
PropertiesPlus.updateUI = function()
{
    var args = {
    //"calcVolume": document.a.calcVolume.checked
    }

    //console.log("PropertiesPlus.UpdateUI");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    FormItInterface.CallMethod("PropertiesPlus.GetSelectionInfo", args, function(result)
    {
        //FormItInterface.ConsoleLog("Result " + result);
        PropertiesPlus.updateQuantification(result);
    });
}
