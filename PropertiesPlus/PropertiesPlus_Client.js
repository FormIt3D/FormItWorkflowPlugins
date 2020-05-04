if (typeof PropertiesPlus == 'undefined')
{
    PropertiesPlus = {};
}

// this is the history we're operating in
var nHistoryID;

// instantiate arrays
var selectedObjectsIDArray;
var selectedObjectsTypeArray;
var selectedObjectsNameArray;
var selectedObjectsLevelsBoolArray;
var selectedObjectsGroupFamilyIDArray;
var selectedObjectsGroupFamilyHistoryIDArray;
var selectedObjectsGroupFamilyNameArray;
var groupInstanceIDArray;
var groupInstanceNameArray;

// instantiate counts
var vertexCount;
var edgeCount;
var faceCount;
var bodyCount;
var groupCount;
var groupInstanceCount;
var identicalGroupInstanceCount;
var meshCount;

// instantiate booleans
var isConsistentGroupInstanceNames;

// updates variables and arrays about the items in the selection set
PropertiesPlus.GetSelectionInfo = function()
{    
    console.clear();
    console.log("Properties Plus Plugin\n");

    // clear arrays
    selectedObjectsIDArray = [];
    selectedObjectsTypeArray = [];
    selectedObjectsNameArray = [];
    selectedObjectsLevelsBoolArray = [];
    selectedObjectsGroupFamilyIDArray = [];
    selectedObjectsGroupFamilyHistoryIDArray = [];
    selectedObjectsGroupFamilyNameArray = [];
    groupInstanceIDArray = [];
    groupInstanceNameArray = [];

    // clear counts
    vertexCount = 0;
    edgeCount = 0;
    faceCount = 0;
    bodyCount = 0;
    groupCount = 0;
    groupInstanceCount = 0;
    identicalGroupInstanceCount = 0;
    meshCount = 0;

    // clear booleans
    isConsistentGroupInstanceNames = false;

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));
    console.log("Number of objects selected: " + currentSelection.length);

    // for each object in the selection, get info
    for (var i = 0; i < currentSelection.length; i++)
    {
        // if you're not in the Main History, calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[i]["ids"].length) - 1;

        // get objectID of the current selection, then push the results into an array
        var nObjectID = currentSelection[i]["ids"][historyDepth]["Object"];
        //console.log("Selection ID: " + nObjectID);
        selectedObjectsIDArray.push(nObjectID);
        //console.log("ObjectID array: " + selectedObjectsIDArray);

        // get object type of the current selection, then push the results into an array
        var nType = WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
        //console.log("Object type: " + nType);
        selectedObjectsTypeArray.push(nType);
        //console.log("Object type array: " + selectedObjectsTypeArray);

        // get the properties of this object
        var objectProperties = WSM.APIGetObjectPropertiesReadOnly(nHistoryID, nObjectID);
        //console.log("Object properties: " + JSON.stringify(objectProperties));

        // get the name of this object, then push the results into an array
        var objectName = objectProperties.sObjectName;
        selectedObjectsNameArray.push(objectName);
        //console.log("Object name array: " + JSON.stringify(selectedObjectsNameArray));

        // get the Levels setting for this object, then push the results into an array
        var bUseLevels = objectProperties.bReportAreaByLevel;
        selectedObjectsLevelsBoolArray.push(bUseLevels);

        //var bUsesLevels = objectProperties.b

        // get group instance info, if there are any selected, and push the results into arrays
        if (selectedObjectsTypeArray[i] == WSM.nInstanceType)
        {
            // get the Group family ID
            var groupFamilyID = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nGroupType, true)[0];
            selectedObjectsGroupFamilyIDArray.push(groupFamilyID);

            // get the Group family History ID
            var groupFamilyHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, groupFamilyID);
            selectedObjectsGroupFamilyHistoryIDArray.push(groupFamilyHistoryID);

            // get the Group family name
            var groupFamilyName = WSM.APIGetRevitFamilyInformationReadOnly(groupFamilyHistoryID).familyReference;
            // if the Group name is empty, that means it hasn't been customized
            // so use the default Group naming convention: "Group " + "historyID"
            if (groupFamilyName == '')
            {
                groupFamilyName = "Group " + groupFamilyHistoryID;
            }
            selectedObjectsGroupFamilyNameArray.push(groupFamilyName);

            // push the Group instance name and ID into arrays
            groupInstanceNameArray.push(objectName);
            groupInstanceIDArray.push(nObjectID);
        }
    }

    // do this only if there is a single Group instance selected
    if (groupInstanceIDArray.length == 1)
    {
        var referenceHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, groupInstanceIDArray[0]);
        //console.log("Reference history for this Group: " + referenceHistoryID);

        // determine how many total instances of this Group are in the model
        identicalGroupInstanceCount += WSM.APIGetAllAggregateTransf3dsReadOnly(referenceHistoryID, 0).paths.length;
        console.log("Number of instances in model: " + identicalGroupInstanceCount);
    }

    // determine if the instances are all of the same name
    var nameComparisonResultsArray = testForIdentical(groupInstanceNameArray);
    isConsistentGroupInstanceNames = booleanReduce(nameComparisonResultsArray);
    //console.log("Are group instance names consistent? " + isConsistentGroupInstanceNames);

    // fill out arrays for object types in the selection
    for (var i = 0; i < selectedObjectsTypeArray.length; i ++)
    {
        if (selectedObjectsTypeArray[i] === WSM.nVertexType)
        {
            vertexCount ++;
        }

        if (selectedObjectsTypeArray[i] === WSM.nEdgeType)
        {
            edgeCount ++;
        }

        if (selectedObjectsTypeArray[i] === WSM.nFaceType)
        {
            faceCount ++;
        }

        if (selectedObjectsTypeArray[i] === WSM.nBodyType)
        {
            bodyCount ++;
        }

        if (selectedObjectsTypeArray[i] === WSM.nMeshType || 
            selectedObjectsTypeArray[i] === WSM.nLineMeshType ||
            selectedObjectsTypeArray[i] === WSM.nPointMeshType)
        {
            meshCount ++;
        }

        if (selectedObjectsTypeArray[i] === WSM.nInstanceType)
        {
            groupInstanceCount ++;
        }
        
    }

    // return everything we need in a JSON object for use in the web script
    return {
        "currentSelectionInfo" : currentSelection,
        "nHistoryID": nHistoryID,
        "selectedObjectsIDArray" : selectedObjectsIDArray,
        "selectedObjectsTypeArray" : selectedObjectsTypeArray,
        "selectedObjectsNameArray" : selectedObjectsNameArray,
        "selectedObjectsGroupFamilyIDArray" : selectedObjectsGroupFamilyIDArray,
        "selectedObjectsGroupFamilyNameArray" : selectedObjectsGroupFamilyNameArray,
        "vertexCount" : vertexCount,
        "edgeCount" : edgeCount,
        "faceCount" : faceCount,
        "bodyCount" : bodyCount,
        "meshCount" : meshCount,
        "groupInstanceCount" : groupInstanceCount,
        "groupInstanceIDArray" : groupInstanceIDArray,
        "groupInstanceNameArray" : groupInstanceNameArray,
        "identicalGroupInstanceCount" : identicalGroupInstanceCount,
        "isConsistentGroupInstanceNames" : isConsistentGroupInstanceNames
    };
}

