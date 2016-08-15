var gulp = require('gulp');
var gutil = require('gulp-util');


/* *************
	CSS
************* */

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var scss = require('postcss-scss');
var autoprefixer = require('autoprefixer');
var postcssProcessors = [
	autoprefixer( {
		browsers: 'last 2 versions'
	} )
];
var sassFiles = 'src/css/**/*.scss';

gulp.task('css', function() {
	gulp.src('src/css/main.scss')
		.pipe( postcss(postcssProcessors, {syntax: scss}) )
		.pipe(
			sass({ outputStyle: 'compressed' })
			.on('error', gutil.log)
		)
		.pipe(gulp.dest('public/css'));
});



/* *************
	JS
************* */
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var jsFiles = 'src/js/**/*.js';

gulp.task('js', function() {
	gulp.src('src/js/main/*.js')
		.pipe(
			babel({ presets: ['es2015'] })
			.on('error', gutil.log)
		)
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/js'));
	gulp.src('src/js/lib/*.js')
		.pipe(concat('lib.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/js/lib'));
	gulp.src('src/js/utils/*.js')
		.pipe(
			babel({ presets: ['es2015'] })
			.on('error', gutil.log)
		)
		.pipe(concat('utils.js'))
		.pipe(gulp.dest('public/js'));
	gulp.src('src/js/sw/service-worker.js')
		.pipe(gulp.dest('public/'));
});




/* *************
    HTML
************* */

var minifyHTML = require('gulp-minify-html');
var htmlFiles = 'src/*.html'

gulp.task('html', function() {
    gulp.src(htmlFiles)
        .pipe(minifyHTML({ empty: true }))
        .pipe(gulp.dest('public'));
});



/* *************
	SERVER 
************* */

var connect = require('gulp-connect');

gulp.task('connect', function() {
	connect.server({
		root: 'public',
		port: 4100
	});
});



	

/* *************
	WATCH
************* */

gulp.task('watch', function() {
	gulp.watch(sassFiles,['css']);
	gulp.watch(jsFiles,['js']);
	gulp.watch(htmlFiles, ['html']);
});



/* *************
	DEFAULT
************* */

gulp.task('default', ['connect', 'css', 'js', 'html', 'watch']);
