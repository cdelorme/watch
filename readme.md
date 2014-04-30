
# watch

This node module is my take on an object oriented wrapper for [`fs.watch`](http://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener) that supplies whitelist filtration and actively maintains a list of cached files for accessibility.

This module has **no dependences** outside of the core node packages `fs`, `path`, and `event`.

Please read nodes documentation on `fs.watch` to ensure it will work in your environment, and note that as of current it sports an incomplete API and is not 100% compatible with all file systems (as per their documentation).  **I have tested this successfully on both OSX's HFS+ and Linux's ext4 file systems.**

One of the key benefits of `fs.watch` is that it is tied to the file system and does not perform `fs.stat` polling like the former `fs.watchFile`.  However, this is not to say that my module will outperform the former, because it has to check `fs.exists` to verify deleted vs added files, followed by `fs.stat` to check for modified files.  I have not created any benchmarks, but will gladly if someone were to supply a test case.

I expect to optimize this code going forward, and in the future you can expect a forked version that uses [q promises](https://github.com/kriskowal/q) for improved readability.


## installation

    npm install cdelorme-watch

Or if you are so inclined, feel free to clone the repository and run `npm install` on the clone path.


## usage

Require it:

    var watch = require('cdelorme-watch');

Create a watch instance:

    var monitor = watch.start(directory, options);

Attach event listeners:

    monitor.on('event_name', callback);


### arguments

**Directory:**

Provide a relative path to the directory you wish to monitor.  **It can and will resolve the path to an absolute path internally.**


**Options:**

It accepts the following:

- lazy (boolean)
- filter (function)
- ignoreDotFiles

_It also accepts the [options available to `fs.watch`](http://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener)._

The `lazy` boolean is false by default, but can be set to `true` if you don't want it to walk the file system recursively from the start.  **This means it will not watch folders deeper than the parent directory and is not generally useful, but an option since you may call walk manually later.**

The `filter` is a callback to a method, which will accept the absolute path to the file or folter as a string.  To continue processing a file or folder you must return true.  Examples where this is helpful is checking the file extension, or ignoring directories.  **Folders will trigger the filter, but will not emit events.**

By default it will ignore dot files, which means any files that begin with a period.  You can uncheck that to have it watch them too.


### events

Events are **only triggered by files**, and allow you to monitor the file system asynchronously.

Here are the four used by the monitor:

- added
- modified
- deleted
- walked

The first three will supply the file name to the callback, the last one is used to check when the file system walk is finished (as this occurs asynchronously).


## references

- [nodejs watch documentation](http://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener)
- [watch module by mikael was a helpful inspiration](https://github.com/mikeal/watch)
