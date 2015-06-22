var fs = require('fs-extra'),
	Transform = require('stream').Transform,
	util = require('util'),
	PluginError = require('gulp-util').PluginError,
	path = require('path'),
	log = require('./log'),
	packcmd = require('./pack-cmd');

function NugetPackStream(options) {
	if(!(this instanceof NugetPackStream)) {
		return new NugetPackStream(options);
	}

	this.options = options || {};
	this.options.objectMode = true;
	this.options.workingDirectory = options.workingDirectory || "./publish";

	if(!this.options.nuspec) {
		throw new PluginError('gulp-nuget', '.nuspec file path missing from options');
	}

	if(!this.options.nuget) {
		throw new PluginError('gulp-nuget', 'nuget.exe file path missing from options');
	}

	Transform.call(this, this.options);
}

util.inherits(NugetPackStream, Transform);

NugetPackStream.prototype._transform = function(file, encoding, next) {
    next();
};

NugetPackStream.prototype._flush = function(done) {
	var self = this;
	packcmd.run(self.options, function(nugetPackage) {
		fs.remove(self.options.workingDirectory, function(err) {
			log(err);

			if(nugetPackage) {
				self.push(nugetPackage);
			}

			done(err);
		});
	});
};

module.exports = function(options) {
	return new NugetPackStream(options);
};
