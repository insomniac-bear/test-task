const gulp = require(`gulp`);
const plumber = require(`gulp-plumber`);
const sourcemaps = require(`gulp-sourcemaps`);
const rename = require(`gulp-rename`);
const postcss = require(`gulp-postcss`);
const sass = require(`gulp-sass`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const csso = require(`gulp-csso`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const svgstore = require(`gulp-svgstore`);
const posthtml = require(`gulp-posthtml`);
const include = require(`posthtml-include`);
const del = require(`del`);
const htmlmin = require(`gulp-htmlmin`);
const uglify = require(`gulp-uglify`);

sass.compiler = require(`node-sass`);

gulp.task(`css`, () => {
  return gulp.src(`src/scss/style.scss`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemaps.write(`.`))
    .pipe(gulp.dest(`build/css`));
});

gulp.task(`minjs`, () => {
  return gulp.src(`src/js/*.js`)
  .pipe(uglify())
  .pipe(rename(`script.min.js`))
  .pipe(gulp.dest(`build/js`));
});

gulp.task(`images`, () => {
  return gulp.src(`source/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(`src/img`));
});

gulp.task(`webp`, () => {
  return gulp.src(`src/img/**/*.{png,jpg}`)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(`src/img`));
});

gulp.task(`sprite`, () => {
  return gulp.src(`src/img/icon-*.svg`)
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename(`sprite.svg`))
  .pipe(gulp.dest(`build/img`));
});

gulp.task(`html`, () => {
  return gulp.src(`source/*.html`)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(`build`));
});

gulp.task(`minhtml`, () => {
  return gulp.src(`build/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(`build`));
});

gulp.task(`refresh`, () => {
  server.reload();
  done();
});

gulp.task(`server`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch(`src/scss/**/*.scss`, gulp.series(`css`,`refresh`));
  gulp.watch(`src/img/icon-*.svg`, gulp.series(`sprite`,`html`,`refresh`));
  gulp.watch(`source/img/`, gulp.series(`images`,`webp`));
  gulp.watch(`source/*.html`, gulp.series(`html`, `minhtml`,`refresh`))
});

gulp.task(`copy`, () => {
  return gulp.src([
    `src/fonts/**/*.{woff,woff2}`,
    `src/img/**`,
    `src/js/**`,
    `src/*.ico`
  ], {
    base: `src`
  })
    .pipe(gulp.dest(`build`));
});

gulp.task(`clean`, () => {
  return del(`build`);
});

gulp.task(`build`, gulp.series(`clean`, `copy`, `css`, `minjs`, `sprite`, `images`, `webp`, `html`, `minhtml`));
gulp.task(`start`, gulp.series(`build`, `series`));
