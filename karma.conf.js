module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      { pattern: 'node_modules/power-assert/build/power-assert.js', watched: true, served: true, included: true },
      { pattern: 'dist/*.test.js', watched: true, served: true, included: true }
    ],
    exclude: [
    ],
    espowerPreprocessor: {
      options: {
        emitActualCode: false,
        ignoreUpstreamSourceMap: true
      }
    },
    reporters: ['dots'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'coverage',
      combineBrowserReports: true,
      skipFilesWithNoCoverage: false,
      verbose: false,
      'report-config': {
        html: {
          subdir: 'html',
        },
      },
      instrumentation: {
        'default-excludes': false,
      },
    },
    coverageIstanbulInstrumenter: {
      esModules: true,
    },
    autoWatch: true,
    autoWatchBatchDelay: 500,
    browserDisconnectTimeout: 30000,
    browsers: ['Chrome'],
    singleRun: true,
  });
};
