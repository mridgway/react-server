/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var Fluxible = require('fluxible');

var app = new Fluxible({
    component: require('./components/TodoApp.jsx')
});

app.registerStore(require('./stores/TodoStore'));
app.registerStore(require('./stores/PageStore'));


module.exports = app;
