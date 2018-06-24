import { Subject, defer, concat, merge as mergeObservables } from "rxjs";
import { tap, merge, publishReplay, refCount, map } from "rxjs/operators";
import asyncEval from "../devtools-rx/asyncEval";
import connection from "./connection";

/**
 * Async access to the Inspector.
 *
 *
 * All operations return Promises
 */
export default class AsyncInspector {
  constructor(index, target) {
    if (typeof index === "object") {
      this.inspector = index;
    } else {
      this.path = "__PIXI_INSPECTOR_GLOBAL_HOOK__.inspectors[" + index + "]";
      this.target = target;
    }
    this.local = {
      selected$: new Subject(),
      treeChange$: new Subject()
    };
    this.tree$ = defer(() => {
      let root;
      return concat(
        this.call("outliner.tree"),
        connection.on("TREE").pipe(map(message => message.data))
      ).pipe(
        tap(tree => {
          root = tree;
        }),
        merge(this.local.treeChange$.pipe(map(() => root)))
      );
    }).pipe(
      publishReplay(1),
      refCount()
    );

    this.selected$ = mergeObservables(
      defer(() => this.call("outliner.selected")),
      connection.on("SELECTED").pipe(map(message => message.data)),
      this.local.selected$
    );
  }

  enable() {
    return this.call("enable");
  }

  disable() {
    return this.call("disable");
  }

  expand(node) {
    return this.call("outliner.expand", node.id).then(children => {
      node.collapsed = false;
      node.children = children;
      this.local.treeChange$.next(node);
    });
  }
  collapse(node) {
    return this.call("outliner.collapse", node.id).then(children => {
      node.collapsed = true;
      node.children = children;
      this.local.treeChange$.next(node);
    });
  }
  toggle(node) {
    if (node.collapsed) {
      return this.expand(node);
    }
    return this.collapse(node);
  }
  searchFilter(search) {
    this.call("outliner.searchFilter", search).then(() => {
      this.local.treeChange$.next(search);
    });
  }
  select(node) {
    return this.call("outliner.select", node.id).then(() => {
      this.local.selected$.next(node);
    });
  }

  setProperty(path, value) {
    return this.call("properties.set", path, value);
  }

  highlight(node) {
    return this.call("outliner.highlight", node.id);
  }

  call(method, ...args) {
    if (!chrome.devtools) {
      const dot = method.indexOf(".");
      let value;
      if (dot === -1) {
        value = this.inspector[method](...args);
      } else {
        const helper = this.inspector[method.substr(0, dot)];
        const _method = method.substr(dot + 1);
        value = helper[_method](...args);
      }
      if (typeof value !== "undefined") {
        value = JSON.parse(JSON.stringify(value));
      }
      return Promise.resolve(value);
    }
    const code =
      this.path +
      "." +
      method +
      "(" +
      args.map(arg => JSON.stringify(arg)).join(", ") +
      ")";
    return asyncEval(code, this.target);
  }
}
