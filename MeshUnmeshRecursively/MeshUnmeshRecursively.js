if (typeof FormItWorkflowPlugins == 'undefined')
{
    FormItWorkflowPlugins = {};
}

FormItWorkflowPlugins.MeshRecursively = function()
{
    console.clear();
    console.log("Mesh Group Recursively Plugin");
}

FormItWorkflowPlugins.UnmeshRecursively = function()
{
    console.clear();
    console.log("Unmesh Group Recursively Plugin");
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
FormItWorkflowPlugins.SubmitMeshRecursive = function()
{
    var meshRecursiveArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.MeshRecursively", meshRecursiveArgs);
}

FormItWorkflowPlugins.SubmitUnmeshRecursive = function()
{
    var unmeshRecursiveArgs =
    {

    }

    window.FormItInterface.CallMethod("FormItWorkflowPlugins.UnmeshRecursively", unmeshRecursiveArgs);
}
