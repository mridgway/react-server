/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import ReactElement from './ReactElement';

class ReactCompositeElement extends ReactElement {
    constructor(type, props, children) {
        super(type, props, children);
    }

    mountComponent(rootNodeID, context) {
        var instance = new (this.type)(this.props, context);

        instance.componentWillMount && instance.componentWillMount();

        var renderedChild = instance.render();

        var childContext = instance.getChildContext ? instance.getChildContext() : context;

        return renderedChild.mountComponent(rootNodeID, childContext);
    }
}

export default ReactCompositeElement;
