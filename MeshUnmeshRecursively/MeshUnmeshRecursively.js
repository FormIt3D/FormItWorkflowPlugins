if (typeof FormItWorkflowPlugins == 'undefined')
{
    FormItWorkflowPlugins = {};
}

FormItWorkflowPlugins.MeshRecursively = function()
{
    console.clear();
    console.log("Mesh Group Recursively Plugin");

    FormIt.UndoManagement.BeginState();

    // get selection info
    FormItWorkflowPlugins.getSelectionInfo();
    
    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        console.log("\nSelect something to begin.");
        return;
    }

    else
    {
        // for each object in the selection, do something
        for (var j = 0; j < objectIDArray.length; j++)
        {
            // groups are WSM type 24
            // if this is a group, execute the convert operation in each reachable history
            if (typeArray[j] === 24)
            {
                var reachableHistoriesArray = WSM.APIGetAllReachableHistoriesReadOnly(nHistoryID, false);
                console.log("Reachable histories: " + reachableHistoriesArray);

                // remove the current history from the array
                var targetHistoriesArray = reachableHistoriesArray.slice(1, reachableHistoriesArray.length);
                console.log("Target histories: " + targetHistoriesArray);

                // in each target history, convert objects to meshes
                for (var j = 0; j < targetHistoriesArray.length; j++)
                {
                    // get all the objects in this history
                    // objects are WSM type 1
                    var objectIdsInThisHistory = WSM.APIGetAllObjectsByTypeReadOnly(targetHistoriesArray[j], 1);

                    // convert all objects to meshes
                    WSM.APIConvertObjectsToMeshes(targetHistoriesArray[j], objectIdsInThisHistory);
                    console.log("Converting all Objects in History " + targetHistoriesArray[j] + " to Meshes...");
                }
            }
    
            else 
            {
                // convert everything else to meshes
                console.log("Converting other Objects found in the selection to Meshes...");
                WSM.APIConvertObjectsToMeshes(nHistoryID, objectIDArray[j]);
            }
        }
    }
    FormIt.UndoManagement.EndState("Object to Mesh Recursively");
}

FormItWorkflowPlugins.UnmeshRecursively = function()
{
    console.clear();
    console.log("Unmesh Group Recursively Plugin");

    FormIt.UndoManagement.BeginState();

    // get selection info
    FormItWorkflowPlugins.getSelectionInfo();

    // cosine of the angle where edges are considered smooth
    var smoothAngle = 0.866025403784439;
    
    // if nothing is selected, throw a message and return
    if (currentSelection.length === 0)
    {
        console.log("\nSelect something to begin.");
        return;
    }

    else
    {
        // for each object in the selection, do something
        for (var j = 0; j < objectIDArray.length; j++)
        {
            // groups are WSM type 24
            // if this is a group, execute the convert operation in each reachable history
            if (typeArray[j] === 24)
            {
                var reachableHistoriesArray = WSM.APIGetAllReachableHistoriesReadOnly(nHistoryID, false);
                console.log("Reachable histories: " + reachableHistoriesArray);

                // remove the current history from the array
                var targetHistoriesArray = reachableHistoriesArray.slice(1, reachableHistoriesArray.length);
                console.log("Target histories: " + targetHistoriesArray);

                // in each target history, convert objects to meshes
                for (var j = 0; j < targetHistoriesArray.length; j++)
                {
                    // get all the meshes in this history
                    // meshes are WSM type 32
                    var objectIdsInThisHistory = WSM.APIGetAllObjectsByTypeReadOnly(targetHistoriesArray[j], 32);
                    console.log("Object IDs in this History: " + objectIdsInThisHistory);

                    // convert all objects to meshes
                    WSM.APIConvertMeshesToObjects(targetHistoriesArray[j], objectIdsInThisHistory, smoothAngle);
                    console.log("Converting all Meshes in History " + targetHistoriesArray[j] + " to Objects...");
                }
            }
    
            else 
            {
                // convert everything else to meshes
                console.log("Converting other Objects found in the selection to Meshes...");
                WSM.APIConvertObjectsToMeshes(nHistoryID, objectIDArray[j], smoothAngle);
            }
        }
    }
    FormIt.UndoManagement.EndState("Mesh to Object Recursively");
}

// creates global variables and arrays for determining the items in the selection set
FormItWorkflowPlugins.getSelectionInfo = function()
{    
    objectIDArray = [];
    typeArray = [];

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    currentSelection = FormIt.Selection.GetSelections();
    // console.log("Current selection: " + JSON.stringify(currentSelection));
    //console.log(currentSelection.length);

    // for each object in the selection, get info
    for (var j = 0; j < currentSelection.length; j++)
    {
        // if you're not in the Main History, calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[j]["ids"].length) - 1;

        // get objectID of the current selection, then push the results into an array
        var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
        //console.log("Selection ID: " + nObjectID);
        objectIDArray.push(nObjectID);
        //console.log("ObjectID array: " + objectIDArray);

        // get object type of the current selection, then push the results into an array
        var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
        //console.log("Object type: " + nType);
        typeArray.push(nType);
        //console.log("Object type array: " + typeArray);
    }
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
FormItWorkflowPlugins.SubmitMeshRecursive = function()
{
    var meshRecursiveArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.MeshRecursively", meshRecursiveArgs);
}

FormItWorkflowPlugins.SubmitUnmeshRecursive = function()
{
    var unmeshRecursiveArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.UnmeshRecursively", unmeshRecursiveArgs);
}
