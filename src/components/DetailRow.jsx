require("./DetailView.scss");
var React = require("react");

var DetailRow = React.createClass({
    propTypes: {
        label: React.PropTypes.string,
        value: React.PropTypes.string
    },
    getInitialState: function() {
        return {
            hovered : false
        }
    },
    handleChange : function (event) {
        console.log('handlechange');
        var command = "$pixi." + this.props.label + " = " + event.target.value;
        console.log("command:");
        console.log(command);
        chrome.devtools.inspectedWindow.eval(command, function(result, exceptionInfo) {
            if (result) {
                console.log(result);
            }
            if (exceptionInfo.hasOwnProperty('isError') || exceptionInfo.hasOwnProperty('isException')) {
                console.log("failed to eval: " + exceptionInfo.code + " " + exceptionInfo.description + ", " + exceptionInfo.value);
            }
        });
    },
    handleClick : function() {
        this.setState({
            hovered:true
        });
    },
    render: function () {
        var detailView;
        console.log('console log works');
        if (this.state.hovered) {
            detailView = <input type="text" defaultValue={this.props.value} onChange={this.handleChange} />
        } else {
            detailView = <span className="detailview__value">{this.props.value}</span>
        }
        return <div key={this.props.label} onClick={this.handleClick}>
            <span className="detailview__label">{this.props.label}</span>
            {detailView}
        </div>;
    }
});
module.exports = DetailRow;
