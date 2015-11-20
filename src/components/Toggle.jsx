require("./Toggle.scss");

function Toggle(props) {
	var classes = ['toggle'];
	if (props.value) {
		classes.push('toggle--on');
	} else {
		classes.push('toggle--off');
	}
	return <span className={classes.join(' ')} onClick={props.onChange.bind(null, !props.value)}><span className={'toggle__icon toggle__icon--' + props.icon}/></span>
}
module.exports = Toggle;