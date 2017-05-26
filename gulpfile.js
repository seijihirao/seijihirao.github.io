const del = require('del')
const gulp = require('gulp')
const gulpif = require('gulp-if')
var gutil = require('gulp-util')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const uglifycss = require('gulp-uglifycss')
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

/**
 * Create file and initializate with text
 * 
 * @param {string} filename
 * @param {string} text - file content
 */
function createFile(filename, text) {
	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
		this.push(new gutil.File({
    		cwd: '',
			base: '',
			path: filename,
			contents: new Buffer(text)
		}))
		this.push(null)
	}
  return src
}

/**
 * Builds project from `polymer.json` file
 */
gulp.task('build', async (cb) => {

	gutil.log(`Deleting '${buildDirectory}' directory...`)
	await del([buildDirectory])

	let sourcesStream = polymerProject.sources()
	
	//iterates through build list
	for(var i = 0; i < polymerJson.builds.length; i++){
		let build = polymerJson.builds[i]
		await pump([
			mergeStream(polymerProject.sources(), polymerProject.dependencies()),
			gulpif(build.bundle, polymerProject.bundler({stripComments: true})),
			sourcesHtmlSplitter.split(), // split inline JS & CSS out into individual .js & .css files 
			gulpif(build.js.minify, gulpif(/\.js$/, babel({presets: ['babili']}))),
			//gulpif(build.js.minify, gulpif(/\.js$/, uglify())), //Uglify js not working on es6 (usin babili)
			gulpif(build.css.minify, gulpif(/\.css$/, cssSlam())),
			gulpif(build.html.minify, gulpif(/\.html$/, htmlMinifier({collapseWhitespace: true}))),
			sourcesHtmlSplitter.rejoin(), // rejoins those files back into their original location 
			gulp.dest(buildDirectory + '/' + build.name)
		])
		gutil.log(`Created '${buildDirectory}/${build.name}' directory...`)
	}

	createFile('.git', 'gitdir: /home/seiji/Documents/projects/seijihirao.github.io/.git/worktrees/bundled')
		.pipe(gulp.dest(buildDirectory + '/bundled'))
	createFile('CNAME', 'seiji.life')
		.pipe(gulp.dest(buildDirectory + '/bundled'))
})
