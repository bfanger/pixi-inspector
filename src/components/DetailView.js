import React, { Component } from "react"
import DetailValue from './DetailValue'
import proxy from '../services/proxy'
import refresh from '../services/refresh'

require("./DetailView.scss")

export default class DetailView extends Component {
	render() {
		var data = this.props.data
		var formatted = {}
		Object.keys(data).forEach(property => {
			if (property[0] === '_' || ['children', 'parent', 'worldTransform'].indexOf(property) !== -1) {
				return
			}
			var value = data[property]
			var type = typeof value
			if (type === 'string' || type === 'number') {
				formatted[property] = value
			} else if (type === 'boolean') {
				formatted[property] = value ? 'true' : 'false'
			} else if (value === null) {
				formatted[property] = 'null'
			} else if (type === 'object') {
				Object.keys(value).forEach(_property => {
					var _value = value[_property]
					var _type = typeof _value
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
		})
		var fields = []
		for (var label in formatted) {
			var value = formatted[label]
			fields.push(<div key={label}>
				<span className="detailview__label">{label}</span>
				<DetailValue className="detailview__value" onChange={this.updateValue.bind(this, label)} value={value} />
			</div>)
		}
		return <div className="detailview">{fields}</div>
	}
	updateValue(property, value) {
		proxy.eval("$pixi." + property + " = " + value)
	}
}
