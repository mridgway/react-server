/**
 * This file overrides node's require cache so that require('react') will
 * actually resolve to react-server.
 */
'use strict';

// Ensure the cache for react-server is populated
require('./dist/react-server');

require.cache[require.resolve('react')] = require.cache[require.resolve('./dist/react-server')];
require.cache[require.resolve('react/addons')] = require.cache[require.resolve('./dist/react-server')];
