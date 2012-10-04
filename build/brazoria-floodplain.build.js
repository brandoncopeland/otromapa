({
  appDir: '../',
  baseUrl: 'js',
  dir: '../../release-brazoriafloodplain',
  paths: {
    'jquery': 'empty:',
    'dojo': 'empty:',
    'esri': 'empty:',
    'underscore': 'lib/underscore-amd-min',
    'backbone': 'lib/backbone-amd-min',
    'app': '',
    'views': 'views',
    'models': 'models',
    'utilities': 'utilities',
    'templates': '../templates',
    'data': '../data',
    'text': 'plugins/text' // plugins/text.js only used for build. dojo/text used at runtime.
  },
  modules: [{
    name: 'app/app-brazoria-floodplain',
    exclude: [
      'text'
    ]
  }],
  removeCombined: true,
  inlineText: false, // would like to do this, but need to overcome issues using dojo/text instead of text.js or maybe just always use text.js
  optimize : 'uglify',
  optimizeCss: 'standard',
  fileExclusionRegExp: /^(\.|scss|build|docs|spec|README\.md|index\.html|main\.js|app\.js)/, // could be better but works well enough for now
  preserveLicenseComments: false
})