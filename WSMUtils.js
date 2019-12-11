// convert a point at XYZ to a WSM Point3d
function convertCoordinateArrayToWSMPoint3d(coordinateArray)
{
    var point3d = WSM.Geom.Point3d(coordinateArray[0], coordinateArray[1], coordinateArray[2]);
    return point3d;
}

// convert a vector to a WSM Vector3d
function convertVectorToWSMVector3d(vector)
{
    var vector3d = WSM.Geom.Vector3d(vector[0], vector[1], vector[2]);
    return vector3d;
}