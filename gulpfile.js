"use strict";

/*
Nick: Notes about plugins
https://habr.com/ru/post/252745/
*/

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
const htmlmin = require('gulp-htmlmin');
const useref = require('gulp-useref');
const uncss = require('gulp-uncss');
const htmlHint = require("gulp-htmlhint");
const autoPolyFiller = require('gulp-autopolyfiller');
const concat = require('gulp-concat');
const order = require('gulp-order');

const fixmyjs = require("gulp-fixmyjs");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ` * Nick Galko Portfolio - <${pkg.title}> v<${pkg.version}> (${pkg.homepage})\n`,
    ' * Copyright 2009-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ` * Licensed under ${pkg.license} (https://github.com/galek/portfolio/LICENSE)\n`,
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

    del.sync([`${__dirname}/docs`]);
    del.sync([`${__dirname}/buildTmp`]);

    cb();
}

// Bring third party dependencies from node_modules into docs/vendor directory
function modules(cb) {

    // Bootstrap
    gulp.src(['./node_modules/bootstrap/dist/**/*.min.*', '!./node_modules/bootstrap/dist/**/*.map'])
        .pipe(gulp.dest('./docs/vendor/bootstrap'));

    // Font Awesome
    gulp.src(['./node_modules/@fortawesome/**/*.min.*',
            './node_modules/@fortawesome/**/*.svg',
            './node_modules/@fortawesome/**/*.eot',
            './node_modules/@fortawesome/**/*.eps',
            './node_modules/@fortawesome/**/*.ttf',
            './node_modules/@fortawesome/**/*.woff',
            './node_modules/@fortawesome/**/*.woff2',
            '!**/*.less',
            '!**/*.scss',
            '!**/*.json',
            '!**/*.map',
            '!**/*.txt'
        ])
        .pipe(gulp.dest('./docs/vendor'));

    // jQuery Easing
    gulp.src('./node_modules/jquery.easing/*.min.*')
        .pipe(gulp.dest('./docs/vendor/jquery-easing'));

    // jQuery
    gulp.src([
            './node_modules/jquery/dist/*.min.*',
            '!./node_modules/jquery/dist/*.map',
            '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest('./docs/vendor/jquery'));

    // devicon
    gulp.src([
            './node_modules/devicon/**/**/*.svg',
            './node_modules/devicon/**/**/*.eps',
            './node_modules/devicon/**/**/*.eot',
            './node_modules/devicon/**/**/*.ttf',
            './node_modules/devicon/**/**/*.woff',
            './node_modules/devicon/**/**/*.css',

            '!./node_modules/devicon/devicon.git/**',
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

    del.sync([`${__dirname}/buildTmp`]);

    cb();
}

function images(cb) {

    gulp.src('./img/**/*')
        .pipe(gulp.dest('./docs/img'));

    gulp.src('./favicon.ico')
        .pipe(gulp.dest('./docs'));

    gulp.src('./icons/*')
        .pipe(gulp.dest('./docs/icons'));

    cb()
}

function staticHtml(cb) {

    gulp.src('./index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(useref())
        .pipe(htmlHint())
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
        .pipe(gulp.dest("./buildTmp/css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(uncss({ html: ['./*.html', './*.htm'] }))
        .pipe(cleanCSS())
        .pipe(minifyCSS())
        .pipe(rename('bundle.min.css'))
        .pipe(gulp.dest("./docs/css"))
        .pipe(browsersync.stream());

    cb();
}

// JS task
function js(cb) {

    const all = gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
        ])
        .pipe(concat(`bundleTmp.js`))
        .pipe(fixmyjs({
            // JSHint settings here
        }))
        .pipe(gulp.dest(`${__dirname}/buildTmp`));

    // Generate polyfills for all files
    const polyfills = all
        .pipe(autoPolyFiller('polyfills.js', { browsers: pkg.browserslist }));

    merge(polyfills, all)
        // Order files. NB! polyfills MUST be first
        .pipe(order([
            'polyfills.js',
            'bundleTmp.js'
        ]))
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./docs/js'))
        .pipe(browsersync.stream());

    cb();
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

    cb();
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