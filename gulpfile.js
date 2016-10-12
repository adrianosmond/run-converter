var fs = require("fs");
var path = require("path")
var gulp = require("gulp");
var gutil = require("gulp-util");
var watch = require("gulp-watch");
var filter = require("gulp-filter");
var through = require("through2");
var clean = require("gulp-clean");
var sass = require("gulp-sass");
var stylelint = require("gulp-stylelint");
var stylefmt = require("gulp-stylefmt");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var jscs = require("gulp-jscs");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var newer = require("gulp-newer");
var ejs = require("ejs");
var browserSync = require("browser-sync").create();

gulp.task("default", ["serve"]);

gulp.task("serve", ["html", "sass", "js", "copy-images"], function () {
	browserSync.init({
		server: "./dist"
	});

	watch("./public/**/*.scss", function() {
		gulp.start("sass");
	});

	watch("./public/assets/scripts/**/*.js", function() {
		gulp.start("js");
	});

	watch("./public/assets/scripts/vendor/**/*.js", function() {
		gulp.start("js");
	});

	watch(["./public/**/*.ejs", "./public/**/*.json"], function() {
		gulp.start("html");
	});

	watch("./public/**/*.{svg,png,jpg,gif}", function() {
		gulp.start("copy-images");
	});
});

gulp.task("fix-sass-style", ["fix-sass-style"]);

gulp.task("fix-js-style", ["fix-js-style"]);

gulp.task("clean", function () {
	return gulp.src("./dist/")
		.pipe(clean({force: true}));
});

gulp.task("copy-images", function () {
	return gulp.src("./public/**/*.{svg,png,jpg,gif}")
		.pipe(newer("./dist/"))
		.pipe(imagemin())
		.pipe(gulp.dest("./dist/"))
		.on("end", browserSync.reload);
})

gulp.task("html", function () {
	return gulp.src("./public/**/[^_]*.ejs")
		.pipe(renderTemplates()
				.on("error", function (err) {
					gutil.log(err);

					var cleanedUpErr = 
						err.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;")
							.replace(/\n/g, "<br>");

					notifyBrowserSync([{
						color: "lightcoral",
						message: cleanedUpErr
					}], 10000, true);

					this.emit("end");
				}))
		.pipe(gulp.dest("./dist/"))
		.on("end", browserSync.reload);
});

gulp.task("sass", function () {
	return gulp.src("./public/**/*.scss")
		.pipe(stylelint({ 
				reporters: [{
					formatter: "string", 
					console: true
				}]
			}).on("error", function (err) {
				this.emit("end");

				notifyBrowserSync([{
					color: "lightcoral",
					message: err.message
				}], 10000);
			})
		)
		.pipe(sass({outputStyle: "compressed"})
				.on("error", sass.logError)
				.on("error", function errLog (err) {
					notifyBrowserSync([{
							color: "lightcoral",
							message: err.messageOriginal,
							endWithNewLine: true
						},{
							color: "paleturquoise",
							message: "File:&nbsp;"
						},{
							color: "moccasin",
							message: path.relative(path.resolve( __dirname + "/public/"), err.file),
							endWithNewLine: true
						},{
							color: "paleturquoise",
							message: "Line:&nbsp;"
						},{
							color: "moccasin",
							message: err.line
						}],

						10000
					);

					this.emit("end");
				})
			)
		.pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
		.pipe(concat("style.css"))
		.pipe(gulp.dest("./dist/assets/styles/"))
		.pipe(browserSync.stream());
});

gulp.task("fix-sass-style", function () {
	return gulp.src("./public/**/*.scss")
		.pipe(stylefmt())
		.pipe(gulp.dest("./public/assets/scripts/"))
});

gulp.task("js", function () {
	var nonVendorFilter = filter(["public/assets/scripts/**/*.js", "!public/assets/scripts/vendor/**"], {restore: true});

	return gulp.src("./public/assets/scripts/**/*.js")
		.pipe(nonVendorFilter)
		.pipe(jscs())
		.pipe(jscs.reporter())
		.pipe(nonVendorFilter.restore)
		.pipe(uglify()
				.on("error", function (err) {
					gutil.log(gutil.colors.red(err.cause.message));
					gutil.log(gutil.colors.yellow("File: " + err.cause.filename));
					gutil.log(gutil.colors.yellow("Line: " + err.cause.line));

					notifyBrowserSync([{
							color: "lightcoral",
							message: err.cause.message,
							endWithNewLine: true
						},{
							color: "paleturquoise",
							message: "File:&nbsp;"
						},{
							color: "moccasin",
							message: err.cause.filename,
							endWithNewLine: true
						},{
							color: "paleturquoise",
							message: "Line:&nbsp;"
						},{
							color: "moccasin",
							message: err.cause.line
						}], 
						10000
					);
					this.emit("end");
				})
			)
		.pipe(concat("script.js"))
		.pipe(gulp.dest("./dist/assets/scripts/"))
		.on("end", browserSync.reload);
});

