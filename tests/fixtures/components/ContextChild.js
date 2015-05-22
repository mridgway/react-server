import React from '../../../index';

class ContextChild extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return <div>{this.context.foo}</div>;
    }
}

ContextChild.contextTypes = {
    foo: React.PropTypes.string.isRequired
};

export default ContextChild;
