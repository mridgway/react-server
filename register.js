/* global process */

/**
 * This file overrides node's require cache so that require('react') will
 * actually resolve to react-server.
 */
'use strict';

// Ensure the cache is populated
require('./index');

require.cache[require.resolve('react')] = require.cache[require.resolve('./index')];
require.cache[require.resolve('react/addons')] = require.cache[require.resolve('./index')];
