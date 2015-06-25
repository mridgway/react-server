/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import assign from 'object-assign';
import ReactComponent from './ReactComponent';
import ReactNativeComponent from 'react/lib/ReactNativeComponent';
import {instantiateReactComponent} from './ReactComponentFactory';
import ReactPropTypeLocations from 'react/lib/ReactPropTypeLocations';
import ReactPropTypeLocationNames from 'react/lib/ReactPropTypeLocationNames';
import ReactElement from 'react/lib/ReactElement';

import invariant from 'react/lib/invariant';
import warning from 'react/lib/warning';

class ReactCompositeComponent extends ReactComponent {
    constructor(element) {
        super(element);
    }

    mountComponent(rootNodeID, transaction, context) {
        var Component = ReactNativeComponent.getComponentClassForElement(
            this.element
        );
        var instance = new Component(this.props, context);
        if (instance.state === undefined) {
            instance.state = null;
        }
        this._validateComponentInstance(Component, instance);

        instance.componentWillMount && instance.componentWillMount();

        var renderedChild = instance.render();
        this._validateRenderedChild(renderedChild);

        var instantiatedChild = instantiateReactComponent(renderedChild, this.type);

        var childContext = instance.getChildContext && instance.getChildContext();
        if (childContext) {
            this._validateChildContext(instance, childContext);
        }

        if (childContext) {
            childContext = assign({}, context, childContext);
        }

        return instantiatedChild.mountComponent(rootNodeID, transaction, childContext || context);
    }

    getName() {
        return this.type.displayName || this.type.name || null;
    }

    _validateComponentInstance(Component, instance) {
        if ("production" !== process.env.NODE_ENV) {
            // This will throw later in _renderValidatedComponent, but add an early
            // warning now to help debugging
            ("production" !== process.env.NODE_ENV ? warning(
                instance.render != null,
                '%s(...): No `render` method found on the returned component ' +
                'instance: you may have forgotten to define `render` in your ' +
                'component or you may have accidentally tried to render an element ' +
                'whose type is a function that isn\'t a React component.',
                Component.displayName || Component.name || 'Component'
            ) : null);
            // Since plain JS classes are defined without any special initialization
            // logic, we can not catch common errors early. Therefore, we have to
            // catch them here, at initialization time, instead.
            ("production" !== process.env.NODE_ENV ? warning(
                !instance.getInitialState ||
                instance.getInitialState.isReactClassApproved,
                'getInitialState was defined on %s, a plain JavaScript class. ' +
                'This is only supported for classes created using React.createClass. ' +
                'Did you mean to define a state property instead?',
                this.getName() || 'a component'
            ) : null);
            ("production" !== process.env.NODE_ENV ? warning(
                !instance.getDefaultProps ||
                instance.getDefaultProps.isReactClassApproved,
                'getDefaultProps was defined on %s, a plain JavaScript class. ' +
                'This is only supported for classes created using React.createClass. ' +
                'Use a static property to define defaultProps instead.',
                this.getName() || 'a component'
            ) : null);
            ("production" !== process.env.NODE_ENV ? warning(
                !instance.propTypes,
                'propTypes was defined as an instance property on %s. Use a static ' +
                'property to define propTypes instead.',
                this.getName() || 'a component'
            ) : null);
            ("production" !== process.env.NODE_ENV ? warning(
                !instance.contextTypes,
                'contextTypes was defined as an instance property on %s. Use a ' +
                'static property to define contextTypes instead.',
                this.getName() || 'a component'
            ) : null);
            ("production" !== process.env.NODE_ENV ? warning(
                typeof instance.componentShouldUpdate !== 'function',
                '%s has a method called ' +
                'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
                'The name is phrased as a question because the function is ' +
                'expected to return a value.',
                (this.getName() || 'A component')
            ) : null);
            ("production" !== process.env.NODE_ENV ? invariant(
                typeof instance.state === 'object' && !Array.isArray(instance.state),
                '%s.state: must be set to an object or null',
                this.getName() || 'ReactCompositeComponent'
            ) : invariant(typeof instance.state === 'object' && !Array.isArray(instance.state)));
        }
    }

    _validateChildContext(instance, childContext) {
        ("production" !== process.env.NODE_ENV ? invariant(
            typeof instance.constructor.childContextTypes === 'object',
            '%s.getChildContext(): childContextTypes must be defined in order to ' +
            'use getChildContext().',
            this.getName() || 'ReactCompositeComponent'
        ) : invariant(typeof instance.constructor.childContextTypes === 'object'));
        if ("production" !== process.env.NODE_ENV) {
            this._validatePropTypes(
                instance.constructor.childContextTypes,
                childContext,
                ReactPropTypeLocations.childContext
            );
        }
        for (var name in childContext) {
            ("production" !== process.env.NODE_ENV ? invariant(
                name in instance.constructor.childContextTypes,
                '%s.getChildContext(): key "%s" is not defined in childContextTypes.',
                this.getName() || 'ReactCompositeComponent',
                name
            ) : invariant(name in instance.constructor.childContextTypes));
        }
        return childContext;
    }

    /**
     * Assert that the props are valid
     *
     * @param {object} propTypes Map of prop name to a ReactPropType
     * @param {object} props
     * @param {string} location e.g. "prop", "context", "child context"
     * @private
     */
    _validatePropTypes(propTypes, props, location) {
        // TODO: Stop validating prop types here and only use the element
        // validation.
        var componentName = this.getName();
        for (var propName in propTypes) {
            if (propTypes.hasOwnProperty(propName)) {
                var error;
                try {
                    // This is intentionally an invariant that gets caught. It's the same
                    // behavior as without this statement except with a better message.
                    ("production" !== process.env.NODE_ENV ? invariant(
                        typeof propTypes[propName] === 'function',
                        '%s: %s type `%s` is invalid; it must be a function, usually ' +
                        'from React.PropTypes.',
                        componentName || 'React class',
                        ReactPropTypeLocationNames[location],
                        propName
                    ) : invariant(typeof propTypes[propName] === 'function'));
                    error = propTypes[propName](props, propName, componentName, location);
                } catch (ex) {
                    error = ex;
                }
                if (error instanceof Error) {
                    // We may want to extend this logic for similar errors in
                    // React.render calls, so I'm abstracting it away into
                    // a function to minimize refactoring in the future
                    var name = this.getName();
                    var addendum = name ? ' Check the render method of `' + name + '`.' : '';

                    if (location === ReactPropTypeLocations.prop) {
                        // Preface gives us something to blacklist in warning module
                        ("production" !== process.env.NODE_ENV ? warning(
                            false,
                            'Failed Composite propType: %s%s',
                            error.message,
                            addendum
                        ) : null);
                    } else {
                        ("production" !== process.env.NODE_ENV ? warning(
                            false,
                            'Failed Context Types: %s%s',
                            error.message,
                            addendum
                        ) : null);
                    }
                }
            }
        }
    }

    _validateRenderedChild(renderedChild) {
        ("production" !== process.env.NODE_ENV ? invariant(
            // TODO: An `isValidNode` function would probably be more appropriate
            renderedChild === null || renderedChild === false ||
            ReactElement.isValidElement(renderedChild),
            '%s.render(): A valid ReactComponent must be returned. You may have ' +
            'returned undefined, an array or some other invalid object.',
            this.getName() || 'ReactCompositeComponent'
        ) : invariant(// TODO: An `isValidNode` function would probably be more appropriate
            renderedChild === null || renderedChild === false ||
            ReactElement.isValidElement(renderedChild)));
    }
}

export default ReactCompositeComponent;
