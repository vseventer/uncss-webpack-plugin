/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Mark van Seventer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Strict mode.
'use strict';

// Standard lib.
const crypto = require('crypto');
const path = require('path');

// Package modules.
const objectEntries = require('object.entries');
const RawSource = require('webpack-sources').RawSource;

// Local modules.
const jsdom = require('./lib/jsdom');
const uncss = require('uncss'); // May only be loaded after patching jsdom.

// Define the UnCSS plugin.
class UnCSSPlugin {
  constructor (options) {
    this.options = Object.assign({ }, options);
  }

  apply (compiler) {
    // Enable check.
    if (this.options.enable === false) return;

    // Hook into Webpack.
    compiler.plugin('compilation', (compilation) => {
      // Build manifest (src => dest).
      const manifest = { };
      compilation.plugin('module-asset', (module, file) => {
        manifest[module.resource] = file;
      });

      // Build dependency tree (CSS => HTML).
      const dependencyTree = { };
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        chunks.forEach((chunk) => {
          chunk.forEachModule((module) => {
            if ('fileDependencies' in module) {
              // Obtain list of CSS and HTML files.
              const css = this._findByExtName(module.fileDependencies, [
                '.css', '.less', '.sass', '.scss'
              ]);
              const html = this._findByExtName(module.fileDependencies, '.html');

              // Update dependency tree. Note the CSS file must be a separate
              // module (e.g. using extract- and file-loader).
              css.forEach((file) => {
                if (file in manifest) { // Must be a separate module.
                  const key = manifest[file];
                  if (!(key in dependencyTree)) dependencyTree[key] = [ ]; // Init.
                  dependencyTree[key].push.apply(dependencyTree[key], html.map((file) => manifest[file]));
                }
              });
            }
          });
        });

        // Update memory.
        jsdom.setAssetsInMemory(compilation.assets);

        // For each CSS file, UnCSS using its associated HTML.
        const promises = objectEntries(dependencyTree).map(([ css, html ]) => {
          const cssSource = compilation.assets[css].source().toString();
          const htmlSource = html.map((file) => compilation.assets[file].source().toString());
          return this._uncss(cssSource, htmlSource).then((output) => {
            compilation.assets[css] = new RawSource(output); // Update asset.
            compilation.assets[css].updateHash(crypto.createHash('md5'));
          });
        });

        // Await all promises and return.
        Promise
          .all(promises)
          .then(callback.bind(this, null))
          .catch(callback);
      });
    });
  }

  _findByExtName (list, extname) {
    return list.filter((filename) => {
      return extname.indexOf(path.extname(filename)) !== -1;
    });
  }

  _uncss (css, html) {
    return new Promise((resolve, reject) => {
      // Merge options - note we `ignoreSheets` since we use raw CSS.
      const opts = Object.assign({
        html: html,
        ignoreSheets: [ /^/ ],
        raw: css
      }, this.options);

      // Run.
      uncss(opts.html, opts, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });
  }
}

// Exports.
module.exports = UnCSSPlugin;
