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
        return undefined;
    }

    // get the material data for the selection
    var selectionMaterialData = WSM.APIGetMaterialDataReadOnly(nHistoryID, selectionMaterialID);
    console.log("Current selection material data: " + JSON.stringify(selectionMaterialData));

    // get the texture ID for the material
    var selectionTextureID = selectionMaterialData.nTextureID;
    console.log("Selection textureID: " + selectionTextureID);
    // if the WSM Invalid ID is detected, throw an error and return undefined
    if (selectionTextureID === 4294967295)
    {
        console.log("This Material has no texture associated with it.");
        return undefined;
    }

    // get the texture data
    var textureData = WSM.APIGetTextureDataReadOnly(nHistoryID, selectionTextureID);
    //console.log("Current selection texture data: " + JSON.stringify(textureData));

    var bitmapData = textureData.bitmap;
    //console.log("bitmap data: " + JSON.stringify(bitmapData));

    return bitmapData;
}
