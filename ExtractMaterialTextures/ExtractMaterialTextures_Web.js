if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.PlaceholderImage = function()
{
    console.log("Creating placeholder image");
    // create a placeholder image
    var img = document.createElement('img');
    img.id = 'image';
    window.document.body.appendChild(img);
    img.src = 'img/placeholder.png';
};

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    //"radius": parseFloat(document.a.radius.value),
    //"cleanup": document.a.cleanup.checked
    }

    console.log("deanstein.ExtractMaterialTextures");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.ExtractMaterialTextures", args);
    FormItInterface.CallMethod("deanstein.ExtractMaterialTextures", args,
        function(bitmapData)
        {
            var img = document.getElementById('image');
            if (bitmapData === "undefined")
            {
                img.src = 'img/notexture.png';
            } else {
                //debugger;
                var evalBitmapData = eval(bitmapData);
                var data = new Uint8Array(evalBitmapData);
                var blob = new Blob([data], {type: 'image/bmp'});
                var imgURL = URL.createObjectURL(blob);
                img.src = imgURL;
            }

        });
}
