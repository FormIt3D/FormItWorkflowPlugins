if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

if (typeof deanstein.GenerateStringLights == 'undefined')
{
    deanstein.GenerateStringLights = {};
}

// these get populated with the getSelectionBasics()function
var nHistoryID;
var currentSelection;

// define how to get the current history, query the selection, and report the number of items successfully selected
deanstein.GenerateStringLights.getSelectionBasics = function()
{
    console.log("\nGetting selection basics...");
    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("\nCurrent history: " + JSON.stringify(nHistoryID));

    // get current selection
    currentSelection = FormIt.Selection.GetSelections();
    // console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        console.log("\nSelect a line or series of lines to begin.");
        return false;
    }
}

// define how to gather necessary data about the selection and store it in arrays
deanstein.GenerateStringLights.getSelectionInfo = function(nHistoryID, currentSelection)
{
    // create or empty the arrays before starting
    deanstein.GenerateStringLights.arrays = {};
    deanstein.GenerateStringLights.arrays.typeArray = new Array();
    deanstein.GenerateStringLights.arrays.nObjectIDArray = new Array();
    deanstein.GenerateStringLights.arrays.nVertexIDArray = new Array();
    deanstein.GenerateStringLights.arrays.point3DArray = new Array();
    deanstein.GenerateStringLights.arrays.bIsEdgeTypeArray = new Array();
    deanstein.GenerateStringLights.arrays.edgeLengthArray = new Array();
    deanstein.GenerateStringLights.arrays.arcCircleAnalysisArray = new Array();    
    deanstein.GenerateStringLights.arrays.bIsOnCircleArray = new Array();
    deanstein.GenerateStringLights.arrays.bIsOnSplineArray = new Array();
    deanstein.GenerateStringLights.arrays.siblingArray = new Array();
    deanstein.GenerateStringLights.arrays.arcCircle3PointIDArray = new Array();
    deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray = new Array();

    // for each edge in the selection, get info
    for (var j = 0; j < currentSelection.length; j++)
    {
        // if you're not in the Main History, calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[j]["ids"].length) - 1;

        // get objectID of the current selection, then push the results into an array
        var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
        //console.log("Selection ID: " + nObjectID);
        deanstein.GenerateStringLights.arrays.nObjectIDArray.push(nObjectID);
        //console.log("ObjectID array: " + deanstein.GenerateStringLights.arrays.nObjectIDArray);

        // get object type of the current selection, then push the results into an array
        var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
        //console.log("Object type: " + nType);
        deanstein.GenerateStringLights.arrays.typeArray.push(nType);
        //console.log("Object type array: " + deanstein.GenerateStringLights.arrays.typeArray);

        // get vertexIDs of the current selection, then push the results into an array
        var nVertexIDSet = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
        //console.log("nVertex ID: " + nVertexIDSet);
        deanstein.GenerateStringLights.arrays.nVertexIDArray.push(nVertexIDSet);
        //console.log("VertexID array: " + deanstein.GenerateStringLights.arrays.nVertexIDArray);

        // convert vertexIDs on each end of the line to point3Ds, then push the results into an array
        var point3D0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, deanstein.GenerateStringLights.arrays.nVertexIDArray[j][0]);
        var point3D1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, deanstein.GenerateStringLights.arrays.nVertexIDArray[j][1]);
        deanstein.GenerateStringLights.arrays.point3DArray.push(point3D0);
        deanstein.GenerateStringLights.arrays.point3DArray.push(point3D1);
        //console.log("Point3D array: " + JSON.stringify(deanstein.GenerateStringLights.arrays.point3DArray));

        function getArcCircleAnalysis() 
        {
            // test selection for arc/circle attributes, then push the results into array
            var arcCircleAnalysis = WSM.APIIsEdgeOnCircleReadOnly(nHistoryID, nObjectID);
            //console.log("Report results of arc/circle analysis: " + JSON.stringify(arcCircleAnalysis));
            var bIsOnCircle = arcCircleAnalysis["bHasCircleAttribute"];
            //console.log("Is selection part of a circle? " + arcCircleAnalysis["bHasCircleAttribute"]);
            deanstein.GenerateStringLights.arrays.bIsOnCircleArray.push(bIsOnCircle);
            deanstein.GenerateStringLights.arrays.arcCircleAnalysisArray.push(arcCircleAnalysis);
            return arcCircleAnalysis;
        }

        var arcCircleAnalysis = getArcCircleAnalysis();

        function getSplineAnalysis()
        {
            // test selection for spline attributes, then push the results into an array
            var splineAnalysis = WSM.APIIsEdgeOnSplineReadOnly(nHistoryID, nObjectID);
            var bIsOnSpline = splineAnalysis["bHasSplineAttribute"];
            deanstein.GenerateStringLights.arrays.bIsOnSplineArray.push(bIsOnSpline);
        }

        var splineAnalysis = getSplineAnalysis();

        // determine which siblings the current edge has, then push the results into an array
        var currentSiblings = "[" + arcCircleAnalysis["aAllCircleSiblings"] + "]";
        //console.log("Current sibling IDs: " + currentSiblings);
        deanstein.GenerateStringLights.arrays.siblingArray.push(currentSiblings);

    }
}

