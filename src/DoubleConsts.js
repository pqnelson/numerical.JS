/**
 * Various constants related to IEEE 64-bit double 
 * precision. Inspired/borrowed from Java's sun.misc.DoubleConsts
 * 
 * @author Alex Nelson
 * @email pqnelson@gmail.com
 * @date 11 October 2014
 */

var exports = module.exports = {};

/**
 * A constant holding the smallest positive normal value of type double,
 * 2^-1022. It is equal to the value returned by
 * Double.longBitsToDouble(0x0010000000000000L). 
 */
const MIN_NORMAL = 2.2250738585072014E-308;
/**
 * Specifies the smallest exponent for a double, -1022, in hexadecimal.
 */
const MIN_EXPONENT = -0x3FE;
/**
 * Specifies the largest exponent for a double, 1023, in hexadecimal.
 */
const MAX_EXPONENT = 0x3FF;
/**
 * Specifies the bias for the exponent, 1023, in hexadecimal.
 */
const EXP_BIAS = 0x3FF;
/**
 * Specifies the bits in the Mantissa, 53 for a Double, in hexadecimal.
 */
const SIGNIFICAND_WIDTH = 0x35;
/**
 * Specifies bits where the exponent "lives" in a Double, in hexadecimal.
 * @todo make this endian-independent.
 */
const EXP_BIT_MASK = "0x7ff0000000000000";
const SIGN_BIT_MASK = "0x8000000000000000";
const SIGNIF_BIT_MASK = "0x000FFFFFFFFFFFFF";
const MAX_VALUE = 1.7976931348623157E308;
const MIN_VALUE = 4.9E-324;
const MIN_SUB_EXPONENT = MIN_EXPONENT - (SIGNIFICAND_WIDTH - 1);

exports.EXP_BIAS = EXP_BIAS;
exports.EXP_BIT_MASK = EXP_BIT_MASK;

exports.MAX_EXPONENT = MAX_EXPONENT;
exports.MAX_VALUE = MAX_VALUE;

exports.MIN_EXPONENT = MIN_EXPONENT;
exports.MIN_NORMAL = MIN_NORMAL;
exports.MIN_SUB_EXPONENT = MIN_SUB_EXPONENT;
exports.MIN_VALUE = MIN_VALUE;

exports.NaN = NaN;
exports.NEGATIVE_INFINITY = -Infinity;
exports.POSITIVE_INFINITY = Infinity;

exports.SIGN_BIT_MASK = SIGN_BIT_MASK;
exports.SIGNIF_BIT_MASK = SIGNIF_BIT_MASK;
exports.SIGNIFICAND_WIDTH = SIGNIFICAND_WIDTH;
