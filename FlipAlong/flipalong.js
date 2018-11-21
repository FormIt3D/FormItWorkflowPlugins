FlipAlongPlugin = {};

// TODO: figure out why combining these into a single function with a direction argument gets the LCS translation wrong

FlipAlongPlugin.ButtonX = function()
{
    FormIt.UndoManagement.BeginState();

    var selections = FormIt.Selection.GetSelections();
    //console.log("Selections: " + JSON.stringify(selections));
    var AABB = WSM.Utils.GetAxisAlignedBoundingBox(selections, WSM.Utils.CoordSystem.HCS);
    //console.log("AABB: " + JSON.stringify(AABB));
    
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    var pt1 = WSM.Geom.Point3d(AABB.upper.x, AABB.lower.y, AABB.lower.z); 
    var pt2 = WSM.Geom.Point3d(AABB.upper.x, AABB.upper.y, AABB.lower.z); 
    var pt3 = WSM.Geom.Point3d(AABB.upper.x, AABB.upper.y, AABB.upper.z); 

    // for each object selected, execute the flip along
    for (var j = 0; j < selections.length; j++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (selections[j]["ids"].length) -1;
        //console.log("Current history depth: " + historyDepth);        

        // get objectID of the current selection
        var nObjectID = selections[j]["ids"][historyDepth]["Object"];
        //console.log("Object ID: " + JSON.stringify(nObjectID));

        // define the translation
        var trans = WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(AABB.upper.x * 2 + (AABB.upper.x - AABB.lower.x) * .1 , 0.0, 0.0) ,
            WSM.Geom.Vector3d(-1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1));

        // copy geometry using the given translation
        WSM.APICopyOrSketchAndTransformObjects(nHistoryID, nHistoryID, nObjectID, trans, 1 /*one copy */, false /*bGroupBodies*/);
    }

    FormIt.UndoManagement.EndState("Flip Along");
    console.log("Flipped " + selections.length + " object(s) around the X axis in History " + nHistoryID);
}
FormIt.Commands.RegisterJSCommand("FlipAlongPlugin.ButtonX");

FlipAlongPlugin.ButtonY = function()
{
    FormIt.UndoManagement.BeginState();

    var selections = FormIt.Selection.GetSelections();
    var AABB = WSM.Utils.GetAxisAlignedBoundingBox(selections, WSM.Utils.CoordSystem.HCS);
    
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    var pt1 = WSM.Geom.Point3d(AABB.lower.x, AABB.upper.y, AABB.lower.z); 
    var pt2 = WSM.Geom.Point3d(AABB.upper.x, AABB.upper.y, AABB.lower.z); 
    var pt3 = WSM.Geom.Point3d(AABB.upper.x, AABB.upper.y, AABB.upper.z); 

    // for each object selected, execute the flip along
    for (var j = 0; j < selections.length; j++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (selections[j]["ids"].length) -1;
        //console.log("Current history depth: " + historyDepth);        

        // get objectID of the current selection
        var nObjectID = selections[j]["ids"][historyDepth]["Object"];
        //console.log("Object ID: " + JSON.stringify(nObjectID));

        // define the translation
        var trans = WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0.0, AABB.upper.y * 2 + (AABB.upper.y - AABB.lower.y) * .1 , 0.0) ,
        WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, -1, 0), WSM.Geom.Vector3d(0, 0, 1));
    
        // copy geometry using the given translation
        WSM.APICopyOrSketchAndTransformObjects(nHistoryID, nHistoryID, nObjectID, trans, 1 /*one copy */, false /*bGroupBodies*/);
        console.log("Flipped " + selections.length + " object(s) around the Y axis in History " + nHistoryID);
    }

    FormIt.UndoManagement.EndState("Flip Along");
}
FormIt.Commands.RegisterJSCommand("FlipAlongPlugin.ButtonY");

FlipAlongPlugin.ButtonZ = function()
{
    FormIt.UndoManagement.BeginState();

    var selections = FormIt.Selection.GetSelections();
    var AABB = WSM.Utils.GetAxisAlignedBoundingBox(selections, WSM.Utils.CoordSystem.HCS);
    
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    var pt1 = WSM.Geom.Point3d(AABB.lower.x, AABB.lower.y, AABB.upper.z); 
    var pt2 = WSM.Geom.Point3d(AABB.upper.x, AABB.lower.y, AABB.upper.z); 
    var pt3 = WSM.Geom.Point3d(AABB.upper.x, AABB.upper.y, AABB.upper.z); 
    
    // for each object selected, execute the flip along
    for (var j = 0; j < selections.length; j++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (selections[j]["ids"].length) -1;
        //console.log("Current history depth: " + historyDepth);        

        // get objectID of the current selection
        var nObjectID = selections[j]["ids"][historyDepth]["Object"];
        //console.log("Object ID: " + JSON.stringify(nObjectID));

        // define the translation
        var trans = WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0.0, 0.0, AABB.upper.z * 2 + (AABB.upper.z - AABB.lower.z) * .1) ,
        WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, -1));

        // copy geometry using the given translation
        WSM.APICopyOrSketchAndTransformObjects(nHistoryID, nHistoryID, nObjectID, trans, 1 /*one copy */, false /*bGroupBodies*/);
    }

    FormIt.UndoManagement.EndState("Flip Along");
    console.log("Flipped " + selections.length + " object(s) around the Z axis in History " + nHistoryID);
}
FormIt.Commands.RegisterJSCommand("FlipAlongPlugin.ButtonZ");
