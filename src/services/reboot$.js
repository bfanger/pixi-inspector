import { Subject } from 'rxjs/Subject'
/**
 * The reboot signal
 * - force fetching the scene (current tree & selected nore)
 */
const reboot$ = new Subject()
export default reboot$
