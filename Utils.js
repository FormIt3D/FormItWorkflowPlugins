// get the distance between two points [x,y,z]
function getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var distance = Math.sqrt((Math.pow((x1-x0),2)) + (Math.pow((y1-y0),2)) + (Math.pow((z1-z0),2)));
    //console.log("Distance: " + distance);
    return distance;
}

// get the midpoint between two points defined by an array [x,y,z]
function getMidPointBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var x = (x0 + x1) / 2;
    var y = (y0 + y1) / 2;
    var z = (z0 + z1) / 2;

    var midPoint = new Array(x, y, z);
    // returns [x,y,z]
    return midPoint;
    //console.log(midPoint);
}

// test each item in the array, compare it to its siblings for equality, and return a new array containing the results
function testForIdentical(array) 
{
    var bArray = [];
    for (var k = 0; k < array.length - 1; k++)
    {
        if (array[k] === array[k + 1])
        {
            bArray.push(true);
        }
        if (array[k] != array[k + 1])
        {
            bArray.push(false);
        }
    }
    //console.log(message + bArray);
    return bArray;
}

// true only if all booleans evaluated are true
function booleanReduce(array)
{
    function isTrue(bool) 
    {
        if (bool === true) 
        {
            return true;
        }
        else 
        {
            return false;
        }
    }
    
    if (array.every(isTrue))
    {
        return true;
    }
    else 
    {
        return false;
    }
}

// true only if ANY of the booleans evaluated in the array are true
function booleanAnyTrue(array)
{
    for(var i = 0; i < array.length; i++)
    {
        var bool = array[i];
        if (bool === true) 
        {
            return true;
        }
    }
}

// search through an array, and return an array of only unique values
function getUniqueValuesInArray(array)
{
    var uniqueArray = [];
    var count = 0;
    
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
    //console.log("Array of unique values: " + uniqueArray);
    return uniqueArray;
}

// flatten a multi-dimensional array into a 1D array
function flattenArray(array)
{
    return array.reduce(function (flat, toFlatten) 
    {
        return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
    }, []);
}

// get the vector between two points [x,y,z]
function getVectorBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var vector = new Array(x1-x0, y1-y0, z1-z0);
    return vector;
}

// get the normalized vector between two points [x,y,z]
function getNormalizedVectorBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var magnitude = getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
    var vector = new Array((x1-x0)/magnitude, (y1-y0)/magnitude, (z1-z0)/magnitude);
    return vector;
}

// get the cross product of two vectors
function crossProductVector(vector0, vector1)
{
    var crossProductVectorX = (vector0[1]*vector1[2] - vector0[2]*vector1[1]);
    var crossProductVectorY = (vector0[2]*vector1[0] - vector0[0]*vector1[2]);
    var crossProductVectorZ = (vector0[0]*vector1[1] - vector0[1]*vector1[0]);
    var crossProductVector = [crossProductVectorX, crossProductVectorY, crossProductVectorZ];
    return crossProductVector;
}

// multiply a vector by a quaternion
function multiplyVectorByQuaternion(vectorX, vectorY, vectorZ, quatX, quatY, quatZ, quatW)
{
    var ssvv = (quatW * quatW) - ((quatX * quatX) + (quatY * quatY) + (quatZ * quatZ));
    var vr = ((quatX * vectorX) + (quatY * vectorY) + (quatZ * vectorZ)) * 2.;
    var s = quatW * 2;
    var tmpX = (ssvv * vectorX) + (vr * quatX) + (s * ((quatY * vectorZ) - (quatZ * vectorY)));
    var tmpY = (ssvv * vectorY) + (vr * quatY) + (s * ((quatZ * vectorX) - (quatX * vectorZ)));
    var tmpZ = (ssvv * vectorZ) + (vr * quatZ) + (s * ((quatX * vectorY) - (quatY * vectorX)));

    vector = new Array(tmpX, tmpY, tmpZ);
    return vector;
}

// get the magnitude of a vector
function vectorMagnitude(vector)
{
    var vectorMagnitude = Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));
    return vectorMagnitude;
}

// scale a vector
function scaleVector(vector, scalar)
{
    scaledVector = new Array(vector[0] * scalar, vector[1] * scalar, vector[2] * scalar);
    return scaledVector;
}

// normalize a vector
function normalizeVector(vector)
{
    var magnitude = vectorMagnitude(vector);
    var normalizedVector = new Array(vector[0]/magnitude, vector[1]/magnitude, vector[2]/magnitude);
    return normalizedVector;
}

// get the dot product of two vectors
function dotProductVector(vector0, vector1)
{
    var vector0Magnitude = vectorMagnitude(vector0);
    var vector1Magnitude = vectorMagnitude(vector1);
    var dotProduct = (vector0[0]/vector0Magnitude * vector1[0]/vector1Magnitude) + (vector0[1]/vector0Magnitude * vector1[1]/vector1Magnitude) + (vector0[2]/vector0Magnitude * vector1[2]/vector1Magnitude);
    return dotProduct;
}

// get the angle in radians between two 3D vectors
function angleBetweenVectors(vector0, vector1)
{
    var normalizedVector0 = normalizeVector(vector0);
    var normalizedVector1 = normalizeVector(vector1);
    var dotProductVector = dotProductVector(normalizedVector0, normalizedVector1);
    angle = Math.acos(dotProductVector)
    return angle;
}

// get the angle in radians between two 2D vectors
function angleBetween2DVectors(vector0, vector1)
{
    angle = Math.acos(dotProductVector(vector0, vector1));
    return angle;
}