// define how to pre-check to determine whether we can proceed with the given selection set
deanstein.GenerateStringLights.preCheck = function()
{

    console.log("\nStart selection precheck... \n");

    // creates an array of boolean values depending on whether the selection contains edges
    function defineValidType()
    {
        // the edge type is defined in WSM as the number 7
        var validType = 7;
        for (var m = 0; m < deanstein.GenerateStringLights.arrays.typeArray.length; m++)
        {
            if (deanstein.GenerateStringLights.arrays.typeArray[m] === validType)
            {
                deanstein.GenerateStringLights.arrays.bIsEdgeTypeArray.push(true);
            }
            else 
            {
                deanstein.GenerateStringLights.arrays.bIsEdgeTypeArray.push(false);
            }
        }
        //console.log("Is valid array: " + deanstein.GenerateStringLights.arrays.bIsEdgeTypeArray);
    }

    defineValidType();

    // TEST if selection contains only edges
    var bIsSelectionEdgeTypeOnly = booleanReduce(deanstein.GenerateStringLights.arrays.bIsEdgeTypeArray);
    console.log("TEST: Is selection set edges only? " + bIsSelectionEdgeTypeOnly);

    if (bIsSelectionEdgeTypeOnly === false)
    {
        console.log("Can't continue: The selection set contains a mix of objects or incompatible objects. Try selecting only curves or lines.");
    }

    // check if all required tests pass
    if (bIsSelectionEdgeTypeOnly) 
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
    console.log(preCheckPassed);
}

// define how to determine the type of operation to proceed with
deanstein.GenerateStringLights.getOperationType = function() 
{
    // TEST if the entire selection has the circle attribute
    var bIsArcCircleType = booleanReduce(deanstein.GenerateStringLights.arrays.bIsOnCircleArray);
    //console.log("bIsOnCirclArray: " + deanstein.GenerateStringLights.arrays.bIsOnCircleArray);

    // TEST if the entire selection has the spline attribute
    var bIsSplineType = booleanReduce(deanstein.GenerateStringLights.arrays.bIsOnSplineArray);

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

// define how to generate a new arc from the selected line
deanstein.GenerateStringLights.createCatenaryArcFromLine = function(nHistoryID, args)
{
    console.log("\nCreating a catenary arc from line");
    var arcStartPos = deanstein.GenerateStringLights.arrays.point3DArray[0];
    console.log("Arc start point: " + JSON.stringify(arcStartPos));

    var arcEndPos = deanstein.GenerateStringLights.arrays.point3DArray[1];
    console.log("Arc end point: " + JSON.stringify(arcEndPos));

    var x0 = arcStartPos["x"];
    var y0 = arcStartPos["y"];
    var z0 = arcStartPos["z"];

    var x1 = arcEndPos["x"];
    var y1 = arcEndPos["y"];
    var z1 = arcEndPos["z"];

    // midpoint function is stored in utils
    var midPoint = getMidPointBetweenTwoPoints(x0,y0,z0,x1,y1,z1);

    var arcBulge = args.arcBulge;

    // assume gravity is down, and subtract the desired arc bulge from the z-value of the current midpoint
    var newMidPointZ = midPoint[2] - arcBulge;

    // define the bulge point as the midpoint with the new z value
    var bulgePoint = [midPoint[0], midPoint[1], newMidPointZ];

    // create a point 3D at the bulge point
    var thirdPoint = WSM.Geom.Point3d(bulgePoint[0], bulgePoint[1], bulgePoint[2]);
    console.log("Third point: " + JSON.stringify(thirdPoint));

    // set parameters for initial catenary arc
    var accuracyORcount = 5;
    var bReadOnly = false;
    var trans;
    var nMinimumNumberOfFacets = 5;
    bCircle = false;

    // create a new arc
    var catenaryArcFromLine = WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, thirdPoint, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets, bCircle);
    console.log("Created a new arc based on the input line.");

    // find the geometry that was just changed so it can be highlighted and checked
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 7);
    //console.log("Changed data: " + JSON.stringify(changedData));

    var newEdgeIDArray = changedData["created"];

    // eliminate the current selection
    console.log("\nClearing the original selection.");
    FormIt.Selection.ClearSelections();	

    // add the new edges to the selection
    FormIt.Selection.AddSelections(newEdgeIDArray);
    console.log("\nAdded the new curve to the selection set.");

    currentSelection = FormIt.Selection.GetSelections();
    console.log("\nRedefining the current selection.");

    // get basic info about the new selection

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        console.log("\nError: no new arc was created.");
        return;
    }

    // re-run the get info on selection routine to populate the arrays with the new curve information
    deanstein.GenerateStringLights.getSelectionInfo(nHistoryID, currentSelection);
    console.log("\nPopulating arrays with new selection info.");

    // set the curve to be rebuilt to the newly created curve
    var vertexIDArrayForRebuild = deanstein.GenerateStringLights.arrays.nVertexIDArray;

    console.log("\nNew curve available for rebuild.");
    return vertexIDArrayForRebuild;
}

