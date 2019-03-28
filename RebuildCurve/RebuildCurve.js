if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.RebuildCurve = function(args)
{

    console.clear();
    console.log("Rebuild Curve Plugin\n")

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    // console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    //console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        var message = "Select an arc or circle to begin.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }

    var typeArray = [];
    var nObjectIDArray = [];
    var nVertexIDArray = [];
    var point3DArray = [];
    var bIsEdgeTypeArray = [];
    var edgeLengthArray = [];
    var siblingArray = [];
    var bIsSameSiblingArray = [];
    var arcCircleAnalysisArray = [];
    var bIsOnCircleArray = [];
    var bIsOnSplineArray = [];

    function getSelectionInfo()
    {

        // for each edge in the selection, get info
        for (var j = 0; j < currentSelection.length; j++)
        {
            // if you're not in the Main History, calculate the depth to extract the correct history data
            var historyDepth = (currentSelection[j]["ids"].length) - 1;

            // get objectID of the current selection, then push the results into an array
            var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
            //console.log("Selection ID: " + nObjectID);
            nObjectIDArray.push(nObjectID);
            //console.log("ObjectID array: " + nObjectIDArray);

            // get object type of the current selection, then push the results into an array
            var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
            //console.log("Object type: " + nType);
            typeArray.push(nType);
            //console.log("Object type array: " + typeArray);

            // get vertexIDs of the current selection, then push the results into an array
            var nVertexIDSet = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
            //console.log("nVertex ID: " + nVertexIDSet);
            nVertexIDArray.push(nVertexIDSet);
            //console.log("VertexID array: " + nVertexIDArray);

            // convert vertexIDs on each end of the line to point3Ds, then push the results into an array
            var point3D0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, nVertexIDArray[j][0]);
            var point3D1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, nVertexIDArray[j][1]);
            point3DArray.push(point3D0);
            point3DArray.push(point3D1);
            //console.log("Point3D array: " + JSON.stringify(point3DArray));


            function getArcCircleAnalysis() 
            {
                // test selection for arc/circle attributes, then push the results into array
                var arcCircleAnalysis = WSM.APIIsEdgeOnCircleReadOnly(nHistoryID, nObjectID);
                //console.log("Report results of arc/circle analysis: " + JSON.stringify(arcCircleAnalysis));
                var bIsOnCircle = arcCircleAnalysis["bHasCircleAttribute"];
                //console.log("Is selection part of a circle? " + arcCircleAnalysis["bHasCircleAttribute"]);
                bIsOnCircleArray.push(bIsOnCircle);
                arcCircleAnalysisArray.push(arcCircleAnalysis);
                return arcCircleAnalysis;
            }

            var arcCircleAnalysis = getArcCircleAnalysis();

            function getSplineAnalysis()
            {
                // test selection for spline attributes, then push the results into an array
                var splineAnalysis = WSM.APIIsEdgeOnSplineReadOnly(nHistoryID, nObjectID);
                var bIsOnSpline = splineAnalysis["bHasSplineAttribute"];
                bIsOnSplineArray.push(bIsOnSpline);
            }

            var splineAnalysis = getSplineAnalysis();

            // determine which siblings the current edge has, then push the results into an array
            var currentSiblings = "[" + arcCircleAnalysis["aAllCircleSiblings"] + "]";
            //console.log("Current sibling IDs: " + currentSiblings);
            siblingArray.push(currentSiblings);

        }
    }

    getSelectionInfo();

    // run pre-checks to determine whether we can proceed with the given selection set
    function preCheck() 
    {
        //console.log("\nStart selection precheck... \n");

        // creates an array of boolean values depending on whether the selection contains edges
        function defineValidType()
        {
            // the valid edge type is defined in WSM as the number 7
            var validType = 7;
            for (var m = 0; m < typeArray.length; m++)
            {
                if (typeArray[m] === validType)
                {
                    bIsEdgeTypeArray.push(true);
                }
                else 
                {
                    bIsEdgeTypeArray.push(false);
                }
            }
            //console.log("Is valid array: " + bIsEdgeTypeArray);
        }

        defineValidType();

        // TEST if selection contains only edges (this function is stored in utils)
        var bIsSelectionEdgeTypeOnly = booleanReduce(bIsEdgeTypeArray);
        //console.log("TEST: Is selection set edges only? " + bIsSelectionEdgeTypeOnly);

        if (bIsSelectionEdgeTypeOnly === false)
        {
            var message = "The selection set contains a mix of objects or incompatible objects. Select a single arc or circle, and try again.";
            FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
            console.log(message);
        }

        // run the test for contiguity (this function is stored in utils)
        testForIdentical(siblingArray, bIsSameSiblingArray, "Is same sibling results: ");

        // TEST if the selected edges are contiguous
        var bIsSelectionContiguous = booleanReduce(bIsSameSiblingArray);
        //console.log("TEST: Is selection set contiguous? " + bIsSelectionContiguous);

        
        if (bIsSelectionContiguous === false)
        {
            var message = "The selection set contains multiple objects. Select a single arc or circle, and try again.";
            FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
            console.log(message);
        }

        // check if all required tests pass
        if (bIsSelectionEdgeTypeOnly && bIsSelectionContiguous) 
        {
            var preCheckPassed = true;
            console.log("\nPrecheck passed! \n");
        }
        else
        {
            var preCheckPassed = false;
            console.log("\nPrecheck failed. \n");
        }

        return preCheckPassed;
    }

    var preCheckPassed = preCheck();

    // returns the type of operation to proceed with
    function operationType(preCheckPassed) 
    {
        // TEST if the entire selection has the circle attribute
        var bIsArcCircleType = booleanReduce(bIsOnCircleArray);

        // TEST if the entire selection has the spline attribute
        var bIsSplineType = booleanReduce(bIsOnSplineArray);

        if (bIsArcCircleType === true)
        {
            var operationType = "arcCircle";
        }

        else if (bIsSplineType === true)
        {
            var operationType = "spline";
        }

        else
        {
            var operationType = "line";
        }

        console.log("Operation type: " + operationType);
        return operationType;
    }

    if (preCheckPassed === true)
    {
        var operationType = operationType();
    }

    function rebuildCurve(operationType)
    {
        if (operationType === "arcCircle")
        {
            var facetCount = args.facetCount;
            function rebuildArcCircle(facetCount)
            {
                //console.log("\nBegin rebuild of arc or circle...");
                //console.log("\nGetting information about the current arc or circle...\n")

                // get the first index of the arc/circle analysis, which should be sufficient because we've already proven the arrays are identical by this point
                var arcCircleAnalysis = arcCircleAnalysisArray[0];
                //console.log("Arc/circle analysis to use as reference: " + JSON.stringify(arcCircleAnalysis));

                var edgeCount = currentSelection.length;
                //console.log("Edges selected: " + edgeCount);

                // flatten the array of Vertex IDs so they're not organized in sets for each edge
                function flatten(nVertexIDArray) 
                {
                    return nVertexIDArray.reduce(function (flat, toFlatten) 
                    {
                        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
                    }, []);
                }

                var nVertexIDArrayFlattened = flatten(nVertexIDArray);
                //console.log("Flattened nVertexID array: " + nVertexIDArrayFlattened);

                var nVertexIDUniqueArray = [];
                var count = 0;
                
                // in the flattened vertex array, determine which values are unique (representing the end points of the arc)
                for (var i = 0; i < nVertexIDArrayFlattened.length; i++)
                {
                    count = 0;
                    for (var j = 0; j < nVertexIDArrayFlattened.length; j++)
                    {
                        if (nVertexIDArrayFlattened[j] === nVertexIDArrayFlattened[i])
                            count++;
                    }
                    if (count === 1)
                        nVertexIDUniqueArray.push(nVertexIDArrayFlattened[i]);
                }
                //console.log("Array of unique vertex IDs: " + nVertexIDUniqueArray);

                // if no unique values are found, this is a circle, so mark the circle boolean true and redefine the two end points so all three points are distinct
                if (nVertexIDUniqueArray.length === 0)
                {
                    var bCircle = true;
                    //console.log("Determined this curve is a full circle.\n");
                    // get the ID of the second vertex of the first edge in the array
                    var arcStartPosID = nVertexIDArrayFlattened[0];
                    //console.log("Start point vertexID: " + arcStartPosID);

                    // get the point3D equivalent
                    var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
                    //console.log("Start point point3D: " + JSON.stringify(arcStartPos))

                    // get the ID of the last vertex of the last edge in the array
                    var arcEndPosID = nVertexIDArrayFlattened[nVertexIDArrayFlattened.length - 2];
                    //console.log("End point vertexID: " + arcEndPosID);

                    // get the point3D equivalent
                    var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
                    //console.log("End point point 3D: " + JSON.stringify(arcEndPos));
                }
                else
                {
                    var bCircle = false;
                    //console.log("Determined this curve is an arc, not a circle.\n");
                    // get the ID of the first vertex of the first edge in the array
                    var arcStartPosID = nVertexIDUniqueArray[0];
                    //console.log("Start point vertexID: " + arcStartPosID);

                    // get the point3D equivalent
                    var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
                    //console.log("Start point point3D: " + JSON.stringify(arcStartPos));

                    // get the ID of the last vertex of the last edge in the array
                    var arcEndPosID = nVertexIDUniqueArray[1];
                    //console.log("End point vertexID: " + arcEndPosID);

                    // get the point3D equivalent
                    var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
                    //console.log("End point point 3D: " + JSON.stringify(arcEndPos));
                }

                // get the third point: a point on or near the midpoint of the arc, at a segment vertex
                var thirdPointID = nVertexIDArray[Math.ceil(edgeCount / 2)][0];
                //console.log("Third point vertexID: " + JSON.stringify(thirdPointID));

                // get the point3D equivalent
                var thirdPointPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, thirdPointID);
                //console.log("Third point 3D: " + JSON.stringify(thirdPointPos));

                var radius = arcCircleAnalysis["radius"];
                //console.log("Radius of circle: " + JSON.stringify(radius));

                var center = arcCircleAnalysis["center"];
                //console.log("Center of circle or arc: " + JSON.stringify(center));

                var xAxis = arcCircleAnalysis["xaxis"];
                //console.log("X axis of circle or arc: " + JSON.stringify(xAxis));

                var normal = arcCircleAnalysis["normal"];
                //console.log("Normal of circle or arc: " + JSON.stringify(normal));
                
                var pi = 3.1415926535897932384626433832795;
                var circumference = radius * 2 * pi;
                //console.log("Circumference of circle or arc: " + JSON.stringify(circumference));

                function getFacetedArcLength(point3DArray)
                {
                    // for each edge, measure the distance between the two points
                    for(var p = 0; p < nVertexIDArray.length * 2; p++)
                    {
                        var x0 = point3DArray[p]["x"];
                        var x1 = point3DArray[p + 1]["x"];
                        //console.log("x0 = " + x0 + " and x1 = " + x1);

                        var y0 = point3DArray[p]["y"];
                        var y1 = point3DArray[p + 1]["y"];
                        //console.log("y0 = " + y0 + " and y1 = " + y1);

                        var z0 = point3DArray[p]["z"];
                        var z1 = point3DArray[p + 1]["z"];
                        //console.log("z0 = " + z0 + " and z1 = " + z1);

                        // this function is stored in utils
                        var distanceBetweenTwoPoints = getDistanceBetweenTwoPoints(x0,y0,z0,x1,y1,z1);
                        edgeLengthArray.push(distanceBetweenTwoPoints);
                        //console.log("Edge length array: " + edgeLengthArray);

                        // since each point3D is in a set of 2 (for each end of each line), increase the for variable again
                        p = p + 1;
                    }
                    //console.log("Edge length array: " + edgeLengthArray);

                    // debug to ensure all three points are getting the same distance from the center
                    function getDistanceToCircleCenter(point0, center)
                    {
                        var x0 = point0["x"];
                        var x1 = center["x"];

                        var y0 = point0["y"];
                        var y1 = center["y"];

                        var z0 = point0["z"];
                        var z1 = center["z"];

                        return getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1);
                    }

                    //console.log("\nVerifying the calculated radius to compare against the radius reported from the attribute...\n");
                    //console.log("Radius of circle or arc (from attribute): " + JSON.stringify(radius));
                    //console.log("Distance from arcStartPos to center (calculated): " + getDistanceToCircleCenter(arcStartPos, center));
                    //console.log("Distance from arcEndPos to center (calculated): " + getDistanceToCircleCenter(arcEndPos, center));
                    //console.log("Distance from thirdPointPos to center (calculated): " + getDistanceToCircleCenter(thirdPointPos, center) + "\n");

                    var facetedArcLength = 0;

                    for (q = 0; q < edgeLengthArray.length; q++)
                    {
                        var facetedArcLength = facetedArcLength + edgeLengthArray[q];
                    }
                    //console.log("Number of edges used to calculate length: " + edgeLengthArray.length);
                    //console.log("Existing arc length: " + facetedArcLength);
                    return facetedArcLength;
                }

                var facetedArcLength = getFacetedArcLength(point3DArray);

                var quarterCircleLength = circumference / 4;

                // determine how many quarter-circles this faceted arc represents
                var quarterCircleMultiplier = facetedArcLength / quarterCircleLength;
                //console.log("Quarter circle multiplier: " + quarterCircleMultiplier);

                // Number of facets in each 90 degree arc segment; if circle, 4x this amount
                //var accuracyORcount = (quarterCircleMultiplier / 0.25) * (args.facetCount);
                var accuracyORcount = (Math.floor(args.facetCount / quarterCircleMultiplier));
                //console.log("accuracyORcount: " + accuracyORcount);
                //console.log("Effective accuracyORcount (x multiplier): " + (Math.ceil(quarterCircleMultiplier * accuracyORcount)));
                //console.log("Requested facet count: " + args.facetCount);
                if (Math.ceil(accuracyORcount * quarterCircleMultiplier) < args.facetCount)
                {
                    console.log("The requested facet count was higher than the resulting accuracyORcount value, so accuracyORcount was ignored.")
                }
                var bReadOnly = false;
                var trans;
                var nMinimumNumberOfFacets = args.facetCount;

                // if delete is checked, delete the original edges
                var bDelete = true;
                for (var n = 0; n < nObjectIDArray.length; n++)
                {
                    if (bDelete === true) 
                    {
                        WSM.APIDeleteObject(nHistoryID, nObjectIDArray[n]);
                    }
                }

                if (bDelete === true)
                {
                    console.log("\nDeleted the old curve.");
                }

                // execute the rebuild
                WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, thirdPointPos, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets, bCircle);

                // find the geometry that was changed so it can be highlighted and checked
                var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 7);
                //console.log("Changed data : " + JSON.stringify(changedData));

                var newEdgeIDArray = changedData["created"];

                var newFacetCount = newEdgeIDArray.length;
                //console.log("New edge IDs: " + newEdgeIDArray);

                var message = "Created a new curve with " + newFacetCount + " faceted edges.";
                FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
                console.log("\n" + message);

                // add the new edges to the selection
                FormIt.Selection.AddSelections(newEdgeIDArray);
                //console.log("\nAdded the new curve to the selection.");

                return newFacetCount;
            }

            FormIt.UndoManagement.BeginState();

            newFacetCount = rebuildArcCircle(facetCount);

            FormIt.UndoManagement.EndState("Rebuild Arc/Circle");

            // if the new facet count doesn't match the specified count, re-do the operation with a modified facet count
            if (newFacetCount != facetCount)
            {
                var facetDelta = facetCount - newFacetCount;
                //console.log("\nWARNING: The resulting facet count deviated from the specified amount. See the messages above for more information.");
                //facetCount = facetCount + facetDelta;

                //FormIt.UndoManagement.Undo(nHistoryID);              
                //rebuildArcCircle(facetCount);
            }

        }
        else if (operationType === "spline")
        {
            var message = "Rebuilding Splines is not yet supported. Select an arc or circle and try again.";
            FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
            console.log("\n" + message);
        }
        else if (operationType === "line")
        {
            var message = "Rebuilding lines is not yet supported. Select an arc or circle and try again.";
            FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
            console.log("\n" + message);
        }
    }

    // execute the rebuild
    rebuildCurve(operationType);

}

