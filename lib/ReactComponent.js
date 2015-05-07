/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

class ReactComponent {
    constructor(element) {
        this.element = element;
        this.type = element.type;
        this.props = element.props;
    }
}

export default ReactComponent;
