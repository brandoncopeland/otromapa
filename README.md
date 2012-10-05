# otromapa

otromapa is a template for getting started devloping .js map applications.

I've incorporated the frameworks I think best get the job done and produce manageable client code, including [the ArcGIS JavaScript API](http://help.arcgis.com/en/webapi/javascript/arcgis/), [Backbone.js](http://backbonejs.org/), [Underscore.js](http://underscorejs.org/), [Jasmine](http://pivotal.github.com/jasmine/), and [Sinon.js](http://sinonjs.org/). Who knows? I may wake up tomorrow and like something else better. The tools used will likely change over time, but the principle of a basic application starting point with core map components common to many map apps will continue to be the goal.

The otromapa application is purely HTML, JavaScript, and CSS.

## AMD

JavaScript source is organized into modules using the [Asynchronous Module Definition (AMD) API](https://github.com/amdjs/amdjs-api/wiki/AMD) define/require syntax. As of Dojo 1.7, the Dojo module loader supports the AMD format. I've chosen to use the Dojo implementation over other popular options like RequireJS, primarily because the Dojo libraries are already a required dependency of the ArcGIS JavaScript API.

## SASS

Stylesheets for the otromapa application are written in [SASS](http://sass-lang.com/), and it is expected that additional styles will be written in SASS and translated to CSS via SASS tools, `$ sass --watch scss:css`. All SASS stylesheets are in the `/scss` directory and translated CSS should be added to the `/css` directory.

## HTML Pages

Currently there are 2 HTML pages, defining 2 independent applications.

- index.html: demo application presenting common use of the majority of modules. index.html loads `main.js/app.js` and relies on the `style.css` stylesheet
- floodplainmap.html: early stage prototype of a real world project that helps demonstrate additional components, delivering a more final product, and including multiple apps in the same project. floodplainmap.html also includes a build script under `/build` - index.html does not. floodplainmap.html loads `main-brazoria-floodplain.js/app-brazoria-floodplain.js` and relies on the `style-floodplainmap.css`

## Build

The `/build` directory contains individual build scripts. Build scripts are developed for the [r.js](https://github.com/jrburke/r.js/) library, which is included in `/build`. r.js is my opinionated preference over Dojo's build tools. r.js is lighter than the Dojo tools and performs well for the needs of this application. Check out the [r.js GitHub page](https://github.com/jrburke/r.js/) for more information on usage. For the floodplainmap app, the node.js syntax would look something like:

	$ node build/r.js -o brazoria-floodplain.build.js

*Note on building with r.js vs. Dojo...*

Many modules use the [Dojo's Text Plugin](http://livedocs.dojotoolkit.org/dojo/text). Because the build is performed with r.js and not Dojo's build tools, this plugin is unavailable. The RequireJS text plugin [text.js](https://github.com/requirejs/text) is included in `js/plugins` for use with builds only. See `build/brazoria-floodplain.build.js` for an example setting the path for this plugin.

