import { useCallback, useEffect, useState } from "react";
import { DEFAULT_BGC_COORDS, requestUserLocation, type LocationPermission, type UserCoordinates } from "../services/locationService";

/** Location + permission for Discover; a manual City/ZIP seed unblocks the map when GPS is denied. */
export function useDiscoverLocation() {
  const [coords, setCoords] = useState<UserCoordinates>(DEFAULT_BGC_COORDS);
  const [permission, setPermission] = useState<LocationPermission>("undetermined");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const refresh = useCallback(async () => {
    const res = await requestUserLocation();
    setPermission(res.permission);
    setCanAskAgain(res.canAskAgain);
    if (res.permission === "granted") {
      setCoords(res.coords);
      setSeeded(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const applySeed = useCallback((seed: UserCoordinates) => {
    setCoords(seed);
    setSeeded(true);
  }, []);

  /** Map stays hard-blocked until permission is granted or a manual seed exists (Spec 3.6). */
  const isBlocked = permission === "denied" && !seeded;
  return { coords, permission, canAskAgain, isBlocked, seeded, refresh, applySeed };
}
