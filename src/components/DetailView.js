var React = require("react");
var DetailView = React.createClass({
	render: function () {
		var data = this.props.data;
		var formatted = {};
		Object.keys(data).forEach( property => {
			if (property[0] === '_' || ['children', 'parent', 'worldTransform'].indexOf(property) !== -1) {
				return;
			}
			var value = data[property];
			var type = typeof value;
			if (type === 'string' || type === 'number') {
				formatted[property] = value
			} else if (type === 'boolean') {
				formatted[property] = value ? 'true' : 'false'
			} else if (value === null) {
				formatted[property] = 'null';
			} else if (type === 'object') {
				console.log(type, value);
				Object.keys(value).forEach( _property => {
					var _value = value[_property];
					var _type = typeof _value;
					if (_type === 'string' || _type === 'number') {
						formatted[property + '.' + _property] = _value
					} else if (_type === 'boolean') {
						formatted[property + '.' + _property] = _value ? 'true' : 'false'
					} else {
						formatted[property + '.' + _property] = '...' + _type
					}
				})
			} else {
				formatted[property] = '...' + type
			}
		});
		var fields = [];
		for (var label in formatted) {
			var value = formatted[label]; 
			fields.push(<div key={label}>
				<span className="detail-view__label">{label}</span>
				<span className="detail-view__value">{value}</span>
			</div>);
		}
		return <div className="detail-view">{fields}</div> 
	}
});
module.exports = DetailView;
