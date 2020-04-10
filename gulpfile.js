"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var postcss = require("gulp-postcss");
var sass = require("gulp-sass");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");

sass.compiler = require("node-sass");

gulp.task("css", function () {
  return gulp.src("src/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task("minjs", function () {
  return gulp.src("src/js/*.js")
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(rename("script.min.js"))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("build/js"));
});

gulp.task("images", function () {
  return gulp.src("src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("src/img"));
});

gulp.task("webp", function () {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("src/img"));
});

gulp.task("sprite", function () {
  return gulp.src("src/img/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("src/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("minhtml", function () {
  return gulp.src("build/*.html")
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch("src/scss/**/*.scss", gulp.series("css","refresh"));
  gulp.watch("src/img/icon-*.svg", gulp.series("sprite","html","refresh"));
  gulp.watch("src/img/", gulp.series("images","webp"));
  gulp.watch("src/*.html", gulp.series("html", "minhtml","refresh"))
});

gulp.task("refresh", function () {
  server.reload();
  done();
});

gulp.task("copy", function () {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/js/**",
    "src/*.ico"
  ], {
    base: "src"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", gulp.series("clean", "copy", "css", "minjs", "sprite", "images", "webp", "html", "minhtml"));
gulp.task("start", gulp.series("build", "server"));
