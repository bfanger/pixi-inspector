// import { Subject } from 'rxjs/Subject'
// import { Observable } from 'rxjs/Subject'

/**
 * Async access to the Inspector.
 */
export default class Proxy {
  constructor (index, target) {
    if (typeof index === 'object') {
      this.inspector = index
    } else {
      this.path = '__PIXI_INSPECTOR_GLOBAL_HOOK__.inspectors[' + index + ']'
      this.target = target
    }
    this.tree = {
      collapsed: true,
      children: false
    }
    this.selected = false
    this.call('tree').then(tree => {
      this.tree = tree
      // console.log(tree)
      // Vue.set(this, 'tree', tree)
    })
  }

  expand (node) {
    return this.call('expand', node.id).then(children => {
      node.collapsed = false
      node.children = children
    })
  }
  collapse (node) {
    return this.call('collapse', node.id).then(children => {
      node.collapsed = true
      node.children = children
    })
  }
  select (node) {
    return this.call('select', node.id).then(() => {
      if (this.selected) {
        delete this.selected.selected
      }
      node.selected = true
    })
  }
  // highlight (id) {
  //   return this.call('highlight', id).then(value => {
  //     // this.refresh$.next('highlight');
  //     return value
  //   })
  // }
  call (method, ...args) {
    if (!chrome.devtools) {
      return Promise.resolve(this.inspector[method].apply(this.inspector, args))
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
