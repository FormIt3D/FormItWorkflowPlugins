if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.MoveCameras = function(args)
{

var deltaX = args.MoveX;
var deltaY = args.MoveY;
var deltaZ = args.MoveZ;
console.clear();

//Get all scenes
var scenes = FormIt.Scenes.GetScenes();

/*console.log(scenes);
console.log("--------");
console.log(JSON.stringify(scenes));*/

console.log("Number of Scenes: " + scenes.length + '\n');

for (i = 0; i < scenes.length; i++) {

	// Get data for single scene
	var scene = scenes[i];

	// Get camera data
	var camera = scene.camera;

	// Get scene name
	var name = scene.name;

	// Get X value
	var X = camera.posX;

	console.log("--------" + '\n');
	console.log("Scene Name: " + JSON.stringify(name) + '\n');
	console.log("Original X value: " + (JSON.stringify(X)));

	// Add value to X
	X = X + deltaX;
	camera.posX = X;

	console.log("New X value: " + (JSON.stringify(X) + '\n'));

	// Get Y value
	var Y = camera.posY;

	console.log("Original Y value: " + (JSON.stringify(Y)));

	// Add value to Y
	Y = Y + deltaY;
	camera.posY = Y;

	console.log("New Y value: " + (JSON.stringify(Y) + '\n'));

	// Get Z value
	var Z = camera.posZ;

	console.log("Original Z value: " + (JSON.stringify(Z)));

	// Add value to Z
	Z = Z + deltaZ;
	camera.posZ = Z;

	console.log("New Z value: " + (JSON.stringify(Z)));
	console.log('\n' + "--------" + '\n');

	/*console.log(JSON.stringify(camera));*/
	}

	FormIt.Scenes.SetScenes(scenes);
}


// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    "MoveX": parseFloat(document.a.X.value),
    "MoveY": parseFloat(document.a.Y.value),
    "MoveZ": parseFloat(document.a.Z.value)
    }
    console.log("deanstein.MoveCameras");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the MoveCameras function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.MoveCameras", args);
}
