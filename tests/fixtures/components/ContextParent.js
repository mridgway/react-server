import React from '../../../index';
import ContextChild from './ContextChild';

class ContextParent extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    getChildContext() {
        return {
            foo: 'bar'
        };
    }

    render() {
        return <ContextChild />;
    }
}

ContextParent.childContextTypes = {
    foo: React.PropTypes.string
};


export default ContextParent;
