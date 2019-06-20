if (typeof FormItWorkflowPlugins == 'undefined')
{
    FormItWorkflowPlugins = {};
}

FormItWorkflowPlugins.MeshAll = function()
{
    console.clear();
    console.log("Mesh All Plugin\n");

    // get selection info
    FormItWorkflowPlugins.getSelectionInfo();
    
    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        var message = "Nothing selected for conversion. Select Objects and/or Groups and try again.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }
    else
    {
        FormIt.UndoManagement.BeginState();

        // keep track of the history IDs that have already been converted and the total amount of instances encountered
        var completedHistoryIdArray = [];
        var totalInstanceHits = 0;

        // for each object in the selection, do something
        for (var j = 0; j < selectedObjectsIDArray.length; j++)
        {
            // if this is a group, execute the convert operation in each reachable history
            if (selectedObjectsTypeArray[j] === WSM.nInstanceType)
            {
                var referenceHistoryId = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, selectedObjectsIDArray[j]);
                //console.log("Reference history for this Group: " + referenceHistoryId);
                
                var reachableHistoriesArray = WSM.APIGetAllReachableHistoriesReadOnly(referenceHistoryId, false);
                //console.log("Reachable histories from this Group: " + reachableHistoriesArray);

                // in each history, convert objects to meshes
                for (var k = 0; k < reachableHistoriesArray.length; k++)
                {
                    // if this history has already been converted, skip
                    if ((completedHistoryIdArray.indexOf(reachableHistoriesArray[k]) > -1))
                    {
                        //console.log("Skipping history: " + reachableHistoriesArray[k]);
                        continue;
                    }

                    // get all top-level objects and meshes in this history
                    // if they're already meshes, WSM will skip them
                    var objectIdsInThisHistory = WSM.APIGetAllNonOwnedReadOnly(reachableHistoriesArray[k]);

                    // convert all objects to meshes
                    WSM.APIConvertObjectsToMeshes(reachableHistoriesArray[k], objectIdsInThisHistory);
                    //console.log("Converting all Objects in History " + reachableHistoriesArray[j] + " to Meshes...");

                    // mark this history as completed in the array
                    completedHistoryIdArray.push(reachableHistoriesArray[k]);

                    // determine how many instances will be affected inside this group and add them to the total count
                    totalInstanceHits += WSM.APIGetAllAggregateTransf3dsReadOnly(reachableHistoriesArray[k], 0).paths.length;
                }
            }
            else 
            {
                // convert everything else to meshes
                //console.log("Converting other Objects found in the selection to Meshes...");
                WSM.APIConvertObjectsToMeshes(nHistoryID, selectedObjectsIDArray[j]);
            }
        }
        FormIt.UndoManagement.EndState("Mesh All");
    }

    if (!reachableHistoriesArray)
    {
        var message = "Converted selected Objects to Meshes.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
    else 
    {
        var message = "Converted selected Objects to Meshes, including " + numberOfGroupsInSelection + " selected Groups, " + completedHistoryIdArray.length + " unique Group sets, and " + totalInstanceHits + " total instances.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
}

FormItWorkflowPlugins.UnmeshAll = function()
{
    console.clear();
    console.log("Unmesh All Plugin\n");

    // get selection info
    FormItWorkflowPlugins.getSelectionInfo();

    // cosine of the angle where edges are considered smooth
    var smoothAngle = 0.866025403784439;
    
    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        var message = "Nothing selected for conversion. Select Meshes and/or Groups and try again.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }
    else
    {
        FormIt.UndoManagement.BeginState();

        // keep track of the history IDs that have already been converted and the total amount of instances encountered
        var completedHistoryIdArray = [];
        var totalInstanceHits = 0;

        // for each object in the selection, do something
        for (var j = 0; j < selectedObjectsIDArray.length; j++)
        {
            // if this is a group, execute the convert operation in each reachable history
            if (selectedObjectsTypeArray[j] === WSM.nInstanceType)
            {
                var referenceHistoryId = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, selectedObjectsIDArray[j]);
                //console.log("Reference history for this Group: " + referenceHistoryId);
                
                var reachableHistoriesArray = WSM.APIGetAllReachableHistoriesReadOnly(referenceHistoryId, false);
                //console.log("Reachable histories from this Group: " + reachableHistoriesArray);

                // in each history, convert meshes to objects
                for (var k = 0; k < reachableHistoriesArray.length; k++)
                {
                    // if this history has already been converted, skip
                    if ((completedHistoryIdArray.indexOf(reachableHistoriesArray[k]) > -1))
                    {
                        //console.log("Skipping history: " + reachableHistoriesArray[k]);
                        
                        // add this to the total instance count
                        totalInstanceHits ++;
                        continue;
                    }

                    // get all top-level objects and meshes in this history
                    // if they're already objects, WSM will skip them
                    var objectIdsInThisHistory = WSM.APIGetAllNonOwnedReadOnly(reachableHistoriesArray[k]);

                    // convert all meshes to objects
                    WSM.APIConvertMeshesToObjects(reachableHistoriesArray[k], objectIdsInThisHistory, smoothAngle);
                    //console.log("Converting all Meshes in History " + reachableHistoriesArray[j] + " to Objects...");

                    // mark this history as completed in the array
                    completedHistoryIdArray.push(reachableHistoriesArray[k]);

                    // determine how many instances will be affected inside this group and add them to the total count
                    totalInstanceHits += WSM.APIGetAllAggregateTransf3dsReadOnly(reachableHistoriesArray[k], 0).paths.length;
                }
            }
    
            else 
            {
                // convert everything else to objects
                //console.log("Converting other Meshes found in the selection to Objects...");
                WSM.APIConvertMeshesToObjects(nHistoryID, selectedObjectsIDArray[j], smoothAngle);
            }
        }
        FormIt.UndoManagement.EndState("Unmesh All");
    }

    if (!reachableHistoriesArray)
    {
        var message = "Converted selected Meshes to Objects.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
    else 
    {
        var message = "Converted selected Meshes to Objects, including " + numberOfGroupsInSelection + " selected Groups, " + completedHistoryIdArray.length + " unique Group sets, and " + totalInstanceHits + " total instances."
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
}

// creates global variables and arrays for determining the items in the selection set
FormItWorkflowPlugins.getSelectionInfo = function()
{    
    selectedObjectsIDArray = [];
    selectedObjectsTypeArray = [];
    numberOfGroupsInSelection = 0;

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));
    //console.log("Current selection length: " + currentSelection.length);

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
        var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
        //console.log("Object type: " + nType);

        if (nType == WSM.nInstanceType)
        {
            numberOfGroupsInSelection ++;
        }
        selectedObjectsTypeArray.push(nType);
        //console.log("Object type array: " + selectedObjectsTypeArray);
    }
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
FormItWorkflowPlugins.SubmitMeshAll = function()
{
    var meshAllArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.MeshAll", meshAllArgs);
}

FormItWorkflowPlugins.SubmitUnmeshAll = function()
{
    var unmeshAllArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.UnmeshAll", unmeshAllArgs);
}
