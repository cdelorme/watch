
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

/**
 * variables
 */
var watch_directory = path.join(__dirname, 'data');


/**
 * tests
 */
describe('test watch', function() {
    it('should be defined', function(done) {
        var monitor = watch.start(watch_directory);
        assert.isDefined(monitor);
        done();
    })
    it('should emit walked with at least one (the parent) directory', function(done) {
        var monitor = watch.start(watch_directory);
        monitor.on('walked', function() {
            assert.isTrue(Object.keys(monitor.directories).length > 0);
            done();
        });
    })
});
