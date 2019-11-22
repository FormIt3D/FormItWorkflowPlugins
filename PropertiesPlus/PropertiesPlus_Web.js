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
var lineMeshCount = 0;
var pointMeshCount = 0;

var isMultipleObjects = false;
var isOneOrMoreVertices = false;
var isOneOrMoreEdges = false;
var isOneOrMoreFaces = false;
var isOneOrMoreBodies = false;
var isSingleGroupInstanceOnly = false;
var isOneOrMoreGroupInstances = false;
var isMultipleGroupInstances = false;

// define the UI for the general selection container
var selectionInfoContainerDiv = document.createElement('div');
selectionInfoContainerDiv.id = 'selectionInfoContainer';
selectionInfoContainerDiv.className = 'container';

var selectionInfoHeaderDiv = document.createElement('div');
selectionInfoHeaderDiv.id = 'selectionInfoHeaderDiv';
selectionInfoHeaderDiv.className = 'header';
selectionInfoHeaderDiv.innerHTML = 'Selection Information';

var objectCountDiv = document.createElement('div');
objectCountDiv.className = 'list';
var objectCountLabel = "Total objects: ";
objectCountDiv.innerHTML = objectCountLabel + objectCount;

var horizontalRule1 = document.createElement('hr'); // horizontal rule
horizontalRule1.className = 'hide';

// these start hidden until the selection contains them
var vertexCountDiv = document.createElement('div');
var vertexCountLabel = "Vertices: ";
vertexCountDiv.className = 'hide';

var edgeCountDiv = document.createElement('div');
var edgeCountLabel = "Edges: ";
edgeCountDiv.className = 'hide';

var faceCountDiv = document.createElement('div');
var faceCountLabel = "Faces: ";
faceCountDiv.className = 'hide';

var bodyCountDiv = document.createElement('div');
var bodyCountLabel = "Bodies: ";
bodyCountDiv.className = 'hide';

var groupInstanceCountDiv = document.createElement('div');
var groupInstanceCountLabel = "Group instances: ";
groupInstanceCountDiv.className = 'hide';

// define the UI for the single group instance details container
var singleGroupInstanceDetailsContainerDiv = document.createElement('div');
singleGroupInstanceDetailsContainerDiv.id = 'singleGroupInfoContainer';
singleGroupInstanceDetailsContainerDiv.className = 'hide';

var singleGroupInstanceDetailsHeaderDiv = document.createElement('div');
singleGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
singleGroupInstanceDetailsHeaderDiv.className = 'header';
singleGroupInstanceDetailsHeaderDiv.innerHTML = 'Group Instance Details';

var singleGroupInstanceNameContainer = document.createElement('form');
singleGroupInstanceNameContainer.id = 'singleGroupInstanceNameContainer';
singleGroupInstanceNameContainer.className = 'nameAndRenameContainer';

var singleGroupInstanceNameDiv = document.createElement('span');
singleGroupInstanceNameDiv.id = 'singleGroupInstanceNameDiv';
singleGroupInstanceNameDiv.className = 'label';
singleGroupInstanceNameDiv.innerHTML = 'Name: ';

var singleGroupInstanceNameInput = document.createElement('input');
singleGroupInstanceNameInput.id = 'singleGroupInstanceNameInput';
singleGroupInstanceNameInput.className = 'input';
singleGroupInstanceNameInput.setAttribute("type", "text");

var singleGroupInstanceRenameButton = document.createElement('input');
singleGroupInstanceRenameButton.setAttribute("type", "button");
singleGroupInstanceRenameButton.id = 'singleGroupInstanceRenameButton';
singleGroupInstanceRenameButton.value = "Rename";
singleGroupInstanceRenameButton.disabled = true;

singleGroupInstanceNameInput.onkeyup = function()
{
    if (singleGroupInstanceNameInput.value)
    {
        singleGroupInstanceRenameButton.disabled = false;
    }
    else
    {
        singleGroupInstanceRenameButton.disabled = true;
    }
}

var spacerDiv2 = document.createElement('div'); // space
spacerDiv2.className = 'spacer';

var identicalGroupInstanceCountDiv = document.createElement('div');
identicalGroupInstanceCountLabel = "Identical instances in the model: ";
identicalGroupInstanceCountLabel.className = 'list';

// define the UI for the multi group instance details container
var multiGroupInstanceDetailsContainerDiv = document.createElement('div');
multiGroupInstanceDetailsContainerDiv.id = 'multiGroupInfoContainer';
multiGroupInstanceDetailsContainerDiv.className = 'hide';

