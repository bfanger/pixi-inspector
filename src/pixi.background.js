/* eslint-disable no-console */
import { mergeMap, tap, filter } from "rxjs/operators";
import relay$ from "./devtools-rx/relay$";
import connection$ from "./devtools-rx/connection$";
import { debug } from "./services/config";
const verbose = false;
console.info("pixi.background", { debug });

relay$.subscribe();

if (debug && verbose) {
  connection$
    .pipe(
      mergeMap(connection => {
        console.log("new Connection", {
          id: connection.id,
          name: connection.name,
          tabId: connection.tabId
        });
        return connection.message$;
      })
    )
    .subscribe(message => {
      console.log("new Message", message);
    });
}

// Listen to DETECTED messages and show the PageAction icon
connection$
  .pipe(
    mergeMap(connection => {
      const detected$ = connection.message$.pipe(
        filter(message => message.broadcast === "DETECTED")
      );
      return detected$.pipe(
        tap(message => {
          const tabId = connection.tabId;
          debug &&
            console.log("DETECTED", {
              tabId,
              index: message.data.index,
              version: message.data.version
            });
          chrome.pageAction.show(tabId);
          if (message.data.phaser) {
            chrome.pageAction.setTitle({
              tabId,
              title:
                "Phaser " +
                message.data.phaser +
                "( PixiJS " +
                message.data.version +
                " )"
            });
            chrome.pageAction.setIcon({
              tabId,
              path: { "16": "icons/phaser@1x.png", "32": "icons/phaser@2x.png" }
            });
          } else {
            chrome.pageAction.setTitle({
              tabId,
              title: "PixiJS " + message.data.version
            });
            const version = parseInt(message.data.version, 10);
            if (version === 5) {
              chrome.pageAction.setIcon({
                tabId,
                path: { "16": "icons/v5@1x.png", "32": "icons/v5@2x.png" }
              });
            } else if (version === 4) {
              chrome.pageAction.setIcon({
                tabId,
                path: { "16": "icons/v4@1x.png", "32": "icons/v4@2x.png" }
              });
            } else if (version === 3) {
              chrome.pageAction.setIcon({
                tabId,
                path: { "16": "icons/v3@1x.png", "32": "icons/v3@2x.png" }
              });
            } else {
              chrome.pageAction.setIcon({
                tabId,
                path: {
                  "16": "icons/page_action@1x.png",
                  "32": "icons/page_action@2x.png"
                }
              });
            }
          }
        })
      );
    })
  )
  .subscribe();
