var execFile = require('child_process').execFile,
    exec = require('child_process').exec,
	PluginError = require('gulp-util').PluginError,
	log = require('./log'),
    path = require('path');

var isWin = /^win/.test(process.platform);

function createArgs(nugetPkgFilePath, options) {
    if (!isWin) {
        nugetPkgFilePath = path.relative('./', nugetPkgFilePath);
    }
    var args = ['push', nugetPkgFilePath];
	if(options.apiKey) {
		args.push(options.apiKey);
	}
	args.push("-s");
	args.push(options.feed);

	return args;
}

function run(nugetPkgFilePath, options, callback) {
	var args = createArgs(nugetPkgFilePath, options);
    var cmd = (isWin ? '' : 'mono ') + options.nuget;

    if (isWin) {
        console.log('!!!!!!1');
        execFile(options.nuget, args, onDone);
    }
    else {
        var as = args.reduce(function(a, b) { return a + ' ' + b; });
        var cmd = 'mono ' + options.nuget + ' ' + as;
        console.log('!!!!!!2');
        console.log(cmd);
        exec(cmd, { maxBuffer: 100 * 1024 * 1024 }, onDone);
    }

	function onDone(err, stdout, stderr) {
		if(err) {
            console.log(stdout);
            console.log(stderr);
			callback(new PluginError('gulp-nuget', stderr));
            return;
		}

		log(stdout);
		callback();
	};
}

module.exports = {
	run: run
};
