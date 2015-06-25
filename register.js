/**
 * This file overrides node's require cache so that require('react') will
 * actually resolve to react-server.
 */
'use strict';

var requirePath = 'production' === process.env.NODE_ENV ?
    './dist/react-server' : './dist/react-server.dev.js';

// Ensure the cache for react-server is populated
require(requirePath);

require.cache[require.resolve('react')] = require.cache[require.resolve(requirePath)];
require.cache[require.resolve('react/addons')] = require.cache[require.resolve(requirePath)];