gulp.task("fix-js-style", function () {
	return gulp.src(["./public/assets/scripts/**/*.js", "!./public/assets/scripts/vendor/**"])
		.pipe(jscs({fix: true}))
		.pipe(gulp.dest("./public/assets/scripts/"))
		.pipe(jscs.reporter())
});

function notifyBrowserSync(details, duration, pre) {
	setTimeout(function () {
		var msg = "";
		if (pre) msg += "<pre>";
		msg += "<div style='text-align: left; line-height: 1.4; font-family: monospace; font-size: 14px; font-weight: 400'>"
		for (var i=0; i<details.length; i++) {
			msg += "<span style='color: " + details[i].color + "'>" + details[i].message +"</span>";
			if (details[i].endWithNewLine) {
				msg += "<br>";
			}
		}
		msg += "</div>";
		if (pre) msg += "</pre>";
		browserSync.notify(msg, duration);
	}, 1000);
}

function walkDirectoryTree(currentPath) {
	var stats = fs.lstatSync(currentPath);
	var fileName = path.basename(currentPath);
	var data = {};

	if (stats.isDirectory()) {
		data[fileName] = {}
		fs.readdirSync(currentPath).forEach(function(child) {
			var result = walkDirectoryTree(currentPath + "/" + child);
			if (Object.keys(result).length > 0) {
				data[fileName][Object.keys(result)[0]] = result[Object.keys(result)[0]];
			}
		});
	} else if (path.extname(currentPath) === ".json") {
		try {
			data[path.basename(currentPath, ".json")] = JSON.parse(fs.readFileSync(currentPath, "utf8"));
		} catch (e) {
			throw new gutil.PluginError({
				plugin: "html",
				message: "Failed to parse JSON at " + path.relative(path.resolve( __dirname + "/public/"), currentPath)
			});
		}
	}

	return data;
}

function renderTemplates () {
	var layout = fs.readFileSync("./public/_layout.ejs", "utf8");
	var allData = walkDirectoryTree(path.resolve( __dirname + "/public/"))["public"];

	return through.obj(function (file, enc, callback) {
		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit(
				"error",
				new gutil.PluginError("html", "Streaming not supported")
			);
		}
		
		var relativePath = path.relative(path.resolve( __dirname + "/public/"), file.path).split("/");
		var relativeData = relativePath.reduce(function(prev, current, currentIdx) {
			if (currentIdx === relativePath.length - 1) {
				return prev["_data"];
			}
			return prev[current]
		}, allData);

		try {
			var modifiedLayout = layout.replace(/<%-[\s]*yield[\s]*%>/g, file.contents.toString().replace(/<%-[\s*]include[\s]*\(/g, "<%- include("));
			var backToRoot = path.relative(file.path.substring(0, file.path.lastIndexOf("/")), path.resolve( __dirname + "/public/"));
			if (backToRoot.length === 0) backToRoot = "."
			file.contents = new Buffer(
				ejs.render(modifiedLayout, {
					path: relativePath,
					backToRoot: backToRoot,
					allData: allData,
					data: relativeData
				}, {
					root: "./public/"
				})
			);

			file.path = gutil.replaceExtension(file.path, ".html");
		} catch (err) {
			var msg = "";
			var filePath = path.relative(path.resolve( __dirname + "/public/"), file.path);
			if (err.toString().indexOf("Error: ejs:") >= 0) {
				msg = err.toString();
				msg = msg.replace("Error: ejs:", "Error: " + filePath + ":");
				msg = msg.replace( __dirname + "/public/", "");
			} else {
				msg = "Failed to compile " + filePath;
				msg += "\n" + err.toString();
			}
			this.emit("error", msg);
		}

		this.push(file);
		callback();
	})
}