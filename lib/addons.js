/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactWithAddons
 */

/**
 * This module exists purely in the open source project, and is meant as a way
 * to create a separate standalone build of React. This build has "addons", or
 * functionality we've built and think might be useful but doesn't have a good
 * place to live inside React core.
 */

'use strict';

var LinkedStateMixin = require("react/lib/LinkedStateMixin");
var ReactComponentWithPureRenderMixin = require("react/lib/ReactComponentWithPureRenderMixin");
var ReactCSSTransitionGroup = require("react/lib/ReactCSSTransitionGroup");
var ReactFragment = require("react/lib/ReactFragment");
var ReactTransitionGroup = require("react/lib/ReactTransitionGroup");
var ReactUpdates = require("react/lib/ReactUpdates");

var cx = require("react/lib/cx");
var cloneWithProps = require("react/lib/cloneWithProps");
var update = require("react/lib/update");


// Fix binding issue with ReactCSSTransitionGroup
ReactCSSTransitionGroup.prototype.componentWillMount = function () {
    this._wrapChild = this._wrapChild.bind(this);
};

module.exports = {
    CSSTransitionGroup: ReactCSSTransitionGroup,
    LinkedStateMixin: LinkedStateMixin,
    PureRenderMixin: ReactComponentWithPureRenderMixin,
    TransitionGroup: ReactTransitionGroup,

    batchedUpdates: ReactUpdates.batchedUpdates,
    classSet: cx,
    cloneWithProps: cloneWithProps,
    createFragment: ReactFragment.create,
    update: update
};
