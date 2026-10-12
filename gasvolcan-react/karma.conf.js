// =========================================================
// karma.conf.js - Jasmine + Karma para los componentes React
// Karma abre un navegador (ChromeHeadless), carga las pruebas
// *.spec.js empaquetadas con webpack (karma-webpack + Babel para
// que entienda JSX) y las ejecuta con Jasmine.
// Cobertura: babel-plugin-istanbul instrumenta el código y
// karma-coverage genera el informe en la carpeta coverage/.
// =========================================================
const path = require('path');
const webpack = require('webpack');

const babelPresets = [
  '@babel/preset-env',
  ['@babel/preset-react', { runtime: 'automatic' }],
];

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-coverage',
    ],

    // Solo se cargan las pruebas; webpack trae el código que importan
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: { 'src/**/*.spec.js': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: false,
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          // 1) Código de la app: se transpila (JSX) y se instrumenta para cobertura
          {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            exclude: [/\.spec\.js$/, /test-utils\.js$/],
            use: {
              loader: 'babel-loader',
              options: {
                presets: babelPresets,
                plugins: [['istanbul', { exclude: ['**/*.spec.js', '**/test-utils.js'] }]],
              },
            },
          },
          // 2) Pruebas y utilidades de prueba: solo se transpilan
          {
            test: /\.js$/,
            include: [/\.spec\.js$/, /test-utils\.js$/],
            use: { loader: 'babel-loader', options: { presets: babelPresets } },
          },
        ],
      },
      plugins: [
        // El código usa process.env.PUBLIC_URL (lo define react-scripts en la app real)
        new webpack.DefinePlugin({ 'process.env.PUBLIC_URL': JSON.stringify('') }),
      ],
    },

    client: { jasmine: { random: false } }, // las pruebas corren en el orden escrito
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
      ],
    },

    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
