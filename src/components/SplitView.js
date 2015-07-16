var React = require('react');

var SplitView = React.createClass({
	render: function () {
		return <div className="splitview">
		{this.props.children.map(function (element, i) {
				return <div className="splitview__item" key={i}>{element}</div>
			})}	
		</div>

	}
});
module.exports = SplitView