var multiGroupInstanceDetailsHeaderDiv = document.createElement('div');
multiGroupInstanceDetailsHeaderDiv.id = 'groupInfoHeaderDiv';
multiGroupInstanceDetailsHeaderDiv.className = 'header';
multiGroupInstanceDetailsHeaderDiv.innerHTML = 'Multi Group Instance Details';

var multiGroupInstanceNameContainer = document.createElement('form');
multiGroupInstanceNameContainer.id = 'multiGroupInstanceNameContainer';
multiGroupInstanceNameContainer.className = 'nameAndRenameContainer';

var multiGroupInstanceNameDiv = document.createElement('span');
multiGroupInstanceNameDiv.id = 'instanceNameDiv';
multiGroupInstanceNameDiv.className = 'label';
multiGroupInstanceNameDiv.innerHTML = 'Name: ';

var multiGroupInstanceNameInput = document.createElement('input');
multiGroupInstanceNameInput.className = 'input';
multiGroupInstanceNameInput.setAttribute("type", "text");

var multiGroupInstanceRenameButton = document.createElement('input');
multiGroupInstanceRenameButton.setAttribute("type", "button");
multiGroupInstanceRenameButton.id = 'multiGroupInstanceRenameButton';
multiGroupInstanceRenameButton.value = "Rename All";
multiGroupInstanceRenameButton.disabled = true;

multiGroupInstanceNameInput.onkeyup = function()
{
    if (multiGroupInstanceNameInput.value)
    {
        multiGroupInstanceRenameButton.disabled = false;
    }
    else
    {
        multiGroupInstanceRenameButton.disabled = true;
    }
}


// create the general selection information UI
PropertiesPlus.CreateQuantificationSection = function() 
{
    // these start visible
    window.document.body.appendChild(selectionInfoContainerDiv);
    selectionInfoContainerDiv.appendChild(selectionInfoHeaderDiv);
    selectionInfoContainerDiv.appendChild(objectCountDiv);

    // these start hidden until needed
    selectionInfoContainerDiv.appendChild(horizontalRule1); // horizontal rule
    selectionInfoContainerDiv.appendChild(vertexCountDiv);
    selectionInfoContainerDiv.appendChild(edgeCountDiv);
    selectionInfoContainerDiv.appendChild(faceCountDiv);
    selectionInfoContainerDiv.appendChild(bodyCountDiv);
    selectionInfoContainerDiv.appendChild(groupInstanceCountDiv);
}

// create the single group instance UI
PropertiesPlus.CreateSingleGroupInstanceDetailsSection = function() 
{
    window.document.body.appendChild(singleGroupInstanceDetailsContainerDiv);
    singleGroupInstanceDetailsContainerDiv.appendChild(singleGroupInstanceDetailsHeaderDiv);

    // name and rename
    singleGroupInstanceDetailsContainerDiv.appendChild(singleGroupInstanceNameContainer);
    singleGroupInstanceNameContainer.appendChild(singleGroupInstanceNameDiv);
    singleGroupInstanceNameContainer.appendChild(singleGroupInstanceNameInput);
    singleGroupInstanceNameContainer.appendChild(singleGroupInstanceRenameButton)

    singleGroupInstanceDetailsContainerDiv.appendChild(spacerDiv2); // space
    singleGroupInstanceDetailsContainerDiv.appendChild(identicalGroupInstanceCountDiv);
}

// create the multi group instance UI
PropertiesPlus.CreateMultiGroupInstanceDetailsSection = function() 
{
    window.document.body.appendChild(multiGroupInstanceDetailsContainerDiv);
    multiGroupInstanceDetailsContainerDiv.appendChild(multiGroupInstanceDetailsHeaderDiv);

    // name and rename
    multiGroupInstanceDetailsContainerDiv.appendChild(multiGroupInstanceNameContainer);
    multiGroupInstanceNameContainer.appendChild(multiGroupInstanceNameDiv);
    multiGroupInstanceNameContainer.appendChild(multiGroupInstanceNameInput);
    multiGroupInstanceNameContainer.appendChild(multiGroupInstanceRenameButton);
}


