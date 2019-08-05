if (typeof DSGenerateVertex == 'undefined')
{
    DSGenerateVertex = {};
}

DSGenerateVertex.GenerateVertex = function(args)
{
    console.clear();
    console.log("Generate Vertex");
    FormIt.UndoManagement.BeginState();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    var posX = FormIt.PluginUtils.currentUnits(args.posX);
    var posY = FormIt.PluginUtils.currentUnits(args.posY);
    var posZ = FormIt.PluginUtils.currentUnits(args.posZ);

    var point3d = WSM.Geom.Point3d(posX, posY, posZ);

    WSM.APICreateVertex(nHistoryID, point3d);

    FormIt.UndoManagement.EndState("Generate Vertex Plugin");
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
DSGenerateVertex.Submit = function()
{
    var args = {
    "posX": parseFloat(document.a.X.value),
    "posY": parseFloat(document.a.Y.value),
    "posZ": parseFloat(document.a.Z.value)
    }
    //console.log("DSGenerateVertex.GenerateVertex");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the MoveCameras function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("DSGenerateVertex.GenerateVertex", args);
}
