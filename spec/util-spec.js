var util = require('../src/util');
var DoubleConsts = require('../src/DoubleConsts');

var Gelfond = Math.pow(Math.E, Math.PI);
var MAX_SCALE = DoubleConsts.MAX_EXPONENT + -DoubleConsts.MIN_EXPONENT
                + DoubleConsts.SIGNIFICAND_WIDTH + 1;
var Double_MAX_VALUEmm = "1.7976931348623155E308";
var Double_MAX_SUBNORMAL = "2.225073858507201E-308";
var Double_MAX_SUBNORMALmm = "2.2250738585072004E-308";

describe("getNumberParts() tests", function() {
    var checkNumber = function(x) {
        var parts = util.getNumberParts(x);
        return Math.pow(-1, parts.sign)*Math.pow(2, parts.exponent)*parts.significand;
    }
    it("should handle one", function () {
        expect(1).toBe(checkNumber(1));
    });
    it("should handle negative numbers", function() {
        expect(-1).toBe(checkNumber(-1));
    });
    it("should handle transcendental numbers", function() {
        expect(Math.PI).toBe(checkNumber(Math.PI));
        expect(Math.E).toBe(checkNumber(Math.E));
        expect(Gelfond).toBe(checkNumber(Gelfond));
    });
    it("should handle infinities", function() {
        expect(Infinity).toBe(checkNumber(Infinity));
        expect(-Infinity).toBe(checkNumber(-Infinity));
    });
});

describe("fromNumberParts() tests", function() {
    var checkNumber = function(x) {
        var parts = util.getNumberParts(x);
        return util.fromNumberParts(parts.sign, parts.significand, parts.exponent);
    }
    it("should handle one", function () {
        expect(1).toBe(checkNumber(1));
    });
    it("should handle negative numbers", function() {
        expect(-1).toBe(checkNumber(-1));
    });
    it("should handle transcendental numbers", function() {
        expect(Math.PI).toBe(checkNumber(Math.PI));
        expect(Math.E).toBe(checkNumber(Math.E));
        expect(Gelfond).toBe(checkNumber(Gelfond));
    });
    it("should handle infinities", function() {
        expect(Infinity).toBe(checkNumber(Infinity));
        expect(-Infinity).toBe(checkNumber(-Infinity));
    });
});

describe("scalb() function", function() {
    function scalbTest(value, scaleFactor, expected) {
        expect(util.scalb(value, scaleFactor)).toBe(expected);
        expect(util.scalb(-value, scaleFactor)).toBe(-expected);
    }
    var identityCases = [-0.0, +0.0, Infinity];
    var subnormalCases = [Number.MIN_VALUE,
                          3.0*Number.MIN_VALUE,
                          Double_MAX_SUBNORMALmm,
                          Double_MAX_SUBNORMAL,
                          DoubleConsts.MIN_NORMAL];
    var someTestCases = [1.0,
                         2.0,
                         3.0,
                         Math.PI,
                         Double_MAX_VALUEmm,
                         Number.MAX_VALUE];
    
    var oneMultiplyScalingFactors = [DoubleConsts.MIN_EXPONENT,
                                     DoubleConsts.MIN_EXPONENT+1,
                                     -3,
                                     -2,
                                     -1,
                                     0,
                                     1,
                                     2,
                                     3,
                                     DoubleConsts.MAX_EXPONENT-1,
                                     DoubleConsts.MAX_EXPONENT];
    var manyScalingFactors = ["-2147483648", // Integer.MIN_VALUE
                              "-2147483647",
                              -MAX_SCALE-1,
                              -MAX_SCALE,
                              -MAX_SCALE+1,
                              2*DoubleConsts.MIN_EXPONENT-1,
                              2*DoubleConsts.MIN_EXPONENT,
                              2*DoubleConsts.MIN_EXPONENT+1,
                              -2,
                              -1,
                              0,
                              1,
                              2,
                              DoubleConsts.MAX_EXPONENT-1,
                              DoubleConsts.MAX_EXPONENT,
                              DoubleConsts.MAX_EXPONENT+1,
                              2*DoubleConsts.MAX_EXPONENT-1,
                              2*DoubleConsts.MAX_EXPONENT,
                              2*DoubleConsts.MAX_EXPONENT+1,
                              MAX_SCALE-1,
                              MAX_SCALE,
                              MAX_SCALE+1,
                              "2147483646",
                              "2147483647"]; // Integer.MAX_VALUE

    it("should handle identity cases", function() {
        for(var i = 0; i < manyScalingFactors.length; i++) {
            expect(util.scalb(NaN, manyScalingFactors[i])).toBeNaN();
            expect(util.scalb(-NaN, manyScalingFactors[i])).toBeNaN();
            for(var j = 0; j < identityCases.length; j++) {
                scalbTest(identityCases[j], manyScalingFactors[i], identityCases[j]);
            }
        }
    });
    it("should handle cases where result is 0.0 or infinity due to magnitude",
       function() {
           for(var i=0; i<someTestCases.length; i++) {
               for(var j=0; j<manyScalingFactors.length; j++) {
                   var scaleFactor = manyScalingFactors[j];
                   if (util.abs(scaleFactor) >= MAX_SCALE) {
                       var val = someTestCases[i];
                       var result = (scaleFactor > 0 ?
                                     (val > 0 ? Infinity : -Infinity)
                                     : (val > 0 ? 0.0 : -0.0));
                       scalbTest(val, scaleFactor, result);
                   }
               }
           }
       });
    it("should handle cases done with one floating-point multiply",
       function() {
           for(var i=0; i<someTestCases.length; i++) {
               for(var j=0; j<oneMultiplyScalingFactors.length; j++) {
                   var scaleFactor = oneMultiplyScalingFactors[j];
                   var val = someTestCases[i];
                   var result = val*util.powerOfTwoD(scaleFactor);
                   scalbTest(val, scaleFactor, result);
               }
           }
       });
});
