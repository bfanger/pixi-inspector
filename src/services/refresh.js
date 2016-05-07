import {Subject} from 'rx';
/**
 * The refresh signal
 * - force fetching the scene (current tree & selected nore)
 */
var refresh = new Subject();
export default refresh;