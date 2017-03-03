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

// Package modules.
const jsdom = require('jsdom');

// Configure.
let memory = { };

// Patch jsdom.
const original = jsdom.env;
jsdom.env = (src, config, callback) => {
  // Apply a custom resourceLoader which looks up .
  const originalResourceLoader = config.resourceLoader;
  config.resourceLoader = (resource, callback) => {
    // Attempt to lookup resource in memory, if it has no protocol.
    const url = resource.url;
    if (url.protocol === null) {
      // Attempt to match asset with resource (required since Webpack's
      // publicPath may mess things up).
      for (let asset in memory) {
        if (url.pathname.endsWith(asset)) { // Match found.
          return callback(null, memory[asset].source());
        }
      }
    }

    // Result not found in memory, attempt to use custom resource loader or
    // default.
    if (originalResourceLoader) {
      return originalResourceLoader.call(this, resource, callback);
    }
    return resource.defaultFetch(callback);
  };

  // Return by invoking original.
  return original.call(this, src, config, callback);
};

// Exports.
module.exports = {
  // Updates the assets stored in memory.
  setAssetsInMemory: (assets) => {
    memory = Object.assign({ }, assets, memory);
  }
};