// define how to flatten array of Vertex IDs so they're not organized in sets for each edge
deanstein.GenerateStringLights.flatten = function(array) 
{
    return array.reduce(function (flat, toFlatten) 
    {
        return flat.concat(Array.isArray(toFlatten) ? deanstein.GenerateStringLights.flatten(toFlatten) : toFlatten);
    }, []);
}

// define how to check if the vertexIDs form a circle; returns true if circle
deanstein.GenerateStringLights.checkIfCircle = function(nVertexIDUniqueArray)
{

    // if no unique values are found, this is a circle
    if (nVertexIDUniqueArray.length === 0)
    {
        var bCircle = true;
        console.log("Determined this curve is a full circle.\n");
        return bCircle;
    }
    
    // otherwise, this arc is not a circle
    else
    {
        var bCircle = false;
        console.log("Determined this curve is not a circle.\n");
        return bCircle;
    }
}

// define how to get 3 points defining the arc or circle
deanstein.GenerateStringLights.getArcCircle3PointPosArray = function()
{
    console.log("\nGetting 3 points to define the current arc or circle...\n");

    // set the vertex IDs for rebuild to the current vertexIDArray in selection
    var vertexIDArrayForRebuild = deanstein.GenerateStringLights.arrays.nVertexIDArray;

    var edgeCount = currentSelection.length;
    console.log("Edges selected: " + (vertexIDArrayForRebuild.length));

    // flatten the vertexIDs slated for rebuild
    var nVertexIDArrayFlattened = deanstein.GenerateStringLights.flatten(vertexIDArrayForRebuild);
    //console.log("Flattened nVertexID array: " + nVertexIDArrayFlattened);

    // define how to search through an array, and return an array of only unique values
    function getUniqueValuesInArray(array)
    {

        var uniqueArray = [];
        var count = 0;
        
        // in the flattened vertex array, find the end points by searching for unique IDs
        for (var i = 0; i < array.length; i++)
        {
            count = 0;
            for (var j = 0; j < array.length; j++)
            {
                if (array[j] === array[i])
                    count++;
            }
            if (count === 1)
                uniqueArray.push(array[i]);
        }
        //console.log("Array of unique vertex IDs: " + nVertexIDUniqueArray);
        return uniqueArray;
    }

    var nVertexIDUniqueArray = getUniqueValuesInArray(nVertexIDArrayFlattened);

    // check if the current vertexIDs in the array form a circle, and set the flag appropriately
    var bCircle = deanstein.GenerateStringLights.checkIfCircle(nVertexIDArrayFlattened);

    // if this is a circle, we have to pick the end points differently to ensure they are distinct
    if (bCircle === true)
    {
        // get the ID of the second vertex of the first edge in the array
        var arcStartPosID = nVertexIDArrayFlattened[0];
        console.log("Start point vertexID: " + arcStartPosID);

        // get the point3D equivalent
        var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
        console.log("Start point point3D: " + JSON.stringify(arcStartPos))

        // get the ID of the last vertex of the last edge in the array
        var arcEndPosID = nVertexIDArrayFlattened[nVertexIDArrayFlattened.length - 2];
        console.log("End point vertexID: " + arcEndPosID);

        // get the point3D equivalent
        var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
        console.log("End point point 3D: " + JSON.stringify(arcEndPos));
    }

    // otherwise, pick the end points normally
    else if (bCircle === false)
    {
        // get the ID of the first vertex of the first edge in the array
        var arcStartPosID = nVertexIDUniqueArray[0];
        console.log("Start point vertexID: " + arcStartPosID);

        // get the point3D equivalent
        var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
        console.log("Start point point3D: " + JSON.stringify(arcStartPos));

        // get the ID of the last vertex of the last edge in the array
        var arcEndPosID = nVertexIDUniqueArray[1];
        console.log("End point vertexID: " + arcEndPosID);

        // get the point3D equivalent
        var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
        console.log("End point point 3D: " + JSON.stringify(arcEndPos));
    }

    // get the third point: a point on or near the midpoint of the arc, at a segment vertex
    //console.log("nVertexIDArray: " + deanstein.GenerateStringLights.arrays.nVertexIDArray);
    var thirdPointID = deanstein.GenerateStringLights.arrays.nVertexIDArray[Math.ceil(edgeCount / 2)][0];
    console.log("Third point vertexID: " + JSON.stringify(thirdPointID));

    // get the point3D equivalent
    var thirdPointPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, thirdPointID);
    console.log("Third point 3D: " + JSON.stringify(thirdPointPos));

    // push the three points into the appropriate array
    deanstein.GenerateStringLights.arrays.arcCircle3PointIDArray.push(arcStartPosID, thirdPointID, arcEndPosID);
    deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray.push(arcStartPos, thirdPointPos, arcEndPos);
}

