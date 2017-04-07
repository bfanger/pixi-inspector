import { Observable } from 'rxjs/Observable'

export default function fromEvent (onEvent) {
  return Observable.create(observer => {
    function listener (event) {
      if (arguments.length === 1) {
        observer.next(event)
      } else {
        observer.next(arguments)
      }
    }
    onEvent.addListener(listener)
    return () => {
      onEvent.removeListener(listener)
    }
  })
}
