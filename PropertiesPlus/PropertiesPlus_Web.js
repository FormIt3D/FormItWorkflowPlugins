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
var groupFamilyCount = 0;
var groupInstanceCount = 0;
var identicalGroupInstanceCount = 0;
var meshCount = 0;

var isAnythingSelected = false;
var isOneOrMoreVertices = false;
var isOneOrMoreEdges = false;
var isOneOrMoreFaces = false;
var isOneOrMoreBodies = false;
var isOneOrMoreMeshes = false;
var isSingleGroupInstance = false;
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
var meshCountDiv;
var meshCountLabel;
var groupInstanceCountDiv;
var groupInstanceCountLabel;

var singleGroupFamilyDetailsContainerDiv;
var singleGroupInstanceDetailsContainerDiv;
var multiGroupInstanceDetailsContainerDiv;

// IDs for inputs whose value will be updated when selection changes
var singleGroupFamilyNameInputID = 'singleGroupFamilyNameInput';
var singleGroupInstanceNameInputID = 'singleGroupInstanceNameInput';
var singleGroupInstancePosXInputID = 'singleGroupInstancePosXInput';
var singleGroupInstancePosYInputID = 'singleGroupInstancePosYInput';
var singleGroupInstancePosZInputID = 'singleGroupInstancePosZInput';
var multiGroupFamilyNameInputID = 'multiGroupFamilyNameInput';
var multiGroupInstanceNameInputID = 'multiGroupInstanceNameInput';

// a flag to display work-in-progress features
var displayWIP = false;

// rename a Group family
PropertiesPlus.submitGroupFamilyRename = function()
{
    var args = {
    "singleGroupFamilyRename": singleGroupFamilyNameInput.value,
    "multiGroupFamilyRename": multiGroupFamilyNameInput.value
    }

    window.FormItInterface.CallMethod("PropertiesPlus.renameGroupFamilies", args);
}

// rename a single selected Group instance, or multiple instances
PropertiesPlus.submitGroupInstanceRename = function()
{
    var args = {
    "singleGroupInstanceRename": singleGroupInstanceNameInput.value,
    "multiGroupInstanceRename": multiGroupInstanceNameInput.value
    }

    window.FormItInterface.CallMethod("PropertiesPlus.renameGroupInstances", args);
}

