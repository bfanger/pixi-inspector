/* eslint-disable import/no-mutable-exports */
let connection = null;
if (process.env.DEV_SERVER) {
  const DevConnection = require("./DevConnection").default;
  connection = new DevConnection();
} else {
  const Connection = require("../devtools-rx/Connection").default;
  connection = new Connection("pixi_panel");
}

export default connection;
