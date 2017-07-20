import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import connection from './connection'

/**
 * Async access to the Inspector.
 *
 * All operations return Promises
 */
export default class Proxy {
  constructor (index, target) {
    if (typeof index === 'object') {
      this.inspector = index
    } else {
      this.path = '__PIXI_INSPECTOR_GLOBAL_HOOK__.inspectors[' + index + ']'
      this.target = target
    }
    this.local = {
      selected$: new Subject(),
      treeChange$: new Subject()
    }
    this.tree$ = Observable.defer(() => {
      let root
      return Observable.concat(
        this.call('outliner.tree'),
        connection.on('TREE').map(message => message.data)
      ).do(tree => { root = tree }).merge(this.local.treeChange$.map(node => root))
    }).publishReplay(1).refCount()

    this.selected$ = Observable.merge(
      this.tree$.take(2).switchMap(() => {
        return this.call('outliner.selected')
      }),
      this.local.selected$)
  }

  activate () {
    return this.call('activate')
  }

  deactivate () {
    return this.call('deactivate')
  }

  expand (node) {
    return this.call('outliner.expand', node.id).then(children => {
      node.collapsed = false
      node.children = children
      this.local.treeChange$.next(node)
    })
  }

  collapse (node) {
    return this.call('outliner.collapse', node.id).then(children => {
      node.collapsed = true
      node.children = children
      this.local.treeChange$.next(node)
    })
  }
  select (node) {
    return this.call('outliner.select', node.id).then(() => {
      this.local.selected$.next(node)
    })
  }

  setProperty (path, value) {
    return this.call('properties.set', path, value)
  }

  // highlight (id) {
  //   return this.call('outliner.highlight', id).then(value => {
  //     // this.refresh$.next('highlight');
  //     return value
  //   })
  // }
  call (method, ...args) {
    if (!chrome.devtools) {
      const dot = method.indexOf('.')
      let value
      if (dot === -1) {
        value = this.inspector[method].apply(this.inspector, args)
      } else {
        const helper = this.inspector[method.substr(0, dot)]
        const _method = method.substr(dot + 1)
        value = helper[_method].apply(helper, args)
      }
      if (typeof value !== 'undefined') {
        value = JSON.parse(JSON.stringify(value))
      }
      return Promise.resolve(value)
    }
    const code = this.path + '.' + method + '(' + (args.map(arg => JSON.stringify(arg)).join(', ')) + ')'
    return new Promise((resolve, reject) => {
      chrome.devtools.inspectedWindow.eval(code, this.target, (result, exceptionInfo) => {
        if (exceptionInfo) {
          if (exceptionInfo.isException) {
            reject(exceptionInfo.value)
          } else if (exceptionInfo.isError) {
            if (exceptionInfo.description.match(/%s/) && exceptionInfo.details.length === 1) {
              reject(exceptionInfo.description)
            }
          }
          reject(exceptionInfo)
        } else {
          resolve(result)
        }
      })
    })
  }
}

// /*global  chrome */
// /*eslint no-eval: off */

// /**
//  * A proxy for executing code in the inspectedWindow environment.
//  *
//  * Has convenience wrappers for console methods. `proxy.log('a example message')`
//  */
// export default class Proxy {
//   constructor (target) {
//     this.target = target || {}
//   }

//   /**
// 	 * Proxy to console.log()
// 	 * @param {String} message
// 	 */
//   log (message) {
//     return this.apply('console', 'log', arguments)
//   }

//   /**
// 	 * Proxy to console.warn()
// 	 * @param {String} message
// 	 */
//   warn (message) {
//     return this.apply('console', 'warn', arguments)
//   }

//   /**
// 	 * Proxy to console.error()
// 	 * @param {String} message
// 	 */
//   error (message) {
//     return this.apply('console', 'error', arguments)
//   }

//   /**
// 	 * @param {String} object
// 	 * @param {method} method
// 	 * @param {Array} [args]
// 	 * @returns Promise
// 	 */
//   apply (object, method, args) {
//     args = args || []
//     let code = object + '.' + method + '('
//     for (const i in args) {
//       if (i !== '0') {
//         code += ', '
//       }
//       code += JSON.stringify(args[i])
//     }
//     code += ')'
//     return this.eval(code)
//   }

//   /**
// 	 * @param {Function} fn
// 	 * @param {Object} tplvars
// 	 * @returns Promise
// 	 */
//   evalFn (fn, constants) {
//     let code = fn
//     if (typeof code === 'function') {
//       code = '(' + fn.toString() + '())'
//     }
//     if (constants) {
//       for (const key in constants) {
//         code = code.replace(key, constants[key])
//       }
//     }
//     return this.eval(code)
//   }

//   /**
// 	 * @param {String} code
// 	 * @returns Promise
// 	 */
//   eval (code) {
//     return new Promise((resolve, reject) => {
//       if (chrome.devtools) {
//         chrome.devtools.inspectedWindow.eval(code, this.target, (result, exceptionInfo) => {
//           if (exceptionInfo) {
//             // proxy.log('code', code)
//             // proxy.warn(exceptionInfo)
//             if (exceptionInfo.isException) {
//               reject(exceptionInfo.value)
//             } else if (exceptionInfo.isError) {
//               if (exceptionInfo.description.match(/%s/) && exceptionInfo.details.length === 1) {
//                 this.warn(exceptionInfo.description.replace(/%s/, exceptionInfo.details[0]))
//                 reject(exceptionInfo.description)
//               }
//             }
//             reject(exceptionInfo)
//           } else {
//             resolve(result)
//           }
//         })
//       } else {
//         resolve(eval(code))
//       }
//     })
//   }

//   /**
// 	 * @param {String} url
// 	 */
//   injectScript (url) {
//     const SCRIPT_URL = url
//     if (chrome.extension) {
//       url = chrome.extension.getURL(url)
//     } else {
//       url = 'http://localhost:8080/' + url
//     }
//     return this.evalFn(function () {
//       const script = window.document.createElement('script')
//       script.src = SCRIPT_URL
//       const html = document.getElementsByTagName('html')[0]
//       html.appendChild(script)
//     }, {
//       SCRIPT_URL: JSON.stringify(url)
//     })
//   }
// }
