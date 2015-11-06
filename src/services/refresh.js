var {Subject} = require('rx');
/**
 * The refresh signal
 * - force fetching the scene (current tree & selected nore)
 */
var refresh = new Subject();
module.exports = refresh;