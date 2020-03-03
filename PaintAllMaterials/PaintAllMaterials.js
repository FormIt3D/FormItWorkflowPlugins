if (typeof FormItWorkflowPlugins == 'undefined')
{
    FormItWorkflowPlugins = {};
}

FormItWorkflowPlugins.PaintAllMaterials = function()
{
    console.clear();
    console.log("Paint All Materials Plugin\n");
    
    FormIt.UndoManagement.BeginState();

    // get all the materials in this sketch
    var materialIDs = FormIt.MaterialProvider.GetMaterials(FormIt.LibraryType.SKETCH);
    console.log(JSON.stringify(materialIDs));

    // the current history
    var currentHistoryID = FormIt.GroupEdit.GetEditingHistoryID();

    // block size
    var blockSize = 12;

    // spacing between blocks
    var blockSpacing = 12;

    // create a Group to contain all the blocks
    var blockContainerGroupID = WSM.APICreateGroup(currentHistoryID, []);
    //console.log("Created a new group for a typical bulb: " + typicalBulbGroupID);

    // create a new history for the block container group
    var blockContainerHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(currentHistoryID, blockContainerGroupID);

    // for each Material, create a block and paint it with the Material ID
    for (var i = 0; i < materialIDs.length; i++)
    {
        var pt1 = WSM.Geom.Point3d(i * (blockSize + blockSpacing), 0.0, 0.0);
        var pt2 = WSM.Geom.Point3d(FormIt.PluginUtils.currentUnits(i * (blockSize + blockSpacing) + blockSize),
                                   FormIt.PluginUtils.currentUnits(blockSize),
                                   FormIt.PluginUtils.currentUnits(blockSize));

        // create the block
        var blockID = WSM.APICreateBlock(currentHistoryID, pt1, pt2);

        // paint the block with this material ID
        FormIt.SketchMaterials.AssignMaterialToObjects(materialIDs[i], blockID);
        
        // move the block into the container
        WSM.APICopyOrSketchAndTransformObjects(currentHistoryID, blockContainerHistoryID, blockID, WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0, 0, 0), WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1)), 1, false);

        // delete the original block
        WSM.APIDeleteObject(currentHistoryID, blockID);
    }
    
    FormIt.UndoManagement.EndState("Paint All Materials");

    // indicate the operation has finished
    var message = "Painted " + materialIDs.length + " Materials on geometry.";
    FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
    console.log("\n" + message);
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
FormItWorkflowPlugins.SubmitPaintAll = function()
{
    var paintAllArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.PaintAllMaterials", paintAllArgs);
}
