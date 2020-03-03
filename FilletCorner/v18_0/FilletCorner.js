if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.FilletCorner = function(args)
{
    //args = JSON.parse(args);
    var radius = FormIt.PluginUtils.currentUnits(args.radius);
    var cleanup = args.cleanup;

    console.clear();
    console.log("Fillet Corner");

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    //console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));

    FormIt.UndoManagement.BeginState();
    // for each object selected, get the vertexIDs
    for (var j = 0; j < currentSelection.length; j++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[j]["ids"].length) -1;
        //console.log("Current history depth: " + historyDepth);

        // get objectID of the current selection
        var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];

        // get vertexIDs in the current selection
        var nVertexIDs = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nObjectID,WSM.nVertexType,false);
        for (var i = 0; i < nVertexIDs.length; i++)
        {
            var nVertexID = nVertexIDs[i];
            //console.log("Vertex ID of current selection (point0): " +  JSON.stringify(nVertexID));
            blendVertex(nHistoryID, nVertexID, radius, cleanup);
        }
    }
    FormIt.UndoManagement.EndState("Fillet Corner Plugin");
}

function blendVertex(nHistoryID, nVertexID, radius, cleanup) 
{
    // fillet will only work on vertices with 2 attached edges
    var requiredEdgeCount = 2;

    // define the current vertex as point0
    //console.log("---------- define point0 ----------")
    var point0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,nVertexID);
    //console.log("point0 = " + JSON.stringify(point0));

    var pointX0 = point0["x"];
    //console.log("pointX0 = " + JSON.stringify(pointX0));
    var pointY0 = point0["y"];
    //console.log("pointY0 = " + JSON.stringify(pointY0));
    var pointZ0 = point0["z"];
    //console.log("pointZ0 = " + JSON.stringify(pointZ0));

    // get edge IDs attached to point0
    var nEdgeType = WSM.nEdgeType;
    var edgeIDArray = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nVertexID,nEdgeType,true);
    //console.log("Edge IDs attached to point0: " +  JSON.stringify(edgeIDArray));

    // calculate how many edges are attached to point0
    var numberOfEdges = edgeIDArray.length;
    //console.log("Number of edges attached to point0: " + numberOfEdges);
    //console.log("");

    // check if the number of edges attached to vertex is equal to the requirement
    if (numberOfEdges == requiredEdgeCount)
        {
            var remainingVertexIds = [];

            // for each edge, get the vertex IDs
            for (var i = 0; i <= numberOfEdges - 1; i++)
                {
                    // for each edge, returns an array of vertices
                    var getVertexIds = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, edgeIDArray[i], WSM.nVertexType, false);
                    //console.log("Reading these vertex IDs from edge " + edgeIDArray[i] + ": " + JSON.stringify(getVertexIds));

                    // check if vertex IDs are equal to point0 ID; if they are, push to a new array for add'l processing
                    if (getVertexIds[0] == nVertexID)
                        {
                            remainingVertexIds.push(getVertexIds[1]);
                        }
                    if (getVertexIds[1] == nVertexID)
                        {
                            remainingVertexIds.push(getVertexIds[0]);
                        }
                }
            //console.log("Use these remaining points for analysis: " + remainingVertexIds);

            // get IDs for points 1 and 2
            var point1Id = remainingVertexIds[0];
            var point2Id = remainingVertexIds[1];

            // define point 1
            //console.log("---------- define point1 ----------")
            var point1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,point1Id);
            //console.log("point1 = " + JSON.stringify(point1));

            var pointX1 = point1["x"];
            //console.log("pointX1 = " + JSON.stringify(pointX1));
            var pointY1 = point1["y"];
            //console.log("pointY1 = " + JSON.stringify(pointY1));
            var pointZ1 = point1["z"];
            //console.log("pointZ1 = " + JSON.stringify(pointZ1));
           //console.log("");

            // define point 2
            //console.log("---------- define point2 ----------")
            var point2 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,point2Id);
            //console.log("point2 = " + JSON.stringify(point2));

            var pointX2 = point2["x"];
            //console.log("pointX2 = " + JSON.stringify(pointX2));
            var pointY2 = point2["y"];
            //console.log("pointY2 = " + JSON.stringify(pointY2));
            var pointZ2 = point2["z"];
            //console.log("pointZ2 = " + JSON.stringify(pointZ2));
            //console.log("");

            // identify delta values
            var x1Delta = pointX1 - pointX0;
            var y1Delta = pointY1 - pointY0;
            var z1Delta = pointZ1 - pointZ0;

            var x2Delta = pointX2 - pointX0;
            var y2Delta = pointY2 - pointY0;
            var z2Delta = pointZ2 - pointZ0;

            // calculate d1 length
            var d1Length = Math.pow((Math.pow(x1Delta, 2) + Math.pow(y1Delta, 2) + Math.pow(z1Delta, 2)), 0.5);
            //console.log("d1Length = " + d1Length);

            // calculate d1 vectors
            var d1x = x1Delta/d1Length;
            //console.log("d1x = " + d1x);
            var d1y = y1Delta/d1Length;
            //console.log("d1y = " + d1y);
            var d1z = z1Delta/d1Length;
            //console.log("d1z = " + d1z);
            //console.log("");

            // calculate d2 length
            var d2Length = Math.pow((Math.pow(x2Delta, 2) + Math.pow(y2Delta, 2) + Math.pow(z2Delta, 2)), 0.5);
            //console.log("d2Length = " + d2Length);

            // calculate d2 vectors
            var d2x = x2Delta/d2Length;
            //console.log("d2x = " + d2x);
            var d2y = y2Delta/d2Length;
            //console.log("d2y = " + d2y);
            var d2z = z2Delta/d2Length;
            //console.log("d2z = " + d2z);
            //console.log("");

            // calculate d1 and d2 dot product
            var d1d2DotProduct = (d1x * d2x) + (d1y * d2y) + (d1z * d2z);
            //console.log("d1d2DotProduct = " + d1d2DotProduct);

            // calculate angle theta
            var angleTheta = Math.acos(d1d2DotProduct);
            //console.log("angleTheta = " + angleTheta);
            var angleThetaDegrees = angleTheta * (180/Math.PI);
            //console.log("angleThetaDegrees = " + angleThetaDegrees);

            // USER: set the desired radius
            //radius = 10

            // calculate distance needed from point0 for arc endpoimts
            var travelDistance = radius/Math.tan(angleTheta/2);
            //console.log("travelDistance = " + travelDistance);

            // define new point1
            var newPointX1 = pointX0 + (d1x * travelDistance);
            var newPointY1 = pointY0 + (d1y * travelDistance);
            var newPointZ1 = pointZ0 + (d1z * travelDistance);
            //console.log("newPoint1 (xyz) = " + newPointX1 + ", " + newPointY1 + ", " + newPointZ1);

            // create newPoint1
            var newPoint1 = WSM.Geom.Point3d(newPointX1, newPointY1, newPointZ1);

            // draw the line between the point0 and newPoint1 for visualization
            //WSM.APIConnectPoint3ds(nHistoryID, point0, newPoint1);

            // define new point2
            var newPointX2 = pointX0 + (d2x * travelDistance);
            var newPointY2 = pointY0 + (d2y * travelDistance);
            var newPointZ2 = pointZ0 + (d2z * travelDistance);
            //console.log("newPoint2 (xyz) = " + newPointX2 + ", " + newPointY2 + ", " + newPointZ2);

            // create newPoint2
            var newPoint2 = WSM.Geom.Point3d(newPointX2, newPointY2, newPointZ2);

            // draw the line between the point0 and newPoint2 for visualization
            //WSM.APIConnectPoint3ds(nHistoryID, point0, newPoint2);

            // calculate midpoint between newPoint1 and newPoint2
            var midPointX = ((newPointX1 + newPointX2)/2);
            var midPointY = ((newPointY1 + newPointY2)/2);
            var midPointZ = ((newPointZ1 + newPointZ2)/2);
            //console.log("midPoint (xyz) = " + midPointX + ", " + midPointY + ", " + midPointZ)

            // identify delta values
            var midPointDeltaX = midPointX - pointX0;
            var midPointDeltaY = midPointY - pointY0;
            var midPointDeltaZ = midPointZ - pointZ0;

            // calculate distance from midpoint to point0
            var midPointLength = Math.pow((Math.pow(midPointDeltaX, 2) + Math.pow(midPointDeltaY, 2) + Math.pow(midPointDeltaZ, 2)), 0.5);
            //console.log("midPointLength = " + midPointLength);

            // calculate the distance from midPoint to centerPoint
            var midPointCenterPointDistance = radius * (Math.sin(angleTheta/2));
            //console.log("midPointCenterPointDistance = " + midPointCenterPointDistance);

            // calculate the centerPoint
            var centerPointX = midPointX + (midPointCenterPointDistance - radius) * ((midPointX - pointX0)/midPointLength);
            var centerPointY = midPointY + (midPointCenterPointDistance - radius) * ((midPointY - pointY0)/midPointLength);
            var centerPointZ = midPointZ + (midPointCenterPointDistance - radius) * ((midPointZ - pointZ0)/midPointLength);
            //console.log("centerPoint (xyz) = " + centerPointX + ", " + centerPointY + ", " + centerPointZ)

            // create centerPoint
            var centerPoint = WSM.Geom.Point3d(centerPointX,centerPointY,centerPointZ);

            // FormIt v18 and newer has a global curve faceting setting - use that here
            var nCurveFacets = FormIt.Model.GetCurveAccuracyOrCountCurrent();
            
            // create new arc
            WSM.APICreateCircleOrArcFromPoints(nHistoryID, newPoint1, newPoint2, centerPoint, nCurveFacets);
            console.log("Successfully created a new arc with radius " + radius + " at vertexID " + nVertexID + ".");

            // delete the vertex if the option is checked
            if (cleanup) 
            {
                WSM.APIDeleteObject(nHistoryID,nVertexID);
                console.log("Deleted vertexID " + nVertexID);
            }
        }
    else 
        {
            console.log("Error: too few or too many edges attached at this vertex (vertexID: " + nVertexID + ").");
        }
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    "radius": parseFloat(document.a.radius.value),
    "cleanup": document.a.cleanup.checked
    }

    //console.log("deanstein.FilletCorner");
    //console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.FilletCorner", args);
}
