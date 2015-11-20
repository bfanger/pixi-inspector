require("./Toolbar.scss");

function SplitView(props) {
	return <div className="toolbar">{props.children}</div>
}
module.exports = SplitView