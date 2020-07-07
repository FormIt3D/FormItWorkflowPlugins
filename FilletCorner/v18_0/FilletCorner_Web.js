if (typeof FilletCorner == 'undefined')
{
    FilletCorner = {};
}

// IDs for inputs whose values need to be updated
var filletRadiusInputID = 'filletRadiusInput';
var deleteVertexInputID = 'deleteVertexInput';

// initialize the UI
FilletCorner.initializeUI = function()
{
    // create an overall container for all objects that comprise the "content" of the plugin
    // everything except the footer
    var contentContainer = document.createElement('div');
    contentContainer.id = 'contentContainer';
    contentContainer.className = 'contentContainer'
    window.document.body.appendChild(contentContainer);

    // create the header
    var filletCornersHeader = new FormIt.PluginUI.HeaderModule('Fillet 2D Corners', '', 'headerContainer');
    contentContainer.appendChild(filletCornersHeader.element);

    // unordered lists as necessary
    var detailsUl1 = contentContainer.appendChild(document.createElement('ul'));

    var detailsLi1a = detailsUl1.appendChild(document.createElement('li'));
    detailsLi1a.innerHTML = 'Select vertices, connected edges, or faces';

    var detailsUl2 = detailsUl1.appendChild(document.createElement('ul')); 
    var detailsLi2a = detailsUl2.appendChild(document.createElement('li'));
    detailsLi2a.innerHTML = 'Currently, only corners with 2 attached edges are supported';

    var detailsLi1b = detailsUl1.appendChild(document.createElement('li'));
    detailsLi1b.innerHTML = 'Click "Fillet Corner" to draw a new arc at each 2D corner';

    // create the radius input
    var filletRadiusInputModule = new FormIt.PluginUI.TextInputModule('Fillet Radius: ', 'filletRadiusModule', 'inputModuleContainerTop', filletRadiusInputID, FormIt.PluginUI.convertValueToDimensionString);
    contentContainer.appendChild(filletRadiusInputModule.element);

    var filletRadiusInput = document.getElementById(filletRadiusInputID);
    filletRadiusInput.value = 5;

    // create the delete vertex checkbox
    var deleteVertexCheckboxModule = new FormIt.PluginUI.CheckboxModule('Delete Vertex', 'deleteVertexCheckboxModule', 'multiModuleContainer', deleteVertexInputID);
    contentContainer.appendChild(deleteVertexCheckboxModule.element);

    var deleteVertexInput = document.getElementById(deleteVertexInputID);

    // the generate button
    var filletCornerButton = new FormIt.PluginUI.Button('Fillet Corners', function()
    {
        var args = {
        "radius": filletRadiusInput.value,
        "cleanup": deleteVertexInput.checked
        }
    
        window.FormItInterface.CallMethod("FilletCorner.executeFilletCorner", args);
    });
    contentContainer.appendChild(filletCornerButton.element);

    //
    // create the footer
    //
    var footerModule = new FormIt.PluginUI.FooterModule;
    document.body.appendChild(footerModule.element);
}

FilletCorner.updateUI = function()
{
    var currentValue = document.getElementById(filletRadiusInputID).value;
    FormIt.PluginUI.convertValueToDimensionString(currentValue, function(result)
    {
        var radiusInput = document.getElementById(filletRadiusInputID);
        radiusInput.value = JSON.parse(result);
    });
}