// define how to rebuild the given arc/circle
deanstein.GenerateStringLights.rebuildArcCircle = function(vertexIDArrayForRebuild, args)
{
    console.log("\nBegin rebuild of arc or circle...");

    var nVertexIDArrayFlattened = deanstein.GenerateStringLights.flatten(vertexIDArrayForRebuild);
    // check if the current vertexIDs in the array form a circle, and set the flag appropriately
    var bCircle = deanstein.GenerateStringLights.checkIfCircle(nVertexIDArrayFlattened);

    // get the 3 points representing the arc or circle
    deanstein.GenerateStringLights.getArcCircle3PointPosArray();

    var arcStartPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[0];
    var thirdPointPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[1];
    var arcEndPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[2];

    // get the first index of the arc/circle analysis, which should be sufficient because we've already proven the arrays are identical by this point
    var arcCircleAnalysis = deanstein.GenerateStringLights.arrays.arcCircleAnalysisArray[0];
    //console.log("Arc/circle analysis to use as reference: " + JSON.stringify(arcCircleAnalysis));

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

    // define how to get the total arc length by adding faceted edge lengths together
    function getFacetedArcLength(nObjectIDArray, point3DArray)
    {
        console.log("\nCalculating faceted arc length by adding up all segments...");
        // for each edge on the arc or circle, measure the distance between the two points
        for(var p = 0; p < nObjectIDArray.length * 2; p++)
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

            deanstein.GenerateStringLights.arrays.edgeLengthArray.push(distanceBetweenTwoPoints);
            //console.log("Edge length array: " + deanstein.GenerateStringLights.arrays.edgeLengthArray);

            // since each point3D is in a set of 2 (for each end of each line), increase the for variable again
            p = p + 1;
        }
        //console.log("Edge length array: " + deanstein.GenerateStringLights.arrays.edgeLengthArray);

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

        console.log("\nVerifying the calculated radius to compare against the radius reported from the attribute...\n");
        console.log("Radius of circle or arc (from attribute): " + JSON.stringify(radius));
        console.log("Distance from arcStartPos to center (calculated): " + getDistanceToCircleCenter(arcStartPos, center));
        console.log("Distance from arcEndPos to center (calculated): " + getDistanceToCircleCenter(arcEndPos, center));
        console.log("Distance from thirdPointPos to center (calculated): " + getDistanceToCircleCenter(thirdPointPos, center) + "\n");

        var facetedArcLength = 0;

        for (q = 0; q < deanstein.GenerateStringLights.arrays.edgeLengthArray.length; q++)
        {
            var facetedArcLength = facetedArcLength + deanstein.GenerateStringLights.arrays.edgeLengthArray[q];
        }
        console.log("Number of edges used to calculate length: " + deanstein.GenerateStringLights.arrays.edgeLengthArray.length);
        console.log("Existing arc length: " + facetedArcLength);
        return facetedArcLength;
    }

    var nObjectIDArray = deanstein.GenerateStringLights.arrays.nObjectIDArray;
    var point3DArray = deanstein.GenerateStringLights.arrays.point3DArray;

    var facetedArcLength = getFacetedArcLength(nObjectIDArray, point3DArray);

    var quarterCircleLength = circumference / 4;

    // determine how many quarter-circles this faceted arc represents
    var quarterCircleMultiplier = facetedArcLength / quarterCircleLength;
    console.log("Quarter circle multiplier: " + quarterCircleMultiplier);

    // Number of facets in each 90 degree arc segment; if circle, 4x this amount
    //var accuracyORcount = (quarterCircleMultiplier / 0.25) * (args.facetCount);
    var accuracyORcount = (Math.floor(args.facetCount / quarterCircleMultiplier));
    console.log("accuracyORcount: " + accuracyORcount);
    console.log("Effective accuracyORcount (x multiplier): " + (Math.ceil(quarterCircleMultiplier * accuracyORcount)));
    console.log("Requested facet count: " + args.facetCount);
    if (Math.ceil(accuracyORcount * quarterCircleMultiplier) < args.facetCount)
    {
        console.log("The requested facet count was higher than the resulting accuracyORcount value, so accuracyORcount was ignored.")
    }
    var bReadOnly = false;
    var trans;
    var nMinimumNumberOfFacets = args.facetCount;

    // if delete is checked, delete the original edges
    var bDelete = true;
    for (var n = 0; n < deanstein.GenerateStringLights.arrays.nObjectIDArray.length; n++)
    {
        if (bDelete === true) 
        {
            WSM.APIDeleteObject(nHistoryID, deanstein.GenerateStringLights.arrays.nObjectIDArray[n]);
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
    //console.log("Changed data: " + JSON.stringify(changedData));

    var newEdgeIDArray = changedData["created"];

    // eliminate the current selection
    console.log("\nClearing the original selection.");
    FormIt.Selection.ClearSelections();	

    // add the new edges to the selection
    FormIt.Selection.AddSelections(newEdgeIDArray);
    console.log("\nAdded the new curve to the selection set.");

    var newFacetCount = newEdgeIDArray.length;
    //console.log("New edge IDs: " + newEdgeIDs);
    console.log("\nCreated a new curve with " + newFacetCount + " faceted edges.");

    return newEdgeIDArray;
}

// define how to place points evenly on an arc/circle
deanstein.GenerateStringLights.generatePointsAlongArcCircle = function(args)
{
    // assume the selected curve is the target curve, and that the getInfo() arrays represent that selection
    console.log("\nBegin drawing evenly-spaced points along the arc/circle...");

    // get the three definition points
    deanstein.GenerateStringLights.getArcCircle3PointPosArray();

    var arcStartVertexID = deanstein.GenerateStringLights.arrays.arcCircle3PointIDArray[0];
    var arcStartPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[0];
    var thirdPoint = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[1];
    var arcEndPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[2];

    var lightCount = args.lightCount;
    var facetCountForLights = lightCount + 1;

    // set parameters for temporary arc to get light points
    var accuracyORcount = facetCountForLights;
    // if true, no arc will be drawn, but the points will be returned
    var bReadOnly = true;
    var trans;
    var nMinimumNumberOfFacets = facetCountForLights;
    bCircle = false;

    // create a temporary arc
    var temporaryArcPointPosArray = WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, thirdPoint, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets, bCircle);
    console.log("Created a new temporary arc based on the input line.");
    //console.log("Points from temporary arc: " + JSON.stringify(temporaryArcPointPosArray));

    // remove the first and last points from the temporary arc points to create the points at which new lights will hang
    console.log("Number of points in temporary arc point array: " + temporaryArcPointPosArray.length);
    temporaryArcPointPosArray.splice((temporaryArcPointPosArray.length - 1), 1);
    temporaryArcPointPosArray.splice(0, 1);
    var lightMountPointPosArray = temporaryArcPointPosArray;
    //console.log("Points for mounting lights: " + JSON.stringify(verticalCableTopPointPosArray));
    return lightMountPointPosArray;
}