// update the values in the UI based on the current FormIt selection
PropertiesPlus.UpdateQuantification = function(currentSelectionInfo)
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
        horizontalRule1.className = 'show';
    }

    // if any vertices are selected, enable HTML and update it
    if (isOneOrMoreVertices)
    {
        vertexCountDiv.className = 'list';
        vertexCount = currentSelectionInfo.vertexCount;
        vertexCountDiv.innerHTML = vertexCountLabel + vertexCount;
    }

    // if any edges are selected, enable HTML and update it
    if (isOneOrMoreEdges)
    {
        edgeCountDiv.className = 'list';
        edgeCount = currentSelectionInfo.edgeCount;
        edgeCountDiv.innerHTML = edgeCountLabel + edgeCount;
    }

    // if any faces are selected, enable HTML and update it
    if (isOneOrMoreFaces)
    {
        faceCountDiv.className = 'list';
        faceCount = currentSelectionInfo.faceCount;
        faceCountDiv.innerHTML = faceCountLabel + faceCount;
    }

    // if any bodies are selected, enable HTML and update it
    if (isOneOrMoreBodies)
    {
        bodyCountDiv.className = 'list';
        bodyCount = currentSelectionInfo.bodyCount;
        bodyCountDiv.innerHTML = bodyCountLabel + bodyCount;
    }

    // if any instances are selected, enable HTML and update it
    if (isOneOrMoreGroupInstances)
    {
        groupInstanceCountDiv.className = 'list';
        groupInstanceCount = currentSelectionInfo.groupInstanceCount;
        groupInstanceCountDiv.innerHTML = groupInstanceCountLabel + groupInstanceCount;
    }

    // if a single instance is selected, enable HTML and update it
    if (isSingleGroupInstanceOnly)
    {
        singleGroupInstanceDetailsContainerDiv.className = 'container';
        identicalGroupInstanceCountDiv.className = 'show';
        identicalGroupInstanceCount = currentSelectionInfo.identicalGroupInstanceCount;
        identicalGroupInstanceCountDiv.innerHTML = identicalGroupInstanceCountLabel + identicalGroupInstanceCount;

        var name = currentSelectionInfo.selectedObjectsNameArray[0];
        singleGroupInstanceNameInput.setAttribute("placeholder", name);
    }

    // if multiple group instances are selected, enable HTML and update it
    if (isMultipleGroupInstances)
    {
        multiGroupInstanceDetailsContainerDiv.className = 'container';

        // if all of the instance names are consistent, display the common name as placeholder text
        if (currentSelectionInfo.isConsistentGroupInstanceNames == true)
        {
            var name = currentSelectionInfo.groupInstanceNameArray[0];
            multiGroupInstanceNameInput.setAttribute("placeholder", name);
        }
        // otherwise indicate that the names vary
        else 
        {
            var name = "*varies*";
            multiGroupInstanceNameInput.setAttribute("placeholder", name);
        }
    }
    
    // hide elements that shouldn't display with no selection
    if (objectCount === 0)
    {
        horizontalRule1.className = 'hide';
        vertexCountDiv.className = 'hide';
        edgeCountDiv.className = 'hide';
        faceCountDiv.className = 'hide';
        bodyCountDiv.className = 'hide';
        groupInstanceCountDiv.className = 'hide';
        singleGroupInstanceDetailsContainerDiv.className = 'hide';
        multiGroupInstanceDetailsContainerDiv.className = 'hide';
    }

    // hide elements that shouldn't display with more than one object in the selection
    if (objectCount > 1)
    {
        singleGroupInstanceDetailsContainerDiv.className = 'hide'; 
    }
    
    // hide elements that shouldn't display with just 1 object in the selection
    if (objectCount == 1)
    {
        multiGroupInstanceDetailsContainerDiv.className = 'hide'; 
    }
}

// UpdateUI runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
PropertiesPlus.UpdateUI = function()
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
        PropertiesPlus.UpdateQuantification(result);
    });
}

PropertiesPlus.SubmitGroupInstanceRename = function()
{
    var args = {
    "singleGroupInstanceRename": singleGroupInstanceNameInput.value,
    "multiGroupInstanceRename": multiGroupInstanceNameInput.value
    }

    //console.log("PropertiesPlus.UpdateUI");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS engine process and the FormIt process.
    window.FormItInterface.CallMethod("PropertiesPlus.RenameGroupInstances", args);

    // clear the entered value and update the UI again
    singleGroupInstanceNameInput.value = '';
    singleGroupInstanceRenameButton.disabled = true;

    multiGroupInstanceNameInput.value = '';
    multiGroupInstanceRenameButton.disabled = true;

    PropertiesPlus.UpdateUI();
}

singleGroupInstanceRenameButton.onclick = PropertiesPlus.SubmitGroupInstanceRename;
multiGroupInstanceRenameButton.onclick = PropertiesPlus.SubmitGroupInstanceRename;
