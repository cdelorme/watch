
/**
 * watch_test.js
 *
 * @author Casey DeLorme <cdelorme@gmail.com>
 * @date 2014-04-30
 *
 * @description
 * An OOP watch module using the newer fs.watch api
 * with accessible cache, and whitelist filtration
 */

/**
 * requirements
 */
var fs, path, watch, mocha, q, chai, assert;
fs = require('fs');
path = require('path');
watch = require('../lib/watch.js');
mocha = require('mocha');
q = require('q');
chai = require('chai');
assert = chai.assert;

