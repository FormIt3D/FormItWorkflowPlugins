if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.ExtractMaterialTextures = function(args)
{
    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));

    if (currentSelection.length < 1)
    {
        console.log("Nothing was selected.");
        return undefined;
    }

    // create an array to store the various texture maps
    var bitmapDataArray = [];

    // if you're not in the Main History, calculate the depth to extract the correct history data
    var historyDepth = (currentSelection[0]["ids"].length) -1;
    console.log("Current history depth: " + historyDepth);

    // get objectID of the current selection
    var nObjectID = currentSelection[0]["ids"][historyDepth]["Object"];
    console.log("Current selection ID: " + nObjectID);

    // get the material ID for the selection
    var selectionMaterialID = WSM.APIGetObjectMaterialReadOnly(nHistoryID, nObjectID);
    console.log("Current selection material ID: " + selectionMaterialID);
    // if the WSM Invalid ID is detected, throw an error and return undefined
    if (selectionMaterialID === 4294967295)
    {
        console.log("This geometry has no Material applied to it.");
        // notifications aren't yet supported in FormIt v16.x
        //FormIt.UI.ShowNotification("This geometry has no Material applied to it.", FormIt.NotificationType.Warning, 0);
        bitmapDataArray.push("undefined", "undefined", "undefined");
        return bitmapDataArray;
    }

    // get the material data for the selection
    var selectionMaterialData = WSM.APIGetMaterialDataReadOnly(nHistoryID, selectionMaterialID);
    console.log("Current selection material data: " + JSON.stringify(selectionMaterialData));

    // define how to get texture bitmap data given the history and texture ID
    function getBitmapDataFromTextureID(nHistoryID, textureID) {

       // get the texture data
       var textureData = WSM.APIGetTextureDataReadOnly(nHistoryID, textureID);
       //console.log("Current selection texture data: " + JSON.stringify(textureData));
       var bitmapData = textureData.bitmap;
       //console.log("bitmap data: " + JSON.stringify(bitmapData));
       return bitmapData;
    }

    // get the texture ID for the material
    var selectionTextureID = selectionMaterialData.nTextureID;
    console.log("Selection textureID: " + selectionTextureID);

    // get the texture data if it exists and push it into the array
    if (selectionTextureID != 4294967295)
    {
        console.log("Texture detected.");

        var textureBitmapData = getBitmapDataFromTextureID(nHistoryID, selectionTextureID);
        // push the texture data into the array
        bitmapDataArray.push(textureBitmapData);
        //console.log("bitmapDataArray: " + bitmapDataArray);

    } else if (selectionTextureID === 4294967295) {

        console.log("No texture detected.");
        bitmapDataArray.push("undefined");
        //console.log("bitmapDataArray: " + bitmapDataArray);
    }

    // check for additional maps
    if (selectionMaterialData.aAdditionalTextures.length != 0) {
        console.log("Additional images detected.");

        // need to check for the specific maps in order
        if (selectionMaterialData.aAdditionalTextures[0].first === "normalMap") {
            console.log("Normal map detected.");

            var normalMapBitmapData = getBitmapDataFromTextureID(nHistoryID, selectionMaterialData.aAdditionalTextures[0].second);

            bitmapDataArray.push(normalMapBitmapData);

            if (selectionMaterialData.aAdditionalTextures[1]) {
                console.log("Opacity map detected.");
    
                var opacityMapBitmapData = getBitmapDataFromTextureID(nHistoryID, selectionMaterialData.aAdditionalTextures[1].second);
    
                bitmapDataArray.push(opacityMapBitmapData);
            } else {
                console.log("No opacity map detected.");
                bitmapDataArray.push("undefined");
            }

        } else {
            console.log("No normal map detected.");
            // add an undefined for the normal map
            bitmapDataArray.push("undefined");

            // if we get here, there must be no normal but an opacity map
            console.log("Opacity map detected.");

            var opacityMapBitmapData = getBitmapDataFromTextureID(nHistoryID, selectionMaterialData.aAdditionalTextures[0].second);

            bitmapDataArray.push(opacityMapBitmapData);
        }

    } else {
        console.log("No additional images detected.");
        // add undefined for the missing maps
        bitmapDataArray.push("undefined", "undefined");
    }

    //console.log(bitmapDataArray);
    return bitmapDataArray;
}
