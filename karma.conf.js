module.exports = function(config) {
  var reporters = ['progress', 'coverage'];
  if (process.env.TRAVIS) {
    reporters.push('coveralls');
  }

  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    singleRun: true,
    files: ['test/suite.js'],
    preprocessors: {
      'test/suite.js': ['webpack', 'sourcemap']
    },
    reporters: reporters,
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    webpack: {
        module: {
            rules: [{ 
                test: /\.js$/, 
                exclude: [/node_modules/], 
                loader: 'babel-loader', 
                options: {
                    plugins: ['istanbul']
                }
            }]
        },
        devtool: 'inline-source-map'
    }
  })
}
