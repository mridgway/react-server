/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactClass
 */

'use strict';

var ReactComponent = require("react/lib/ReactComponent");
var ReactElement = require("react/lib/ReactElement");
var ReactErrorUtils = require("react/lib/ReactErrorUtils");
var ReactInstanceMap = require("react/lib/ReactInstanceMap");
var ReactLifeCycle = require("react/lib/ReactLifeCycle");
var ReactPropTypeLocations = require("react/lib/ReactPropTypeLocations");
var ReactPropTypeLocationNames = require("react/lib/ReactPropTypeLocationNames");
var ReactUpdateQueue = require("react/lib/ReactUpdateQueue");

var assign = require("object-assign");
var invariant = require("react/lib/invariant");
var keyMirror = require("react/lib/keyMirror");
var keyOf = require("react/lib/keyOf");
var warning = require("react/lib/warning");

var MIXINS_KEY = keyOf({mixins: null});

/**
 * Policies that describe methods in `ReactClassInterface`.
 */
var SpecPolicy = keyMirror({
    /**
     * These methods may be defined only once by the class specification or mixin.
     */
    DEFINE_ONCE: null,
    /**
     * These methods may be defined by both the class specification and mixins.
     * Subsequent definitions will be chained. These methods must return void.
     */
    DEFINE_MANY: null,
    /**
     * These methods are overriding the base class.
     */
    OVERRIDE_BASE: null,
    /**
     * These methods are similar to DEFINE_MANY, except we assume they return
     * objects. We try to merge the keys of the return values of all the mixed in
     * functions. If there is a key conflict we throw.
     */
    DEFINE_MANY_MERGED: null
});


var injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactClass`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactClassInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will available on the prototype.
 *
 * @interface ReactClassInterface
 * @internal
 */
var ReactClassInterface = {

    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: SpecPolicy.DEFINE_MANY,

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: SpecPolicy.DEFINE_MANY,

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: SpecPolicy.DEFINE_MANY,

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: SpecPolicy.DEFINE_MANY,

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: SpecPolicy.DEFINE_MANY,

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

    /**
     * @return {object}
     * @optional
     */
    getChildContext: SpecPolicy.DEFINE_MANY_MERGED,

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
     *
     * @return {ReactComponent}
     * @nosideeffects
     * @required
     */
    render: SpecPolicy.DEFINE_ONCE,



    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: SpecPolicy.DEFINE_MANY,

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: SpecPolicy.DEFINE_MANY,



    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
var RESERVED_SPEC_KEYS = {
    displayName: function(Constructor, displayName) {
        Constructor.displayName = displayName;
    },
    mixins: function(Constructor, mixins) {
        if (mixins) {
            for (var i = 0; i < mixins.length; i++) {
                mixSpecIntoComponent(Constructor, mixins[i]);
            }
        }
    },
    childContextTypes: function(Constructor, childContextTypes) {

        Constructor.childContextTypes = assign(
            {},
            Constructor.childContextTypes,
            childContextTypes
        );
    },
    contextTypes: function(Constructor, contextTypes) {

        Constructor.contextTypes = assign(
            {},
            Constructor.contextTypes,
            contextTypes
        );
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function(Constructor, getDefaultProps) {
        if (Constructor.getDefaultProps) {
            Constructor.getDefaultProps = createMergedResultFunction(
                Constructor.getDefaultProps,
                getDefaultProps
            );
        } else {
            Constructor.getDefaultProps = getDefaultProps;
        }
    },
    propTypes: function(Constructor, propTypes) {

        Constructor.propTypes = assign(
            {},
            Constructor.propTypes,
            propTypes
        );
    },
    statics: function(Constructor, statics) {
        mixStaticSpecIntoComponent(Constructor, statics);
    }
};

function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
        if (typeDef.hasOwnProperty(propName)) {
        }
    }
}

function validateMethodOverride(proto, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name) ?
        ReactClassInterface[name] :
        null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {

    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (proto.hasOwnProperty(name)) {

    }
}

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building React classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
        return;
    }

    var proto = Constructor.prototype;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
        RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
        if (!spec.hasOwnProperty(name)) {
            continue;
        }

        if (name === MIXINS_KEY) {
            // We have already handled mixins in a special case above
            continue;
        }

        var property = spec[name];
        validateMethodOverride(proto, name);

        if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
            RESERVED_SPEC_KEYS[name](Constructor, property);
        } else {
            // Setup methods on prototype:
            // The following member methods should not be automatically bound:
            // 1. Expected ReactClass methods (in the "interface").
            // 2. Overridden methods (that were mixed in).
            var isReactClassMethod =
                ReactClassInterface.hasOwnProperty(name);
            var isAlreadyDefined = proto.hasOwnProperty(name);
            if (isAlreadyDefined) {
                var specPolicy = ReactClassInterface[name];

                // These cases should already be caught by validateMethodOverride

                // For methods which are defined more than once, call the existing
                // methods before calling the new property, merging if appropriate.
                if (specPolicy === SpecPolicy.DEFINE_MANY_MERGED) {
                    proto[name] = createMergedResultFunction(proto[name], property);
                } else if (specPolicy === SpecPolicy.DEFINE_MANY) {
                    proto[name] = createChainedFunction(proto[name], property);
                }
            } else {
                proto[name] = property;

            }
        }
    }
}

function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
        return;
    }
    for (var name in statics) {
        var property = statics[name];
        if (!statics.hasOwnProperty(name)) {
            continue;
        }

        var isReserved = name in RESERVED_SPEC_KEYS;

        var isInherited = name in Constructor;
        Constructor[name] = property;
    }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeIntoWithNoDuplicateKeys(one, two) {

    for (var key in two) {
        if (two.hasOwnProperty(key)) {
            one[key] = two[key];
        }
    }
    return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
    return function mergedResult() {
        var a = one.apply(this, arguments);
        var b = two.apply(this, arguments);
        if (a == null) {
            return b;
        } else if (b == null) {
            return a;
        }
        var c = {};
        mergeIntoWithNoDuplicateKeys(c, a);
        mergeIntoWithNoDuplicateKeys(c, b);
        return c;
    };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
    return function chainedFunction() {
        one.apply(this, arguments);
        two.apply(this, arguments);
    };
}

var typeDeprecationDescriptor = {
    enumerable: false,
    get: function() {
        var displayName = this.displayName || this.name || 'Component';

        Object.defineProperty(this, 'type', {
            value: this
        });
        return this;
    }
};

/**
 * Add more to the ReactClass base class. These are all legacy features and
 * therefore not already part of the modern ReactComponent.
 */
var ReactClassMixin = {

    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function(newState, callback) {
        ReactUpdateQueue.enqueueReplaceState(this, newState);
        if (callback) {
            ReactUpdateQueue.enqueueCallback(this, callback);
        }
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function() {
        var internalInstance = ReactInstanceMap.get(this);
        return (
        internalInstance &&
        internalInstance !== ReactLifeCycle.currentlyMountingInstance
        );
    },

    /**
     * Sets a subset of the props.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     * @deprecated
     */
    setProps: function(partialProps, callback) {
        ReactUpdateQueue.enqueueSetProps(this, partialProps);
        if (callback) {
            ReactUpdateQueue.enqueueCallback(this, callback);
        }
    },

    /**
     * Replace all the props.
     *
     * @param {object} newProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     * @deprecated
     */
    replaceProps: function(newProps, callback) {
        ReactUpdateQueue.enqueueReplaceProps(this, newProps);
        if (callback) {
            ReactUpdateQueue.enqueueCallback(this, callback);
        }
    }
};

var ReactClassComponent = function() {};
assign(
    ReactClassComponent.prototype,
    ReactComponent.prototype,
    ReactClassMixin
);

/**
 * Module for creating composite components.
 *
 * @class ReactClass
 */
var ReactClass = {

    /**
     * Creates a composite component class given a class specification.
     *
     * @param {object} spec Class specification (which must define `render`).
     * @return {function} Component constructor function.
     * @public
     */
    createClass: function(spec) {
        var Constructor = function(props, context) {
            // This constructor is overridden by mocks. The argument is used
            // by mocks to assert on what gets mounted.

            this.props = props;
            this.context = context;
            this.state = null;

            // ReactClasses doesn't have constructors. Instead, they use the
            // getInitialState and componentWillMount methods for initialization.

            var initialState = this.getInitialState ? this.getInitialState() : null;
            this.state = initialState;
        };
        Constructor.prototype = new ReactClassComponent();
        Constructor.prototype.constructor = Constructor;

        mixSpecIntoComponent(Constructor, spec);

        // Initialize the defaultProps property after all mixins have been merged
        if (Constructor.getDefaultProps) {
            Constructor.defaultProps = Constructor.getDefaultProps();
        }

        // Reduce time spent doing lookups by setting these on the prototype.
        for (var methodName in ReactClassInterface) {
            if (!Constructor.prototype[methodName]) {
                Constructor.prototype[methodName] = null;
            }
        }

        // Legacy hook
        Constructor.type = Constructor;

        return Constructor;
    }

};

module.exports = ReactClass;