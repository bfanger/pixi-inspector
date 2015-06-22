var React = require("react");
var DetailView = React.createClass({
	render: function () {
		var data = this.props.data;
		var formatted = {
			"position.x": data.position.x,
			"position.y": data.position.y,
			"scale.x": data.scale.x,
			"scale.y": data.scale.y,
		};
		var rows = [];
		for (name in formatted) {
			var value = formatted[name]; 
			rows.push(<dt key={'dt' + name}>{name}</dt>);
			rows.push(<dd key={'dd' + name}>{value}</dd>);
		}
		return <dl>{rows}</dl> 
	}
});
module.exports = DetailView;
