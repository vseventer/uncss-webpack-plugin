# uncss-webpack-plugin
> Remove unused CSS using [uncss](https://www.npmjs.com/package/uncss) in [Webpack](https://webpack.js.org/).

This plugin is an alternative to using UnCSS with `postcss-loader`. Running UnCSS as a loader has a few drawbacks:
* There is no way to obtain the HTML files in the pipeline, hence you can only run UnCSS against HTML files on disk.
* Any references to JavaScript files in the pipeline causes errors, for the same reason as above.

By running UnCSS as plugin, after all assets are loaded, we can overcome the two drawbacks outlined above. However, because Webpack holds its assets in memory until the very last stage, this plugin uses some ugly patching of [jsdom](https://www.npmjs.com/package/jsdom), the underlying mechanism used by UnCSS. The benefit, however, is that UnCSS supports any selectors dynamically added by JavaScript, and the final output will be correct.

*NOTE: Your HTML and CSS files must be extracted from the bundle, otherwise this plugin will not work. For HTML, you can use `[ 'file-loader', 'extract-loader', 'html-loader' ]`, while for CSS `[ 'file-loader', 'extract-loader', 'css-loader' ]` will do the trick.*

## Install
`npm install uncss-webpack-plugin`

## Usage
This plugin is designed for Webpack 2. Load the plugin, and simply add it to the plugin entry in your `webpack.config.js`.

```js
// Package modules.
const UnCSSPlugin = require('uncss-webpack-plugin');

// Exports.
module.exports = {
  ...
  plugins: [
    new UnCSSPlugin({ /* options */ })
  ]
}
```

### Options
For more detailed information, please refer to the [UnCSS Usage section](https://www.npmjs.com/package/uncss#usage). Because Webpack controls the CSS, the following options are ignored: `csspath`, `ignoreSheets`, `media`, `raw`, `report`, and `stylesheets`.

* **enable** (boolean, default `true`) - enable the plugin.
* **html** (array, default to Webpack HTML assets) - list of HTML files to check.
* **htmlroot** (string) - where the project root is.
* **timeout** (number) - specify how long to wait for the JS to be loaded.
* **uncssrc** (string) - load all options from a JSON file.

## Changelog
See the [CHANGELOG](./CHANGELOG.md) for a list of changes.

## License
    The MIT License (MIT)

    Copyright (c) 2017 Mark van Seventer

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.