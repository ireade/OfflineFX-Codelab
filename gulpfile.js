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

var sassMainFile = 'src/css/main.scss';
var sassFiles = 'src/css/**/*.scss';

gulp.task('css', function() {
	gulp.src(sassMainFile)
		.pipe( postcss(postcssProcessors, {syntax: scss}) )
		.pipe(
			sass({ outputStyle: 'compressed' })
			.on('error', gutil.log)
		)
		.pipe(gulp.dest('dist/css'));
});



/* *************
	JS
************* */
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

var jsFiles = 'src/js/**/*.js';

var jsMainFiles = 'src/js/main/*.js';
var jsSWFile = 'src/js/sw/service-worker.js';


gulp.task('js', function() {
	gulp.src(jsMainFiles)
		.pipe(
			babel({ presets: ['es2015'] })
			.on('error', gutil.log)
		)
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
	gulp.src('src/js/lib/*.js')
		.pipe(concat('lib.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/lib'));
	gulp.src('src/js/utils/*.js')
		.pipe(concat('utils.js'))
		.pipe(gulp.dest('dist/js'));
	gulp.src(jsSWFile)
		//.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});




/* *************
    HTML
************* */

var minifyHTML = require('gulp-minify-html');

var htmlFiles = 'src/*.html'


gulp.task('html', function() {
    gulp.src(htmlFiles)
        .pipe(minifyHTML({ empty: true }))
        .pipe(gulp.dest('dist'));
});



/* *************
	SERVER with BrowserSync
************* */

var browserSync = require('browser-sync');
gulp.task('connectWithBrowserSync', function() {
	browserSync.create();
	browserSync.init({
		server: './dist',
		port: 4000
	});
});



var connect = require('gulp-connect');
gulp.task('connect', function() {
	connect.server({
		server: './dist',
		port: 4100
	});
});



	

/* *************
	WATCH
************* */

gulp.task('watch', function() {
	// gulp.watch(sassFiles,['css']).on('change', browserSync.reload); 
	// gulp.watch(jsFiles,['js']).on('change', browserSync.reload);
	// gulp.watch(htmlFiles, ['html']).on('change', browserSync.reload);

	gulp.watch(sassFiles,['css']);
	gulp.watch(jsFiles,['js']);
	gulp.watch(htmlFiles, ['html']);
});



/* *************
	DEFAULT
************* */

gulp.task('default', ['connect', 'css', 'js', 'html', 'watch']);
