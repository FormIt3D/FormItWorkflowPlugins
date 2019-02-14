CutHoles = {};

CutHoles.GlueToSurface = function()
{
    var value = {};
    value.GlueToSurface = true;
    // Apply the FormIt::PlacementOptions attribute to the component
    var currentHistory = FormIt.Model.GetHistoryID();
    WSM.Utils.SetOrCreateStringAttributeForObject(currentHistory,
        WSM.INVALID_ID, "FormIt::PlacementOptions", JSON.stringify(value));
}
FormIt.Commands.RegisterJSCommand("CutHoles.GlueToSurface");

// MakeCuttingObject marks selection to be the cutting object(s) and sets the layer to CutHoles.CutHole and
// applies the CutHoles.CutHole attribute.
// An instance (1) should be selected.
CutHoles.MakeCuttingObject = function()
{
    var selections = FormIt.Selection.GetSelections();
    if (selections.length == 1)
    {
        var selection = selections[0];
        if (WSM.Utils.IsObjectType(selection, [WSM.nInstanceType]))
        {
            var finalObjectHistoryID = WSM.GroupInstancePath.GetFinalObjectHistoryID(selection);
            var nRefHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(finalObjectHistoryID.History, finalObjectHistoryID.Object);
            var editingHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
            // Apply the CutHoles.CutHole attribute to the instance's ref History
            WSM.Utils.SetOrCreateStringAttributeForObject(nRefHistoryID, WSM.INVALID_ID, "CutHoles.CutHole", "");
            // TODO: Add FormIt::PlacementOptions GlueToSurface:true
            var allObjs = WSM.APIGetAllNonOwnedReadOnly(editingHistoryID);
            var layerID = WSM.INVALID_ID;
            // Get the existing layer ID.
            for (var j = 0; j < allObjs.length; ++j)
            {
                if (WSM.Utils.IsObjectType(WSM.ObjectHistoryID(editingHistoryID, allObjs[j]), [WSM.nLayerType]))
                {
                    var layerData = WSM.APIGetLayerDataReadOnly(editingHistoryID, allObjs[j]);
                    if (layerData.name == "CutHoles.CutHole")
                    {
                        layerID = allObjs[j];
                    }
                }
            }
            if (layerID === WSM.INVALID_ID)
            {
                layerID = WSM.APICreateLayer(editingHistoryID, "CutHoles.CutHole", true /*bDisplayed*/);
            }

            // Set the Layer for the instance
            WSM.APIAddObjectsLayers(editingHistoryID, [layerID], selection);
        }
    }
}
FormIt.Commands.RegisterJSCommand("CutHoles.MakeCuttingObject");

CutHoles.CutHoles = function()
{
    var currentHistory = FormIt.Model.GetHistoryID();
    var allHistorys = WSM.APIGetAllReachableHistoriesReadOnly(currentHistory, false);
    console.log("allHistorys: " + JSON.stringify(allHistorys));
    var cuttingHistorys = [];
    for (var i = 0; i < allHistorys.length; ++i)
    {
        var cuttingHistory = allHistorys[i];
        console.log("testing for cutting History: " + cuttingHistory);
        var attrib = WSM.Utils.GetStringAttributeForObject(cuttingHistory, WSM.INVALID_ID, "CutHoles.CutHole");
        //console.log(JSON.stringify(attrib));
        if(attrib.success)
        {
            cuttingHistorys.push(cuttingHistory);
        }
    }
    console.log("cuttingHistorys: " + JSON.stringify(cuttingHistorys));
    var instances = [];
    for (var j = 0; j < cuttingHistorys.length; ++j)
    {
        var cuttingHistory = cuttingHistorys[j];
        console.log("Getting Instances for History: " + cuttingHistory);
        var instanceAggregate = WSM.APIGetAllAggregateTransf3dsReadOnly(cuttingHistory, currentHistory);
        instances.push.apply(instances, instanceAggregate.paths);
    }
    console.log("instances: " + JSON.stringify(instances));
    var allObjs = WSM.APIGetAllNonOwnedReadOnly(currentHistory);
    // Get the list of tools.
    var tools = [];
    for (var i = 0; i < instances.length; ++i)
    {
        var instance = instances[i];
        console.log("instance: " + JSON.stringify(instance));
        var finalObjectHistoryID = WSM.GroupInstancePath.GetFinalObjectHistoryID(instance);
        console.log("finalObjectHistoryID: " + JSON.stringify(finalObjectHistoryID));
        var nRefHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(finalObjectHistoryID.History, finalObjectHistoryID.Object);
        var allObjs = WSM.APIGetAllNonOwnedReadOnly(nRefHistoryID);
        for (var j = 0; j < allObjs.length; ++j)
        {
            var path = WSM.GroupInstancePath.AppendObjectHistoryID(instance, WSM.ObjectHistoryID(nRefHistoryID, allObjs[j]));
            if (WSM.Utils.IsObjectType(path, [WSM.nBodyType]))
            {
                tools.push(path);
            }
        }
    }
    console.log("tools: " + JSON.stringify(tools));
    for (var i = 0; i < allObjs.length; ++i)
    {
        var blank = WSM.ObjectHistoryID(currentHistory, allObjs[i]);
        console.log("blank: " + JSON.stringify(blank));
        WSM.APISubtractNonDestructive(blank, tools);
    }
}
FormIt.Commands.RegisterJSCommand("CutHoles.CutHoles");
