/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule instantiateReactComponent
 * @typechecks static-only
 */

'use strict';

var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDomComponent = require("./ReactDomComponent");
var ReactTextComponent = require("./ReactTextComponent");
var ReactEmptyComponent = require("react/lib/ReactEmptyComponent");
var ReactNativeComponent = require("react/lib/ReactNativeComponent");

var assign = require("object-assign");
var invariant = require("react/lib/invariant");
var warning = require("react/lib/warning");

export const injections = {
    ReactDomComponent: null,
    ReactCompositeComponent: null,
    ReactTextComponent: ReactTextComponent
};

export function instantiateReactComponent(element, parentCompositeType) {
    var instance;

    if (element === null || element === false) {
        element = ReactEmptyComponent.emptyElement;
    }

    if (typeof element === 'object') {
        // Special case string values
        if (parentCompositeType === element.type &&
            typeof element.type === 'string') {
            // Avoid recursion if the wrapper renders itself.
            instance = new (injections.ReactDomComponent)(element);
            // All native components are currently wrapped in a composite so we're
            // safe to assume that this is what we should instantiate.
        } else {
            instance = new (injections.ReactCompositeComponent)(element);
        }
    } else if (typeof element === 'string' || typeof element === 'number') {
        instance = new (injections.ReactTextComponent)(element);
    } else {
        ("production" !== process.env.NODE_ENV ? invariant(
            false,
            'Encountered invalid React node of type %s',
            typeof element
        ) : invariant(false));
    }

    return instance;
}
