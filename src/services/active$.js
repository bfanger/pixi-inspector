import { shareReplay, map } from "rxjs/operators";
import connection from "./connection";

export default connection
  .to("devtools_page")
  .stream("PANEL_VISIBLE")
  .pipe(
    map(message => message.data),
    shareReplay(1)
  );