// define how to draw a single light fixture; returns the group ID the fixture exists in
deanstein.GenerateStringLights.drawSingleLightFixture = function(placementPoint, args)
{
    console.log("\nDrawing the typical light fixture...");

    // take the placement point and move it down to represent a cable or bulb housing length
    var verticalCableOrHousingLength = args.verticalCableOrHousingLength;
    var verticalCableBottomPointPos = WSM.Geom.Point3d(placementPoint["x"], placementPoint["y"], placementPoint["z"] - verticalCableOrHousingLength);

    console.log("Bottom point of vertical cable " + JSON.stringify(verticalCableBottomPointPos));

    // create an empty group
    var typicalLightFixtureGroupID = WSM.APICreateGroup(nHistoryID, []);
    console.log("Created a new group for a typical fixture: " + typicalLightFixtureGroupID);

    // create a new history to create the light fixture
    var typicalLightFixtureHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, typicalLightFixtureGroupID);
    console.log("Created a new history for the typical light fixture: " + typicalLightFixtureHistoryID);

    // draw a single vertical line connecting the two points
    var cablePath = WSM.APIConnectPoint3ds(typicalLightFixtureHistoryID, placementPoint, verticalCableBottomPointPos);
    console.log("Drew a single line representing the cable length or bulb housing.");

    // find theedgeface that was just created so it can be highlighted and checked
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(typicalLightFixtureHistoryID, 7);
    //console.log("Changed data: " + JSON.stringify(changedData));
    var cablePathID = changedData["created"][0];
    console.log("New path ID: " + JSON.stringify(cablePathID));

    var bulbCount = args.bulbCount;
    var verticalCableOrHousingRadius = args.verticalCableOrHousingRadius;

    // define how to create bulbs
    function createBulbs(args)
    {
        var bulbRadius = args.bulbRadius;
        //console.log("Bulb radius: " + bulbRadius);
        var bulbCount = args.bulbCount;

        // set the bulb center point below the end of the cable
        var bulbCenterPointPos = WSM.Geom.Point3d(verticalCableBottomPointPos["x"], verticalCableBottomPointPos["y"], verticalCableBottomPointPos["z"] - bulbRadius);
        //console.log("Bulb center point: " + JSON.stringify(bulbCenterPointPos));

        // draw the bulb
        console.log("Drawing typical bulb...");

        // create a group for typical bulb
        var typicalBulbGroupID = WSM.APICreateGroup(typicalLightFixtureHistoryID, []);
        console.log("Created a new group for a typical bulb: " + typicalBulbGroupID);

        var typicalBulbInstanceIDArray = WSM.APIGetObjectsByTypeReadOnly(typicalLightFixtureHistoryID, typicalBulbGroupID, WSM.nInstanceType);

        // create a new history for the bulb
        var typicalBulbHistoryID =  WSM.APIGetGroupReferencedHistoryReadOnly(typicalLightFixtureHistoryID, typicalBulbGroupID);
        console.log("Created a new history for the typical light fixture: " + typicalBulbHistoryID);

        var bulbAccuracyORcount = 4;
        var bulbTopHalf = WSM.APICreateHemisphere(typicalBulbHistoryID, bulbRadius, bulbCenterPointPos, bulbAccuracyORcount);
        var bulbBottomHalf = WSM.APICopyOrSketchAndTransformObjects(typicalBulbHistoryID, typicalBulbHistoryID, bulbTopHalf, WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0, 0, 2 * bulbCenterPointPos["z"]), WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, -1)), 1, false);

        // join the top and bottom halves
        var finalBulbGeom = WSM.APIUnite(typicalBulbHistoryID, bulbTopHalf, bulbBottomHalf[0]);

        // copy bulbs, if requested
        if (bulbCount > 1)
        {
            console.log("Multiple bulbs requested.");
            WSM.APICopyOrSketchAndTransformObjects(typicalLightFixtureHistoryID, typicalLightFixtureHistoryID, typicalBulbInstanceIDArray[0], WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0, 0, -(bulbRadius * 2)), WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1)), bulbCount - 1, false);

            // get all the group IDs from the array of bulbs
            var bulbGroupIDArray = WSM.APIGetObjectsByTypeReadOnly(typicalLightFixtureHistoryID, typicalBulbInstanceIDArray[0], WSM.nGroupType, true);

            // create a group to contain multiple bulbs
            var bulbContainerGroupID = WSM.APICreateGroup(typicalLightFixtureHistoryID, bulbGroupIDArray);
            console.log("Created a new group for multiple bulbs " + bulbContainerGroupID);
        }
    }

    // only create bulbs if they're requested
    if (bulbCount != 0)
    {
        createBulbs(args);
    }
    else if (bulbCount === 0)
    {
        console.log("No bulbs were requested.");
    }

    // sweep the initial line into a cable or housing
    console.log("Begin sweep of vertical cable...");
    var aProfilePoints = WSM.APICreateCircleOrArc(typicalLightFixtureHistoryID, verticalCableOrHousingRadius, placementPoint);

    // find the face that was just created
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(typicalLightFixtureHistoryID, 4);
    //console.log("Changed data: " + JSON.stringify(changedData));
    var newProfileFaceID = changedData["created"][0];
    console.log("New profile face ID: " + JSON.stringify(newProfileFaceID));
    console.log("Typical light fixture history ID: " + typicalLightFixtureHistoryID);

    var aProfile = [{"ids":[{"History":typicalLightFixtureHistoryID,"Object":newProfileFaceID,"objectName":"ObjectHistoryID"}], "objectName": "GroupInstancePath"}];
    var aPath = [{"ids":[{"History":typicalLightFixtureHistoryID,"Object":cablePathID,"objectName":"ObjectHistoryID"}], "objectName": "GroupInstancePath"}];
    var bRemoveUnusedProfileAndPath = true;

    // execute the sweep
    WSM.APISweep(typicalLightFixtureHistoryID, aProfile, aPath, bRemoveUnusedProfileAndPath);

    var typicalFixtureInstanceIDArray = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, typicalLightFixtureGroupID, WSM.nInstanceType);

    console.log("Done making the typical fixture inside instance ID " + JSON.stringify(typicalFixtureInstanceIDArray[0]));
    return typicalFixtureInstanceIDArray[0];
}
    

