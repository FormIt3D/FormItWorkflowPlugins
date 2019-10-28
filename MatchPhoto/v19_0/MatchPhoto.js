if (typeof MatchPhoto == 'undefined')
{
    MatchPhoto = {};
}

MatchPhoto.CreateCameraOutline = function()
{
	// get info about the current camera
	var currentCamera = FormIt.Cameras.GetCameraData();

	// get the current camera's centerpoint
	var posX = currentCamera.posX;
	var posY = currentCamera.posY;
	var posZ = currentCamera.posZ;

    var point3d = WSM.Geom.Point3d(posX, posY, posZ);

	WSM.APICreateVertex(0, point3d);
	
	console.log(JSON.stringify(currentCamera));
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
    window.FormItInterface.CallMethod("MatchPhoto.CreateCameraOutline", args);
}