// all UI initialization
// must be called from the HTML page
PropertiesPlus.initializeUI = function()
{
    // create an overall container for all objects that comprise the "content" of the plugin
    // everything between the header and footer
    var contentContainer = document.createElement('div');
    contentContainer.id = 'contentContainer';
    contentContainer.className = 'contentContainer'
    window.document.body.appendChild(contentContainer);

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

    contentContainer.appendChild(selectionInfoContainerDiv);
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
    groupInstanceCountLabel = 
    groupInstanceCountDiv.className = 'hide';
    selectionInfoContainerDiv.appendChild(groupInstanceCountDiv);

    //
    // create the single group family details container - starts hidden
    //
    singleGroupFamilyDetailsContainerDiv = document.createElement('div');
    singleGroupFamilyDetailsContainerDiv.id = 'singleGroupInfoContainer';
    singleGroupFamilyDetailsContainerDiv.className = 'hide';

    var singleGroupFamilyDetailsHeaderDiv = document.createElement('div');
    singleGroupFamilyDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    singleGroupFamilyDetailsHeaderDiv.className = 'infoHeader';
    singleGroupFamilyDetailsHeaderDiv.innerHTML = 'Group Family';

    contentContainer.appendChild(singleGroupFamilyDetailsContainerDiv);
    singleGroupFamilyDetailsContainerDiv.appendChild(singleGroupFamilyDetailsHeaderDiv);

    // rename module
    var singleGroupNameContainer = FormIt.PluginUI.createTextInputModule(singleGroupFamilyDetailsContainerDiv, 'Name: ', 'singleGroupNameContainer', 'inputModuleContainer', singleGroupFamilyNameInputID, PropertiesPlus.submitGroupFamilyRename);

    //
    // create the multi group family details container - starts hidden
    //
    multiGroupFamilyDetailsContainerDiv = document.createElement('div');
    multiGroupFamilyDetailsContainerDiv.id = 'multiGroupInfoContainer';
    multiGroupFamilyDetailsContainerDiv.className = 'hide';

    var multiGroupFamilyDetailsHeaderDiv = document.createElement('div');
    multiGroupFamilyDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    multiGroupFamilyDetailsHeaderDiv.className = 'infoHeader';
    multiGroupFamilyDetailsHeaderDiv.innerHTML = 'Multiple Group Families';

    contentContainer.appendChild(multiGroupFamilyDetailsContainerDiv);
    multiGroupFamilyDetailsContainerDiv.appendChild(multiGroupFamilyDetailsHeaderDiv);

    // rename module
    var multiGroupFamilyNameContainer = FormIt.PluginUI.createTextInputModule(multiGroupFamilyDetailsContainerDiv, 'Name: ', 'multiGroupFamilyNameContainer', 'inputModuleContainer', multiGroupFamilyNameInputID, PropertiesPlus.submitGroupFamilyRename);

    //
    // create the single group instance details container - starts hidden
    //
    singleGroupInstanceDetailsContainerDiv = document.createElement('div');
    singleGroupInstanceDetailsContainerDiv.id = 'singleGroupInfoContainer';
    singleGroupInstanceDetailsContainerDiv.className = 'hide';

    var singleGroupInstanceDetailsHeaderDiv = document.createElement('div');
    singleGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    singleGroupInstanceDetailsHeaderDiv.className = 'infoHeader';
    singleGroupInstanceDetailsHeaderDiv.innerHTML = 'Group Instance';

    contentContainer.appendChild(singleGroupInstanceDetailsContainerDiv);
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
    // create the multi group instance details container - starts hidden
    //
    multiGroupInstanceDetailsContainerDiv = document.createElement('div');
    multiGroupInstanceDetailsContainerDiv.id = 'multiGroupInfoContainer';
    multiGroupInstanceDetailsContainerDiv.className = 'hide';

    var multiGroupInstanceDetailsHeaderDiv = document.createElement('div');
    multiGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
    multiGroupInstanceDetailsHeaderDiv.className = 'infoHeader';
    multiGroupInstanceDetailsHeaderDiv.innerHTML = 'Multiple Group Instances';

    contentContainer.appendChild(multiGroupInstanceDetailsContainerDiv);
    multiGroupInstanceDetailsContainerDiv.appendChild(multiGroupInstanceDetailsHeaderDiv);

    // rename module
    var multiGroupInstanceNameContainer = FormIt.PluginUI.createTextInputModule(multiGroupInstanceDetailsContainerDiv, 'Name: ', 'multiGroupInstanceNameContainer', 'inputModuleContainer', multiGroupInstanceNameInputID, PropertiesPlus.submitGroupInstanceRename);

    //
    // create the footer
    //
    FormIt.PluginUI.createFooter();
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

    // if multiple objects are selected, set a flag
    if (objectCount > 0)
    {
        isAnythingSelected = true;
    }
    else
    {
        isAnythingSelected = false;
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

    // if there's just one Group Instance selected, set a flag
    if (currentSelectionInfo.selectedObjectsGroupInstanceIDArray.length == 1)
    {
        //console.log("Only a single instance selected.");
        isSingleGroupInstance = true;
    }
    else 
    {
        isSingleGroupInstance = false;
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
    if (isAnythingSelected)
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
    }
    else
    {
        groupInstanceCountDiv.className = 'hide';
    }

    // if a single instance is selected, enable HTML and update it
    if (isSingleGroupInstance)
    {
        // update the group instance count to also show how many instances are in the model
        groupInstanceCountDiv.className = 'infoList';
        groupInstanceCountDiv.innerHTML = "Groups: " + groupInstanceCount + " Instance (" + currentSelectionInfo.identicalGroupInstanceCount + " in model)";

        // enable the group family and instance info containers
        singleGroupFamilyDetailsContainerDiv.className = 'infoContainer';
        singleGroupInstanceDetailsContainerDiv.className = 'infoContainer';

        var groupInstanceName = currentSelectionInfo.selectedObjectsNameArray[0];
        var singleGroupInstanceNameInput = document.getElementById(singleGroupInstanceNameInputID);
        singleGroupInstanceNameInput.value = groupInstanceName;

        var groupFamilyName = currentSelectionInfo.selectedObjectsGroupFamilyNameArray[0];
        var singleGroupFamilyNameInput = document.getElementById(singleGroupFamilyNameInputID);
        singleGroupFamilyNameInput.value = groupFamilyName;
    }
    else
    {
        singleGroupFamilyDetailsContainerDiv.className = 'hide';
        singleGroupInstanceDetailsContainerDiv.className = 'hide';
    }

    // if multiple group instances are selected, enable HTML and update it
    if (isMultipleGroupInstances)
    {
        // update the group instance count to also show how many unique families the instances belong to
        var uniqueGroupFamilyCount = eliminateDuplicatesInArray(currentSelectionInfo.selectedObjectsGroupFamilyHistoryIDArray).length;
        // change the wording slightly if there is more than one family
        var familyString;
        if (uniqueGroupFamilyCount == 1)
        {
            var familyString = " Family)";
        }
        else
        {
            var familyString = " Families)";
        }
        groupInstanceCountDiv.className = 'infoList';
        groupInstanceCountDiv.innerHTML = "Groups: " + groupInstanceCount + " Instances (" + uniqueGroupFamilyCount + familyString;

        // if the instances come from the same Group family, display the single Group family container and show the name
        if (currentSelectionInfo.isConsistentGroupFamilyNames)
        {
            // hide the multi Group family container, and display the single Group family details container
            multiGroupFamilyDetailsContainerDiv.className = 'hide';
            singleGroupFamilyDetailsContainerDiv.className = 'infoContainer';

            // update the name input with the current name
            var groupFamilyName = currentSelectionInfo.selectedObjectsGroupFamilyNameArray[0];
            var singleGroupFamilyNameInput = document.getElementById(singleGroupFamilyNameInputID);
            singleGroupFamilyNameInput.value = groupFamilyName;
        }
        // otherwise, these instances come from different families, so display the multi Group family container
        else
        {
            // hide the single Group family container, and display the multi Group family details container
            singleGroupFamilyDetailsContainerDiv.className = 'hide';
            multiGroupFamilyDetailsContainerDiv.className = 'infoContainer';

            var groupFamilyName = "*varies*";
            var multiGroupFamilyNameInput = document.getElementById(multiGroupFamilyNameInputID);
            multiGroupFamilyNameInput.setAttribute("placeholder", groupFamilyName);
            multiGroupFamilyNameInput.value = '';
        }

        multiGroupInstanceDetailsContainerDiv.className = 'infoContainer';

        // if all of the instance names are consistent, display the common name as placeholder text
        if (currentSelectionInfo.isConsistentGroupInstanceNames == true)
        {
            var groupInstanceName = currentSelectionInfo.selectedObjectsGroupInstanceNameArray[0];
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
        // hide the multi details containers
        multiGroupFamilyDetailsContainerDiv.className = 'hide';
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
        singleGroupInstanceDetailsContainerDiv.className = 'hide';
        multiGroupInstanceDetailsContainerDiv.className = 'hide';
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
