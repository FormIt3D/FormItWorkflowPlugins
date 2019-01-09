if (typeof FormItWorkflowPlugins == 'undefined')
{
    FormItWorkflowPlugins = {};
}

FormItWorkflowPlugins.ValidateModel = function()
{
    console.clear();
    console.log("Validate Model");

    FormIt.Commands.DoCommand("Dot: Validate the model");
}

FormItWorkflowPlugins.CleanModel = function()
{
    console.clear();
    console.log("Clean Model");

    FormIt.UndoManagement.BeginState();

    FormIt.Commands.DoCommand("Dot: Clean the model");

    FormIt.UndoManagement.EndState("Clean Model Plugin");
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
FormItWorkflowPlugins.SubmitValidate = function()
{
    var validateArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.ValidateModel", validateArgs);
}

FormItWorkflowPlugins.SubmitClean = function()
{
    var cleanArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.CleanModel", cleanArgs);
}
