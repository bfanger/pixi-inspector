import { Subject } from 'rxjs/Subject'
/**
 * The refresh signal
 * - force fetching the scene (current tree & selected nore)
 */
var refresh = new Subject()
export default refresh
