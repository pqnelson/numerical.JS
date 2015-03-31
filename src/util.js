/**
 * Helper functions used in numerical routines.
 * 
 * @author Alex Nelson
 * @email pqnelson@gmail.com
 * @date 1 October 2014
 */
var exports = module.exports = {};
var DoubleConsts = require('./DoubleConsts.js');

function sgn(x) {
    if (x < 0) return -1;
    if (x > 0) return +1;
    if (x===0) return 0;
    return NaN;
}


/*********************
 * Utility functions *
 *********************/

var isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201);
var isBigEndian = !isLittleEndian;

function computeEpsilon() {
    if (Number.EPSILON) return Number.EPSILON;
    var k = 1.0;
    while (1.0 !== 1.0+k) {
        k = k*0.5;
    }
    return k;
}

/** Machine epsilon, either given as Number.epsilon or computed from
 *  scratch
 *  @constant
 *  @type {number}
 *  @default
 */
const machineEpsilon = computeEpsilon();
/** The squareroot of machine epsilon
 *  @constant
 *  @type {number}
 *  @default
 */
const sqrtEpsilon = Math.sqrt(machineEpsilon);

/**
 * @todo fix getNumberParts and fromNumberParts to work with Big &
 *       Little Endian numbers
 * taken from @link {http://stackoverflow.com/a/17156580/1296973}
 */
function getNumberParts(x) {
    var float = new Float64Array(1);

    float[0] = x;

    var sign = float.buffer[7] >> 7,
        exponent = ((float.buffer[7] & 0x7f) << 4 | float.buffer[6] >> 4)
                    - DoubleConsts.EXP_BIAS;

    float.buffer[7] = 0x3f;
    float.buffer[6] |= 0xf0;

    return {
        sign: sign,
        exponent: exponent,
        signficand: float[0],
    }
}

function setExponent(f, exponent) {
    var e = exponent+DoubleConsts.EXP_BIAS;
    f.buffer[7] |= (e >> 4);
    f.buffer[6] |= (e & 0x0F) << 4;
    return f;
}


function toggleSignBit(floatArray, isNegative) {
    if (isNegative) {
        floatArray.buffer[7] |= 0x80;
    }
    return floatArray;
}

function clearExponent(f) {
    f.buffer[7] = 0;
    f.buffer[6] &= 0x0f;
    return f;
}

function fromNumberParts(sign, m, exponent) {
    var isNegative = (sign === 1);
    if (exponent > DoubleConsts.MAX_EXPONENT)
        return (isNegative? -Infinity : Infinity);
    
    var f = new Float64Array(1);
    f[0] = m;
    f = clearExponent(f);
    f = toggleSignBit(f, isNegative);
    
    f = setExponent(f, exponent);
    return f[0];
}

function copySign(magnitude, sign) {
    if (sgn(magnitude)===sgn(sign)) return magnitude;

    var f = getNumberParts(magnitude);
    if (f.sign === 0)
        return fromNumberParts(1, f.significand, f.exponent);
    if (f.sign === 1)
        return fromNumberParts(0, f.significand, f.exponent);
}

function getExponent(x) {
    return getNumberParts(x).exponent;
}

function abs(x) {
    if (x < 0) return -x;
    return x;
}

/**
 * Return {@code d} &times; 2<sup>{@code scaleFactor}</sup> rounded
 * as if performed by a single correctly rounded floating-point multiply
 * to a member of the double value set.
 *
 * If the exponent of the result is between -1023 and 1024, the
 * answer is calculated exactly.  If the exponent of the result
 * would be larger than {@code Double.MAX_EXPONENT}, an
 * infinity is returned.  Note that if the result is subnormal,
 * precision may be lost; that is, when {@code scalb(x, n)}
 * is subnormal, {@code scalb(scalb(x, n), -n)} may not equal
 * <i>x</i>.  When the result is non-NaN, the result has the same
 * sign as {@code d}.
 *
 * <p>Special cases:
 * <ul>
 * <li> If the first argument is NaN, NaN is returned.
 * <li> If the first argument is infinite, then an infinity of the same
 * sign is returned. 
 * <li> If the first argument is zero, then a zero of the same
 * sign is returned.
 * </ul>
 * @param d number to be scaled by a power of two.
 * @param scaleFactor power of 2 used to scale {@code d}
 * @return {@code d} &times; 2<sup>{@code scaleFactor}</sup>
 */
// Consider using the http://grepcode.com/file/repo1.maven.org/maven2/org.apache.commons/commons-math/2.2/org/apache/commons/math/util/FastMath.java#FastMath.scalb%28float%2Cint%29
function scalb(d, scaleFactor) {
    if (isNaN(d) || d == 0 || !isFinite(d))
        return d;
    if (scaleFactor < -2098)
        return (d > 0 ? 0.0 : -0.0);
    if (scaleFactor > 2097)
        return (d > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
    var dNumberParts = getNumberParts(d);
    return fromNumberParts(dNumberParts.sign,
                           dNumberParts.significand,
                           dNumberParts.exponent+scaleFactor);
}

/**
 * Uses Knuth 2.2's method of comparing floating point numbers.
 *
 * If (x < y),    return -1
 *    (x > y),    return +1
 *    (x "eq" y), return  0
 */
function floatCompare(x, y, eps) {
    if (!eps) eps = sqrtEpsilon;
    var exponent = getExponent(abs(x) > abs(y) ? x : y);
    var delta = scalb(eps, exponent);
    var diff = x - y;
    if (diff > delta) return 1;
    if (diff < -delta) return -1;
    return 0;
}

/**
 * @param x, y
 * @returns true if they are "equal", false otherwise
 */
function floatEquals(x, y, eps) {
    return (floatCompare(x, y, eps) === 0);
}

/**
 * Horner's method will take an array of coefficients, and return a
 * function which evaluates the polynomial at the given point.
 */
function horner(coefficients) {
    var n = coefficients.length - 1;

    var fn = function(x) {
        var ret = coefficients[n];
        for(var k = n-1; k > -1; k--) {
            ret = coefficients[k] + x*ret;
        }
        return ret;
    }

    return fn;
}

/**
 * Returns 2^n without doing any multiplication.
 * @param n, some integer
 */
function powerOfTwoD(n) {
    return fromNumberParts(0, 1, n);
}
exports.powerOfTwoD = powerOfTwoD;
exports.isLittleEndian = isLittleEndian;
exports.isBigEndian = isBigEndian;
exports.sgn = sgn;
exports.sqrtEpsilon = sqrtEpsilon;
exports.machineEpsilon = machineEpsilon;
exports.horner = horner;
exports.abs = abs;
exports.getNumberParts = getNumberParts;
exports.fromNumberParts = fromNumberParts;
exports.copySign = copySign;
exports.scalb = scalb;
exports.floatCompare = floatCompare;
exports.floatEquals = floatEquals;
