import React from '../../../index';

class Hello extends React.Component {
    render () {
        if (this.props.children) {
            return <div {...this.props}>{this.props.children}</div>;
        }
        return <div {...this.props}>Hello world!</div>;
    }
}

export default Hello;
