
/**
 * watch.js
 * An OOP watch module using the newer fs.watch api
 * with accessible cache, and whitelist filtration
 *
 * @module cdelorme-watch
 * @file oop fs.watch wrapper
 * @author Casey DeLorme <cdelorme@gmail.com>
 * @date 2014-04-30
 * @requires fs
 * @requires path
 * @requires events
 */


/**
 * requirements
 */
var fs, path, events;
fs = require('fs');
path = require('path');
events = require('events');


/**
 * @class Monitor
 * @classdesc fs.watch wraper provides asynchronous interface to events
 * @event Monitor#walked notifies that the directory walk completed
 * @event Monitor#added notifies that a file has been added
 * @event Monitor#modified notifies that a file has been modified
 * @event Monitor#deleted notifies that a file has been deleted
 * @constructor
 */
var Monitor = function(directory, options) {
    this.directory = path.resolve(directory || '');
    for (var property in options) {
        this.options[property] = options[property];
    }
    !this.options.lazy && this.walk(this.directory) || this.watch(this.directory);
};
Monitor.prototype = new events.EventEmitter();
Monitor.prototype.directories = {};
Monitor.prototype.files = {};
Monitor.prototype.options = {
    'lazy': false,
    'ignoreDotFiles': true
};
Monitor.prototype.watch = function(directory, stats) {
    var stats = stats || {};
    var monitor = this;
    if (!this.directories[directory]) {
        var w = fs.watch(directory, this.options, function(action, file) {
            monitor.notified(action, file, directory);
        });
        this.directories[directory] = { 'stats': stats, 'w': w };
    } else {
        this.directories[directory].stats = stats;
    }
};
Monitor.prototype.unwatch = function(directory) {
    if (this.directories[directory]) {
        this.directories[directory].w.close();
        delete this.directories[directory];
    }
};
Monitor.prototype.empty = function() {
    for (var d in this.directories) {
        this.unwatch(d);
    }
    this.files = {};
    this.watch(this.directory);
};
Monitor.prototype.walk = function(directory, stats) {
    this.walked = this.walked || { 'loaded': 0, 'total': 0 };
    if (this.walked && this.walked.done) {
        this.empty();
        this.walked = { 'loaded': 0, 'total': 0 };
    }
    this.walked.total++;
    this.watch(directory, stats);
    var monitor = this;
    fs.readdir(directory, function(err, files) {
        if (err) return;
        monitor.walked.total += files.length;
        for (var file in files) {
            var fullname = path.resolve(path.join(directory, files[file]));
            if (!monitor.options.filter || monitor.options.filter(fullname)) {
                (function() {
                    var name = fullname;
                    fs.stat(name, function(err, stats) {
                        if (err) return;
                        if (stats.isDirectory()) {
                            monitor.walk(name, stats);
                            monitor.walked.total--;
                        } else {
                            monitor.files[name] = stats;
                            monitor.walked.loaded++;
                        }
                        if (monitor.walked.loaded == monitor.walked.total) {
                            monitor.emit('walked');
                        }
                    });
                })();
            }
        }
        monitor.walked.loaded++;
    });
};
Monitor.prototype.notified = function(action, file, directory) {
    var monitor = this;
    var directory = directory || '';
    var fullname = path.resolve(path.join(directory, file));
    if (this.options.ignoreDotFiles && file[0] == '.') return;
    if (this.options.filter && !this.options.filer(fullname)) return;
    fs.exists(fullname, function(exists) {
        if (exists) {
            fs.stat(fullname, function(err, stats) {
                if (stats.isDirectory()) {
                    monitor.watch(fullname, stats);
                } else {
                    if (monitor.files[fullname]) {
                        if (stats.mtime.getTime() > monitor.files[fullname].mtime.getTime()) {
                            monitor.files[fullname] = stats;
                            monitor.emit('modified', fullname, stats);
                        }
                    } else {
                        monitor.files[fullname] = stats;
                        monitor.emit('added', fullname, stats);
                    }
                }
            });
        } else {
            if (monitor.files[fullname]) {
                delete monitor.files[fullname];
                monitor.emit('deleted', fullname);
            } else if (monitor.directories[fullname]) {
                for (var i in monitor.files) {
                    if (i.indexOf(fullname) === 0) {
                        monitor.notified(null, i);
                    }
                }
                monitor.unwatch(fullname);
            }
        }
    });
};


/**
 * Abstracts the construction of a new monitor
 * @param string directory parent path to watch
 * @param Object options to apply to Monitor
 * @returns Monitor
 */
exports.start = function(directory, options) {
    return new Monitor(directory, options);
};
