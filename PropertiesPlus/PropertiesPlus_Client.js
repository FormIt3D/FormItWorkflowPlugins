if (typeof PropertiesPlus == 'undefined')
{
    PropertiesPlus = {};
}

// creates global variables and arrays for determining the items in the selection set
PropertiesPlus.GetSelectionInfo = function()
{    
    console.clear();
    console.log("Properties Plus Plugin\n");

    selectedObjectsIDArray = [];
    selectedObjectsTypeArray = [];

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));
    console.log("Number of objects selected: " + currentSelection.length);

    // for each object in the selection, get info
    for (var j = 0; j < currentSelection.length; j++)
    {
        // if you're not in the Main History, calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[j]["ids"].length) - 1;

        // get objectID of the current selection, then push the results into an array
        var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
        //console.log("Selection ID: " + nObjectID);
        selectedObjectsIDArray.push(nObjectID);
        //console.log("ObjectID array: " + selectedObjectsIDArray);

        // get object type of the current selection, then push the results into an array
        var nType = WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
        //console.log("Object type: " + nType);

        selectedObjectsTypeArray.push(nType);
        //console.log("Object type array: " + selectedObjectsTypeArray);
    }

    // do this stuff only if there is a single Group selected
    if ((selectedObjectsTypeArray.length == 1) && (selectedObjectsTypeArray[0] == 24))
    {
        var totalInstanceCount = 0;
        var referenceHistoryId = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, selectedObjectsIDArray[0]);
        //console.log("Reference history for this Group: " + referenceHistoryId);

        // determine how many total instances of this Group are in the model
        totalInstanceCount += WSM.APIGetAllAggregateTransf3dsReadOnly(referenceHistoryId, 0).paths.length;
        console.log("Number of instances in the entire model: " + totalInstanceCount);
    }
    // return everything we need in a JSON object for use in the web script
    return {
        "currentSelectionInfo" : currentSelection,
        "nHistoryID": nHistoryID,
        "selectedObjectsIDArray" : selectedObjectsIDArray,
        "selectedObjectsTypeArray" : selectedObjectsTypeArray,
        "totalInstanceCount" : totalInstanceCount
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
