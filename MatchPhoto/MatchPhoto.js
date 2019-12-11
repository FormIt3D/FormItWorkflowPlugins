if (typeof MatchPhoto == 'undefined')
{
    MatchPhoto = {};
}

// the code that was here has been moved to ManageSceneCameras
// will revisit Match Photo once we restructure plugin files to share functions between them

MatchPhoto.execute = function()
{
    console.clear();
    console.log("Match Photo plugin\n");

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
MatchPhoto.Submit = function()
{
    var args = {
    //"MoveX": parseFloat(document.a.X.value),
    //"MoveY": parseFloat(document.a.Y.value)
    }
    //console.log("deanstein.MatchPhoto");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the MoveCameras function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("MatchPhoto.execute", args);
}
