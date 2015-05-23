/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import assign from 'object-assign';
import ReactComponent from './ReactComponent';
import ReactNativeComponent from 'react/lib/ReactNativeComponent';
import {instantiateReactComponent} from './ReactComponentFactory';

class ReactCompositeComponent extends ReactComponent {
    constructor(element) {
        super(element);
    }

    mountComponent(rootNodeID, transaction, context) {
        var Component = ReactNativeComponent.getComponentClassForElement(
            this.element
        );
        var instance = new Component(this.props, context);

        instance.componentWillMount && instance.componentWillMount();

        var renderedChild = instance.render();

        var instantiatedChild = instantiateReactComponent(renderedChild, this.type);

        var childContext = instance.getChildContext && instance.getChildContext();

        if (childContext) {
            childContext = assign({}, context, childContext);
        }

        return instantiatedChild.mountComponent(rootNodeID, transaction, childContext || context);
    }
}

export default ReactCompositeComponent;
