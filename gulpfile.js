"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const minifyCSS = require('gulp-minify-css');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ' * Nick Galko Portfolio - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2009-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/galek/portfolio/LICENSE)\n',
    ' */\n',
    '\n'
].join('');

// BrowserSync
function browserSync(cb) {

    if (browsersync)
        browsersync.init({
            server: {
                baseDir: "./docs"
            },
            port: 3000
        });

    cb();
}

// BrowserSync reload
function browserSyncReload(cb) {

    if (browsersync)
        browsersync.reload();

    cb();
}

// Clean dist
function clean(cb) {

    del.sync(["./docs/"]);

    cb();
}

// Bring third party dependencies from node_modules into docs/vendor directory
function modules(cb) {

    // Bootstrap
    const bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
        .pipe(gulp.dest('./docs/vendor/bootstrap'));

    // Font Awesome
    const fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
        .pipe(gulp.dest('./docs/vendor'));

    // jQuery Easing
    const jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest('./docs/vendor/jquery-easing'));

    // jQuery
    const jquery = gulp.src([
            './node_modules/jquery/dist/*',
            '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest('./docs/vendor/jquery'));

    // devicon
    const devicon = gulp.src([
            './node_modules/devicon/**/**/*.svg',
            './node_modules/devicon/**/**/*.eps',
            './node_modules/devicon/**/**/*.eot',
            './node_modules/devicon/**/**/*.ttf',
            './node_modules/devicon/**/**/*.woff',
            './node_modules/devicon/**/**/*.css',

            '!./node_modules/devicon/devicon.css',
            '!./node_modules/devicon/devicon-colors.css',
            '!./node_modules/devicon/*.json',
            '!./node_modules/devicon/*.md',
            '!./node_modules/devicon/index.html',
            '!./node_modules/devicon/gulpfile.js',
            '!./node_modules/devicon/LICENSE',
        ])
        .pipe(gulp.dest('./docs/vendor/devicon'));

    // Nick not call it - because we will get incorrect result
    // merge(bootstrap, fontAwesome, jquery, jqueryEasing, devicon);

    cb();
}

function postClean(cb) {

    del.sync(["./docs/vendor/devicon/devicon.git"]);
    del.sync(["./docs/css/resume.min.css"]);

    cb();
}

function images(cb) {

    const Task1 = gulp.src('./img/**/*')
        .pipe(gulp.dest('./docs/img'));

    const Task2 = gulp.src('./favicon.ico')
        .pipe(gulp.dest('./docs'));

    cb()
}

function staticHtml(cb) {

    const indexHtml = gulp.src('./index.html')
        .pipe(gulp.dest('./docs'));

    cb();
}

// CSS task
function css(cb) {

    gulp
        .src("./scss/**/*.scss")
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest("./docs/css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(minifyCSS())
        .pipe(gulp.dest("./docs/css"))
        .pipe(browsersync.stream());

    cb();
}

// JS task
function js(cb) {

    gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
        ])
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./docs/js'))
        .pipe(browsersync.stream());

    cb()
}

function PWAFiles(cb) {
    gulp
        .src([
            './sw.js',
            './sw-toolbox.js'
        ])
        .pipe(uglify())
        .pipe(gulp.dest('./docs/'))
        .pipe(browsersync.stream());

    gulp
        .src([
            './manifest.json'
        ])
        .pipe(gulp.dest('./docs/'))
        .pipe(browsersync.stream());

    cb()
}

// Watch files
function watchFiles() {

    gulp.watch("./scss/**/*", css);
    gulp.watch("./js/**/*", js);
    gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(gulp.series(vendor, gulp.parallel(css, js, images, staticHtml, PWAFiles)), postClean);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

exports.default = build;
exports.build = build;
exports.watch = watch;