deanstein.ExplodeCurve = function()
{
    console.clear();
    console.log("Explode Curve Plugin\n");
    
    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    //console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        var message = "Select an arc, circle, or spline to explode.";
        FormIt.UI.ShowNotification(message, FormIt.NotificationType.Error, 0);
        console.log(message);
        return;
    }

    // for each edge in the selection, get the vertexIDs and mark them not smooth
    for (var e = 0; e < currentSelection.length; e++)
    {
        var edgeCount = currentSelection.length;

        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[e]["ids"].length) - 1;

        var nObjectID = currentSelection[e]["ids"][historyDepth]["Object"];

        // get vertexIDs of the current selection, then push the results into an array
        var nVertexID = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
        //console.log("nVertex ID: " + nVertexID);

        FormIt.UndoManagement.BeginState();

        WSM.APISetEdgesOrVerticesMarkedSmooth(nHistoryID, nVertexID, false);

        FormIt.UndoManagement.EndState("Explode Curve");
    }

    var message = "Exploded the curve into " + edgeCount + " discrete edges.";
    FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
    console.log("\n" + message);

}



// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
    "facetCount": parseFloat(document.a.facetCount.value)
    }

    //console.log("deanstein.RebuildCurve");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.RebuildCurve", args);
}

deanstein.SubmitExplode = function(argsExplode)
{

    var argsExplode =
    {

    }
    //console.log("deanstein.RebuildCurve");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.ExplodeCurve", argsExplode);
}