PropertiesPlus.CalculateVolume = function()
{
    var totalVolume = [];

    // for each object selected, get the ObjectID and calculate the volume
    for (var j = 0; j < selectedObjectsIDArray.length; j++)
    {
        // calculate the volume of the selection
        var selectedVolume = WSM.APIComputeVolumeReadOnly(nHistoryID, selectedObjectsIDArray[j]);
        console.log("Selected volume: " + JSON.stringify(selectedVolume));

        // add multiple volumes up
        totalVolume.push(selectedVolume);
        console.log("Accumulated volume array: " + JSON.stringify(totalVolume));
    }
}

PropertiesPlus.renameGroup = function(args)
{
    if (groupInstanceIDArray.length == 1)
    {
        // TODO: restore Group category on rename
        WSM.APISetRevitFamilyInformation(selectedObjectsGroupFamilyHistoryIDArray[0], false, false, "", args.singleGroupRename, "", "");
    }
    else
    {
        for (var i = 0; i < groupInstanceIDArray.length; i++)
        {
            // TODO: support multiple Group family rename
            //WSM.APISetObjectProperties(nHistoryID, groupInstanceIDArray[i], args.multiGroupInstanceRename, selectedObjectsLevelsBoolArray[i]);
        }
    }
}

PropertiesPlus.renameGroupInstances = function(args)
{
    if (groupInstanceIDArray.length == 1)
    {
        WSM.APISetObjectProperties(nHistoryID, groupInstanceIDArray[0], args.singleGroupInstanceRename, selectedObjectsLevelsBoolArray[0]);
    }
    else
    {
        for (var i = 0; i < groupInstanceIDArray.length; i++)
        {
            WSM.APISetObjectProperties(nHistoryID, groupInstanceIDArray[i], args.multiGroupInstanceRename, selectedObjectsLevelsBoolArray[i]);
        }
    }
}