// define how to array the light fixtures at each point
deanstein.GenerateStringLights.arrayStringLights = function(typicalFixtureInstanceID, placementPointArray)
{
    console.log("\nArraying string light fixtures...");

    var transformArray = [];

    for (var g = 0; g < placementPointArray.length - 1; g++)
    {
        var point0 = placementPointArray[0];
        var point1 = placementPointArray[g + 1];

        var x0 = point0["x"];
        var y0 = point0["y"];
        var z0 = point0["z"];

        var x1 = point1["x"];
        var y1 = point1["y"];
        var z1 = point1["z"];

        // this is stored in utils
        var arrayLightFixtureVector = getVectorBetweenTwoPoints(x0,y0,z0, x1,y1,z1);
        //console.log("Array light fixture vector: " + arrayLightFixtureVector);

        var transform = WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(arrayLightFixtureVector[0], arrayLightFixtureVector[1], arrayLightFixtureVector[2]), WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1));
        //console.log("Transform: " + JSON.stringify(transform));

        WSM.APICopyOrSketchAndTransformObjects(nHistoryID, nHistoryID, typicalFixtureInstanceID, transform, 1, false);
    }

    console.log("Arrayed instance ID " + typicalFixtureInstanceID + " " + placementPointArray.length + " times.");
}

