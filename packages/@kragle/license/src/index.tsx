import * as base64url from "@pschiffmann/std/base64url";
import { algorithm, publicKeyJwk } from "./keys.js";

const publicKey = await crypto.subtle.importKey(
  "jwk",
  publicKeyJwk,
  algorithm,
  false,
  ["verify"]
);

export interface LicenseProperties {
  /**
   * License owner, formatted as
   * `Philipp Schiffmann <philippschiffmann93@gmail.com>`.
   */
  readonly subject: string;

  /**
   *
   */
  readonly issuedAt: Date;
}

export async function decodeLicenseKey(
  jwt: string
): Promise<LicenseProperties | null> {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  const [header64, payload64, signature64] = parts;
  try {
    const verified = await crypto.subtle.verify(
      publicKey.algorithm.name,
      publicKey,
      base64url.decode(signature64),
      new TextEncoder().encode(`${header64}.${payload64}`)
    );
    if (!verified) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64url.decode(payload64))
    );
    return { subject: payload.sub, issuedAt: new Date(payload.iat * 1000) };
  } catch (e) {
    return null;
  }
}
