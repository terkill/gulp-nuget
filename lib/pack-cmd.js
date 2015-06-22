var execFile = require('child_process').execFile,
    exec = require('child_process').exec,
	gutil = require('gulp-util'),
	log = require('./log'),
	File = require('vinyl'),
	fs = require('fs-extra'),
	path = require('path');

var isWin = /^win/.test(process.platform);

function createArgs(options) {
	var args = ['pack', options.nuspec];
	if(options.version) {
		args.push('-version');
		args.push(options.version);
	}
    if (options.basePath) {
        args.push('-BasePath');
        args.push(options.basePath);
    }
	args.push('-nopackageanalysis');
	args.push('-noninteractive');

	return args;
}

function getPackageFilePath(stdout) {
	var regexp = /'(.+\.nupkg)'/;

	if(!stdout) {
		return;
	}

	var matches = stdout.match(regexp);
	if(!matches.length || matches.length < 1) {
		return;
	}

	return matches[1];
}

function readPackage(filePath, callback) {
	fs.exists(filePath, function(exists) {
		if(!exists) {
			callback();
			return;
		}

		fs.readFile(filePath, function(err, data) {
			var nugetPackage = new File({
				base: path.dirname(filePath),
				path: filePath,
				contents: data
			});

			callback(nugetPackage);
		});
	});
}

function run(options, callback) {
	var args = createArgs(options);
    if (isWin) {
        execFile(options.nuget, args, onDone);
    }
    else {
        var as = args.reduce(function(a, b) { return a + ' ' + b; });
        var cmd = 'mono ' + options.nuget + ' ' + as;
        exec(cmd, { maxBuffer: 100 * 1024 * 1024 }, onDone);
    }

	function onDone(err, stdout, stderr) {
		if(err) {
			throw new gutil.PluginError('gulp-nuget', err);
		}

		log(stdout);

		var filePath = getPackageFilePath(stdout);
		readPackage(filePath, callback);
	};
}

module.exports = {
	run: run
};
