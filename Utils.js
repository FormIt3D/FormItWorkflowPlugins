
//generic function to get the distance between two points [x,y,z]
function getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var distance = Math.sqrt((Math.pow((x1-x0),2)) + (Math.pow((y1-y0),2)) + (Math.pow((z1-z0),2)));
    //console.log("Distance: " + distance);
    return distance;
}

// generic function to get the vector between two points [x,y,z]
function getVectorBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var vector = new Array(x1-x0, y1-y0, z1-z0);
    return vector;
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

// generic function to test each item in the array, compare for equality, and return a new array containing boolean values
function testForIdentical(array, bArray, message) 
{
    for (var k = 0; k < array.length - 1; k++)
    {
        if (array[k] === array[k+1])
        {
            bArray.push(true);
        }
        if (array[k] != array[k+1])
        {
            bArray.push(false);
        }
    }
    //console.log(message + bArray);
}

// generic function that returns true only if all booleans evaluated are true
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

// generic function that returns true only if ANY of the booleans evaluated in the array are true
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

function flattenArray(array)
{
    return array.reduce(function (flat, toFlatten) 
    {
        return flat.concat(Array.isArray(toFlatten) ? deanstein.GenerateStringLights.flatten(toFlatten) : toFlatten);
    }, []);
}

function crossProductVector(vector0, vector1)
{
    var crossProductVectorX = (vector0[1]*vector1[2] - vector0[2]*vector1[1]);
    var crossProductVectorY = (vector0[2]*vector1[0] - vector0[0]*vector1[2]);
    var crossProductVectorZ = (vector0[0]*vector1[1] - vector0[1]*vector1[0]);
    var crossProductVector = [crossProductVectorX, crossProductVectorY, crossProductVectorZ];
    return crossProductVector;
}

function vectorMagnitude(vector)
{
    var vectorMagnitude = Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));
    return vectorMagnitude;
}

function dotProductVector(vector0, vector1)
{
    var vector0Magnitude = vectorMagnitude(vector0);
    var vector1Magnitude = vectorMagnitude(vector1);
    var dotProduct = (vector0[0]/vector0Magnitude * vector1[0]/vector1Magnitude) + (vector0[1]/vector0Magnitude * vector1[1]/vector1Magnitude) + (vector0[2]/vector0Magnitude * vector1[2]/vector1Magnitude);
    return dotProduct;
}