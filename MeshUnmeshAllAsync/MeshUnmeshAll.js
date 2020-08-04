import {FormIt, WSM} from '../../../FormItExamplePlugins/SharedPluginFiles/FormIt.mod.js';

window.FormItWorkflowPlugins = window.FormItWorkflowPlugins || {};

window.FormItWorkflowPlugins.MeshAll = async function()
{
    console.clear();
    console.log("Mesh All Plugin\n");

    // get selection info
    const selectionInfo = await getSelectionInfo();
    const currentSelection = selectionInfo.currentSelection;
    const selectedObjectsIDArray = selectionInfo.selectedObjectsIDArray;
    const numberOfGroupsInSelection = selectionInfo.numberOfGroupsInSelection;
    const nHistoryID = selectionInfo.nHistoryID;
    let reachableHistoriesArray = null;

    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        const message = "Nothing selected for conversion. Select Objects and/or Groups and try again.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }
    else
    {
        await FormIt.UndoManagement.BeginState();

        // keep track of the history IDs that have already been converted and the total amount of instances encountered
        const completedHistoryIdArray = [];
        let totalInstanceHits = 0;

        // for each object in the selection, do something
        for (const selectedObjectID of selectedObjectsIDArray)
        {
            // if this is a group, execute the convert operation in each reachable history
            if (selectedObjectID === WSM.nObjectType.nInstanceType)
            {
                const referenceHistoryId = await WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, selectedObjectID);
                reachableHistoriesArray = await WSM.APIGetAllReachableHistoriesReadOnly(referenceHistoryId, false);

                // in each history, convert objects to meshes
                for (const reachableHistory of reachableHistoriesArray)
                {
                    // if this history has already been converted, skip
                    if ((completedHistoryIdArray.indexOf(reachableHistory) > -1))
                    {
                        continue;
                    }

                    // get all top-level objects and meshes in this history
                    // if they're already meshes, WSM will skip them
                    const objectIdsInThisHistory = await WSM.APIGetAllNonOwnedReadOnly(reachableHistory);

                    // convert all objects to meshes
                    await WSM.APIConvertObjectsToMeshes(reachableHistory, objectIdsInThisHistory);

                    // mark this history as completed in the array
                    completedHistoryIdArray.push(reachableHistory);

                    // determine how many instances will be affected inside this group and add them to the total count
                    totalInstanceHits += await WSM.APIGetAllAggregateTransf3dsReadOnly(reachableHistory, 0).paths.length;
                }
            }
            else 
            {
                // convert everything else to meshes
                //console.log("Converting other Objects found in the selection to Meshes...");
                await WSM.APIConvertObjectsToMeshes(nHistoryID, selectedObjectID);
            }
        }
        await FormIt.UndoManagement.EndState("Mesh All");
    }

    if (!reachableHistoriesArray)
    {
        const message = "Converted selected Objects to Meshes.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
    else 
    {
        const message = "Converted selected Objects to Meshes, including " + numberOfGroupsInSelection + " selected Groups, " + completedHistoryIdArray.length + " unique Group sets, and " + totalInstanceHits + " total instances.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log(message);
    }
}

window.FormItWorkflowPlugins.UnmeshAll = async function()
{
    console.clear();
    console.log("Unmesh All Plugin\n");

    // get selection info
    const selectionInfo = await getSelectionInfo();
    const currentSelection = selectionInfo.currentSelection;
    const selectedObjectsIDArray = currentSelection.selectedObjectsIDArray;
    const numberOfGroupsInSelection = selectionInfo.numberOfGroupsInSelection;
    const nHistoryID = selectionInfo.nHistoryID;
    let reachableHistoriesArray = null;

    // cosine of the angle where edges are considered smooth
    const smoothAngle = 0.866025403784439;
    
    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        const message = "Nothing selected for conversion. Select Meshes and/or Groups and try again.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }
    else
    {
        await FormIt.UndoManagement.BeginState();

        // keep track of the history IDs that have already been converted and the total amount of instances encountered
        const completedHistoryIdArray = [];
        let totalInstanceHits = 0;

        // for each object in the selection, do something
        for (const selectedObjectID of selectedObjectsIDArray)
        {
            // if this is a group, execute the convert operation in each reachable history
            if (selectedObjectID === WSM.nObjectType.nInstanceType)
            {
                const referenceHistoryId = await WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, selectedObjectID);
                const reachableHistoriesArray = await WSM.APIGetAllReachableHistoriesReadOnly(referenceHistoryId, false);

                // in each history, convert meshes to objects
                for (const reachableHistory of reachableHistoriesArray)
                {
                    // if this history has already been converted, skip
                    if ((completedHistoryIdArray.indexOf(reachableHistory) > -1))
                    {
                        // add this to the total instance count
                        totalInstanceHits ++;
                        continue;
                    }

                    // get all top-level objects and meshes in this history
                    // if they're already objects, WSM will skip them
                    const objectIdsInThisHistory = await WSM.APIGetAllNonOwnedReadOnly(reachableHistory);

                    // convert all meshes to objects
                    WSM.APIConvertMeshesToObjects(reachableHistory, objectIdsInThisHistory, smoothAngle);

                    // mark this history as completed in the array
                    completedHistoryIdArray.push(reachableHistory);

                    // determine how many instances will be affected inside this group and add them to the total count
                    totalInstanceHits += await WSM.APIGetAllAggregateTransf3dsReadOnly(reachableHistory, 0).paths.length;
                }
            }
    
            else 
            {
                // convert everything else to objects
                //console.log("Converting other Meshes found in the selection to Objects...");
                await WSM.APIConvertMeshesToObjects(nHistoryID, selectedObjectID, smoothAngle);
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
async function getSelectionInfo()
{    
    const selectedObjectsIDArray = [];
    const selectedObjectsTypeArray = [];
    let numberOfGroupsInSelection = 0;

    // get current history
    const nHistoryID = await FormIt.GroupEdit.GetEditingHistoryID();

    // get current selection
    const currentSelection = await FormIt.Selection.GetSelections();

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

        if (nType == WSM.nObjectType.nInstanceType)
        {
            numberOfGroupsInSelection ++;
        }
        selectedObjectsTypeArray.push(nType);
        //console.log("Object type array: " + selectedObjectsTypeArray);
    }

    return {
        nHistoryID: nHistoryID,
        currentSelection: currentSelection,
        selectedObjectsIDArray: selectedObjectsIDArray,
        selectedObjectsTypeArray: selectedObjectsTypeArray,
        numberOfGroupsInSelection: numberOfGroupsInSelection
    };
}