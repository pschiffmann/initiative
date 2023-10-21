import { LicenseProperties, decodeLicenseKey } from "#license";
import { get, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";

const idbKey = "@initiative.dev/ide::license-key";

export interface LicenseData {
  readonly key: string;
  readonly properties: LicenseProperties | null;
}

export function useLicense() {
  const [licenseData, setLicenseData] = useState<LicenseData>(() => ({
    key: "",
    properties: null,
  }));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const key = await get(idbKey);
      if (cancelled || typeof key !== "string") return;
      const properties = await decodeLicenseKey(key);
      if (!cancelled) setLicenseData({ key, properties });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveLicenseKey = useCallback(async (key: string) => {
    set(idbKey, key);
    setLicenseData({ key, properties: await decodeLicenseKey(key) });
  }, []);

  return { licenseData, saveLicenseKey };
}
