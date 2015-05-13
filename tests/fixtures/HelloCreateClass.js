import React from '../../index';

export default React.createClass({
    render() {
        if (this.props.children) {
            return <div {...this.props}>{this.props.children}</div>;
        }
        return <div {...this.props}>Hello world!</div>;
    }
});
