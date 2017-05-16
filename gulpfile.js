const del = require('del')
const gulp = require('gulp')
const gulpif = require('gulp-if')
var gutil = require('gulp-util')
const babel = require('gulp-babel');
const uglify = require('gulp-uglify')
const cssSlam = require('css-slam').gulp
const htmlMinifier = require('gulp-html-minifier')
const mergeStream = require('merge-stream')
const HtmlSplitter = require('polymer-build').HtmlSplitter
const sourcesHtmlSplitter = new HtmlSplitter()
const polymerBuild = require('polymer-build')
const pump = require('pump')

const polymerJson = require('./polymer.json')
const polymerProject = new polymerBuild.PolymerProject(polymerJson)
const buildDirectory = './build'

var fs = require('fs')

function string_src(filename, string) {
	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
		this.push(new gutil.File({
    		cwd: "",
			base: "",
			path: filename,
			contents: new Buffer(string)
		}))
		this.push(null)
	}
  return src
}

gulp.task('build', async (cb) => {
	gutil.log(`Deleting '${buildDirectory}' directory...`)

	await del([buildDirectory])
	let sourcesStream = polymerProject.sources()
	for(var i = 0; i < polymerJson.builds.length; i++){
		let build = polymerJson.builds[i]
		await pump([
			mergeStream(polymerProject.sources(), polymerProject.dependencies()),
			gulpif(build.bundle, polymerProject.bundler()),
			sourcesHtmlSplitter.split(), // split inline JS & CSS out into individual .js & .css files 
			gulpif(build.js.minify, gulpif(/\.js$/, babel({presets: ['es2015']}))),
			gulpif(build.js.minify, gulpif(/\.js$/, uglify())),
			gulpif(build.css.minify, gulpif(/\.css$/, cssSlam())),
			gulpif(build.html.minify, gulpif(/\.html$/, htmlMinifier({collapseWhitespace: true}))),
			sourcesHtmlSplitter.rejoin(), // rejoins those files back into their original location 
			gulp.dest(buildDirectory + '/' + build.name)
		])
		gutil.log(`Created '${buildDirectory}/${build.name}' directory...`)
	}

	string_src('.git', 'gitdir: /home/seiji/Documents/projects/seijihirao.github.io/.git/worktrees/bundled')
		.pipe(gulp.dest(buildDirectory + '/bundled'))
})
