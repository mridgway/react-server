/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

class ReactElement {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children || null;
    }
}

export default ReactElement;
