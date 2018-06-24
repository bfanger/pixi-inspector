import { defer } from "rxjs";
import { filter, tap } from "rxjs/operators";

let autoIncrement = 1;

export default function stream(client, command, data) {
  return defer(() => {
    const id = autoIncrement;
    autoIncrement++;
    client.send(command, data, { id });

    return client.connection.message$.pipe(
      filter(message => message.id === id),
      tap(message => {
        if (message.response === "ERROR") {
          throw new Error(message.data);
        }
      })
    );
  });
}