// macro list of all commands related to generating the new string light assemblies
deanstein.GenerateStringLights.execute = function(args)
{
            
    FormIt.UndoManagement.BeginState()
    console.clear();

    // execute the get selection basics routine
    deanstein.GenerateStringLights.getSelectionBasics();

    // if selection is empty, stop
    if (deanstein.GenerateStringLights.getSelectionBasics() === false)
    {
        return;
    }

    // execute the get selection info routine
    deanstein.GenerateStringLights.getSelectionInfo(nHistoryID, currentSelection);

    // set a flag based on whether we precheck
    var preCheckPassed = deanstein.GenerateStringLights.preCheck();

    // if we prechecked, then define the operation type; otherwise, stop
    if (preCheckPassed === true)
    {
        var operationType = deanstein.GenerateStringLights.getOperationType();
    }

    else
    {
        return;
    }

    // if the operation type is a line, we first need to make an arc from scratch, then select it
    if (operationType === "line") 
    {
        console.log("\nLine detected.");

        FormIt.UndoManagement.BeginState();

        // create the new catenary arc, then define the target curve as this new curve
        var vertexIDArrayForRebuild = deanstein.GenerateStringLights.createCatenaryArcFromLine(nHistoryID, args);
        console.log("Vertex ID array for curve to be rebuilt: " + JSON.stringify(vertexIDArrayForRebuild));

        FormIt.UndoManagement.EndState("Create new string light cable arc");
    }

    // if the operation is an arc or circle, set the target curve to the current selection
    if (operationType === "arcCircle")
    {
        console.log("\nArc or circle detected.");

        // define the target curve as the selected curve
        var vertexIDArrayForRebuild = deanstein.GenerateStringLights.arrays.nVertexIDArray;
        console.log("Vertex ID array for curve to be rebuilt: " + JSON.stringify(vertexIDArrayForRebuild));
    }
    
    // rebuild the arc, if enabled
    var bRebuildArc = true;
    console.log("\nRebuild arc/circle? " + bRebuildArc);
    if (bRebuildArc) 
    {
        var facetCount = args.facetCount;

        deanstein.GenerateStringLights.rebuildArcCircle(vertexIDArrayForRebuild, args);
    }

    // execute the get selection basics routine to capture the rebuilt curve
    deanstein.GenerateStringLights.getSelectionBasics();
    console.log("Getting basic info on the rebuilt curve.")

    // execute the get selection info routine to analyze the rebuilt curve
    deanstein.GenerateStringLights.getSelectionInfo(nHistoryID, currentSelection);
    console.log("Updating matrices with new curve information");

    // execute drawing new points along the arc or circle; returns an array of points for use in generating new lights
    deanstein.GenerateStringLights.generatePointsAlongArcCircle(args);

    var placementPointArray = deanstein.GenerateStringLights.generatePointsAlongArcCircle(args);
    var placementPoint = placementPointArray[0];

    // execute drawing a single typical fixture
    var typicalFixtureInstanceID = deanstein.GenerateStringLights.drawSingleLightFixture(placementPoint, args);

    // execute arraying the typical fixture
    deanstein.GenerateStringLights.arrayStringLights(typicalFixtureInstanceID, placementPointArray);

    // get all the group IDs from the array of fixtures
    var fixtureGroupIDArray = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, typicalFixtureInstanceID, WSM.nGroupType, true);

    var fixtureGroupID = fixtureGroupIDArray[0];
    
    // define the group ID that will contain all pieces of the new string light assembly
    var stringLightContainerGroupID = WSM.APICreateGroup(nHistoryID, fixtureGroupID);

    // make a new history for the light fixture group
    var stringLightContainerHistoryID = WSM.APIGetGroupReferencedHistoryReadOnly(nHistoryID, stringLightContainerGroupID);

    // get the instance ID
    var stringLightContainerInstanceID = WSM.APIGetObjectsByTypeReadOnly(stringLightContainerHistoryID, stringLightContainerGroupID, WSM.nInstanceType);

    // sweep the catenary cable
    console.log("Begin sweep of catenary cable...");
    var catenaryCableRadius = args.catenaryCableRadius;

    // define the xAxis
    var xAxis = WSM.Geom.Vector3d(1,0,1);

    // define the yAxis
    var yAxis;
    
    // get the end point of the arc
    var catenaryCableProfileCenterPos = deanstein.GenerateStringLights.arrays.arcCircle3PointPosArray[0];
    //onsole.log("Center point for catenary profile: " + JSON.stringify(catenaryCableProfileCenterPos));

    // create the profile at one of the end points of the catenary curve
    var aProfilePoints = WSM.APICreateCircleOrArc(nHistoryID, catenaryCableRadius, catenaryCableProfileCenterPos);

    // find the face that was just created
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 4);
    console.log("Changed data: " + JSON.stringify(changedData));
    var newProfileFaceID = changedData["created"][0];
    console.log("New profile face ID: " + JSON.stringify(newProfileFaceID));

    var aProfile = [{"ids":[{"History":nHistoryID,"Object":newProfileFaceID,"objectName":"ObjectHistoryID"}], "objectName": "GroupInstancePath"}];

    // construct the path based on the rebuilt curve
    function constructPathArrays()
    {
        // for each edge in the catenary curve, generate a current path to access this edge for sweep
        var pathArray = new Array();
        for (var i = 0; i < deanstein.GenerateStringLights.arrays.nObjectIDArray.length; i++)
        {
            var currentPath = {"ids": [{"History": nHistoryID,"Object": deanstein.GenerateStringLights.arrays.nObjectIDArray[i],"objectName": "ObjectHistoryID"}],"objectName": "GroupInstancePath"};
            pathArray.push(currentPath);
        }
        return pathArray;
    }
    var aPath = constructPathArrays();
    //console.log("Path array: " + JSON.stringify(aPath));
     /*= [{"ids":[{"History":stringLightContainerHistoryID,"Object":cablePathID,"objectName":"ObjectHistoryID"}], "objectName": "GroupInstancePath"}];*/
    var bRemoveUnusedProfileAndPath = true;

    // execute the catenary cable sweep
    WSM.APISweep(nHistoryID, aProfile, aPath, bRemoveUnusedProfileAndPath);

    // find the body that was just created
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 1);
    console.log("Changed data: " + JSON.stringify(changedData));
    var catenaryCableSweepBodyID = changedData["created"][0];
    console.log("catenaryCableSweepBodyID: " + JSON.stringify(catenaryCableSweepBodyID));

    // move the sweep into the main fixture container group
    WSM.APICopyOrSketchAndTransformObjects(nHistoryID, stringLightContainerHistoryID, catenaryCableSweepBodyID, WSM.Geom.MakeRigidTransform(WSM.Geom.Point3d(0, 0, 0), WSM.Geom.Vector3d(1, 0, 0), WSM.Geom.Vector3d(0, 1, 0), WSM.Geom.Vector3d(0, 0, 1)), 1, false);

    // delete the original sweep
    WSM.APIDeleteObject(nHistoryID, catenaryCableSweepBodyID);

    // delete the catenary arc
    for (var i = 0; i < deanstein.GenerateStringLights.arrays.nObjectIDArray.length; i++)
    {
        WSM.APIDeleteObject(nHistoryID, deanstein.GenerateStringLights.arrays.nObjectIDArray[i])
    }

    // if the operation is a spline, we throw an error because this isn't supported yet
    if (operationType === "spline")
    {
        console.log("\nSpline detected.");
        console.log("Splines aren't supported yet, sorry.");
    }

    FormIt.UndoManagement.EndState("Generate String Lights");

}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
    "facetCount": parseFloat(document.a.facetCount.value),
    "arcBulge": parseFloat(document.a.arcBulge.value),
    "lightCount": parseFloat(document.a.lightCount.value),
    "verticalCableOrHousingLength":parseFloat(document.a.verticalCableOrHousingLength.value),
    "bulbRadius":parseFloat(document.a.bulbRadius.value),
    "bulbCount":parseFloat(document.a.bulbCount.value),
    "verticalCableOrHousingRadius":parseFloat(document.a.verticalCableOrHousingRadius.value),
    "catenaryCableRadius":parseFloat(document.a.catenaryCableRadius.value)
    }

    console.log("deanstein.GenerateStringLights.execute");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.GenerateStringLights.execute", args);
}