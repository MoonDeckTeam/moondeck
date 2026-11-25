import { ServerStatus, logger } from "../lib";
import { Subscription, debounceTime } from "rxjs";
import { useContext, useEffect, useState } from "react";
import { MoonDeckContext } from "../contexts";

export function useServerStatus(observe = true): [ServerStatus, boolean] {
  const { connectivityManager } = useContext(MoonDeckContext);
  const [serverStatus, setServerStatus] = useState(connectivityManager.serverProxy.status.value);
  const [refreshStatus, setRefreshStatus] = useState(connectivityManager.serverProxy.refreshing.value);

  useEffect(() => {
    const sub = new Subscription();

    sub.add(connectivityManager.serverProxy.status.asObservable().subscribe((status) => setServerStatus(status)));
    sub.add(connectivityManager.serverProxy.refreshing.asObservable().pipe(debounceTime(1000)).subscribe((refresh) => setRefreshStatus(refresh)));

    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!observe) {
      return;
    }

    connectivityManager.serverAutoRefresh.start().catch((e) => logger.critical(e));
    return () => {
      connectivityManager.serverAutoRefresh.stop().catch((e) => logger.critical(e));
    };
  }, [observe]);

  return [serverStatus, refreshStatus];
}
