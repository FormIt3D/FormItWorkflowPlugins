if (typeof PropertiesPlus == 'undefined')
{
    PropertiesPlus = {};
}

// instantiate the items we want to count
var objectCount = 0;

var isSingleGroup = false;
var groupInstanceCount = 0;

// create the general selection information UI
PropertiesPlus.CreateQuantificationSection = function() 
{
    var selectionInfoContainerDiv = document.createElement('div');
    selectionInfoContainerDiv.id = 'selectionInfoContainer';
    selectionInfoContainerDiv.className = 'container';
    window.document.body.appendChild(selectionInfoContainerDiv);

    var selectionInfoHeaderDiv = document.createElement('div');
    selectionInfoHeaderDiv.id = 'selectionInfoHeaderDiv';
    selectionInfoHeaderDiv.className = 'header';
    selectionInfoHeaderDiv.innerHTML = 'Selection Information';
    selectionInfoContainerDiv.appendChild(selectionInfoHeaderDiv);

    objectCountDiv = document.createElement('div');
    objectCountLabel = "Number of objects selected: ";
    objectCountDiv.innerHTML = objectCountLabel + objectCount;
    selectionInfoContainerDiv.appendChild(objectCountDiv);
}

// create the Groups UI
PropertiesPlus.CreateGroupInfoSection = function() 
{
    groupInfoContainerDiv = document.createElement('div');
    groupInfoContainerDiv.id = 'groupInfoContainer';
    groupInfoContainerDiv.className = 'hide';
    window.document.body.appendChild(groupInfoContainerDiv);

    var groupInfoHeaderDiv = document.createElement('div');
    groupInfoHeaderDiv.id = 'groupInfoHeaderDiv';
    groupInfoHeaderDiv.className = 'header';
    groupInfoHeaderDiv.innerHTML = 'Group Information';
    groupInfoContainerDiv.appendChild(groupInfoHeaderDiv);

    groupInstanceCountDiv = document.createElement('div');
    groupInstanceCountLabel = "Number of instances in the entire model: ";
    groupInstanceCountDiv.innerHTML = groupInstanceCountLabel + groupInstanceCount;
    groupInfoContainerDiv.appendChild(groupInstanceCountDiv);
}

// update the values in the UI based on the current FormIt selection
PropertiesPlus.UpdateQuantification = function(currentSelectionInfo)
{
    currentSelectionInfo = JSON.parse(currentSelectionInfo);

    // update object count
    objectCount = currentSelectionInfo.selectedObjectsIDArray.length;
    objectCountDiv.innerHTML = objectCountLabel + objectCount;

    // update Group instance count
    // if there's just one object selected, and it's a Group (type 24), set a flag
    if ((currentSelectionInfo.selectedObjectsTypeArray.length == 1) && (currentSelectionInfo.selectedObjectsTypeArray[0] == 24))
    {
        //console.log("Single Group selected.");
        isSingleGroup = true;
    }
    else 
    {
        isSingleGroup = false;
    }

    // if a single Group is selected, enable the Group info container and update it
    if (isSingleGroup)
    {
        groupInfoContainerDiv.className = 'container';
        groupInstanceCount = currentSelectionInfo.totalInstanceCount;
        groupInstanceCountDiv.innerHTML = groupInstanceCountLabel + groupInstanceCount;
    }
    else
    {
        groupInfoContainerDiv.className = 'hide';
    }
    //console.log("History ID is..." + nHistoryID);
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
PropertiesPlus.Submit = function()
{
    var args = {
    //"calcVolume": document.a.calcVolume.checked
    }

    //console.log("PropertiesPlus.Submit");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    FormItInterface.CallMethod("PropertiesPlus.GetSelectionInfo", args, function(result)
    {
        //FormItInterface.ConsoleLog("Result " + result);
        PropertiesPlus.UpdateQuantification(result);
    });
    
}
