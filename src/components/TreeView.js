var React = require("react");

var KEYS = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
}
/**
 * "dumb" TreeView component.
 */
var TreeView = React.createClass({

	propTypes: {
		title: React.PropTypes.any.isRequired,
		collapsed: React.PropTypes.bool.isRequired,
		leaf: React.PropTypes.bool
	},
	getDefaultProps: function () {
		var noop = function () {};
		return  {
			leaf: false,
			selected: false,

			onExpand: noop,
			onCollapse: noop,
			onSelect: noop,
			onSelectParent: noop,
			onSelectPrevious: noop,
			onSelectNext: noop,
		}
	},
	render: function () {
		var nodes = [];
		if (!this.collapsed) {
			nodes = <div style={{paddingLeft: 12}}>{this.props.renderChildren()}</div>;
		}
		return <div>
			<div ref="node" onMouseDown={this.click} tabIndex="1" onKeyUp={this.keyup}>
				{this.getIcon()}{this.props.title} {this.props.selected ? '[SEL]' : ''}
			</div>
			{nodes}
		</div>
	},
	getIcon: function () {
		var style = {
			display: "inline-block",
			width: 12
		}
		if (this.props.leaf) {
			return <span className="tree-toggle" style={style} />
		} else if (this.props.collapsed) {
			return <span className="tree-toggle tree-toggle--expand" style={style} onClick={this.props.onExpand}>+</span>
		} else {
			return <span className="tree-toggle tree-toggle--collapse" style={style} onClick={this.props.onCollapse}>-</span>
		}
	},
	click: function (e) {
		if (e.target.classList.contains('tree-toggle')) {
			return;
		}
		if (this.props.selected) {
			if (this.props.collapsed) {
				this.props.onExpand(e);
			}
		} else {
			this.props.onSelect(e);
		}
	},
	keyup: function (e) {
		var key = e.which;
		if (key === KEYS.UP) {
			this.props.onSelectPrevious(e);
		} else if (key === KEYS.DOWN) {
			this.props.onSelectNext(e); 
		} else if (key === KEYS.LEFT) {
			if (this.props.collapsed) {
				this.props.onSelectParent(e); 
			} else {
				this.props.onCollapse(e); 
			}
		} else if (key === KEYS.RIGHT) {
			if (!this.props.leaf) {
				if (this.props.collapsed) {
					this.props.onExpand(e); 
				} else {
					this.props.onSelectNext(e); 
				}
			}
		}
	}

});
module.exports = TreeView;