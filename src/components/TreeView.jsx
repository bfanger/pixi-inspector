require("./TreeView.scss");
var {Component, PropTypes} = require("react");

var KEYS = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
}
/**
 * "dumb" TreeView component.
 */
class TreeView extends Component {

	constructor(props) {
		super(props);
		this.click = this.click.bind(this);
		this.keyDown = this.keyDown.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.selected && this.props.selected) {
			this.refs.node.focus();
		}
	}
	render() {
		var nodes = [];
		if (!this.collapsed) {
			nodes = <div style={{paddingLeft: 14}}>{this.props.renderChildren()}</div>;
		}
		var className = 'treeview' + (this.props.selected ? ' treeview--selected' : '') + (this.props.hovered ? ' treeview--hovered' : '');
		return <div>
			<div ref="node" className={ className } onMouseDown={this.click} tabIndex="1" onKeyDown={this.keyDown} onFocus={this.props.onSelect} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}>
				{this.getIcon()}{this.props.title}
			</div>
			{nodes}
		</div>
	}
	getIcon() {
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
	}
	click(e) {
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
	}
	keyDown(e) {
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
};
TreeView.propTypes = {
	title: React.PropTypes.any.isRequired,
	collapsed: React.PropTypes.bool.isRequired,
	selected: React.PropTypes.bool,
	leaf: React.PropTypes.bool
};
var noop = function () {};
TreeView.defaultProps = {
	leaf: false,
	selected: false,

	onExpand: noop,
	onCollapse: noop,
	onSelect: noop,
	onSelectParent: noop,
	onSelectPrevious: noop,
	onSelectNext: noop,
	onMouseEnter: noop,
	onMouseLeave: noop
}
module.exports = TreeView;