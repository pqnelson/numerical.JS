/**
 * Root finding methods for functions of a single variable.
 *
 * @author Alex Nelson
 * @email pqnelson@gmail.com
 * @date 29 September 2014
 */

var exports = module.exports = {};

require('./util');

/**
 * My todo list...
 * @todo add unit tests!
 * @todo make sure Newton's method won't cause problems with the dy/y code
 */


/**********************************
 * Root finding algorithms        *
 **********************************/
var rootFinding = {};

function bisection(fn, a, b) {
    if (sgn(fn(a)) === sgn(fn(b)))
        return undefined;

    var midpoint;
    var n;
    for(n = 0; n < 53; n++) {
        midpoint = (a + b)*0.5;
        if(fn(midpoint)===0.0 || (b - a)*0.5 < tolerance)
            return midpoint;
        else if (sgn(fn(a))===sgn(fn(midpoint)))
            a = midpoint;
        else
            b = midpoint;
    }
    return midpoint;
}

function secantMethod(fn, a, b) {
    var tmp, x, xPrime, y, yPrime;
    x = a;
    xPrime = (b ? b : a + sqrtEpsilon);
    y = fn(x);
    yPrime = fn(xPrime);
    for(var n = 0; n < 13; n++) {
        if (floatEquals(y, 0.0))
            return x;
        // avoid roundoff errors with this approach
        tmp = (x*yPrime - xPrime*y)/(yPrime - y);
        y = yPrime;
        x = xPrime;
        xPrime = tmp;
        yPrime = fn(xPrime);
    }
    return xPrime;
}

function newtonRootMethod(fn, df, initialGuess) {
    var tmp, y, dy, x;
    x = initialGuess;
    for(var n = 0; n < 9; n++) {
        dy = df(x);
        y = fn(x);
        // @todo should check that dy/y isn't going to cause problems
        x = x - (y/dy);
    }
    return x;
}

rootFinding.bisection = bisection;
rootFinding.secant = secantMethod;
rootFinding.newton = newtonRootMethod;

exports.bisection = bisection;
exports.newton = newtonRootMethod;
exports.secant = secantMethod;
exports.root = rootFinding;
