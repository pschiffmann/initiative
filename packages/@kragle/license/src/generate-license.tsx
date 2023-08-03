import * as base64url from "@pschiffmann/std/base64url";
import { webcrypto } from "node:crypto";
import { algorithm, privateKeyJwk } from "./keys.js";

const subject = "Philipp Schiffmann <philippschiffmann93@gmail.com>";
const issuer = "@kragle/license@0.1.0";
const issuedAt = new Date("2019-01-01T00:00:00.000Z");

const privateKey = await webcrypto.subtle.importKey(
  "jwk",
  privateKeyJwk,
  algorithm,
  false,
  ["sign"],
);

async function main() {
  const header = JSON.stringify({
    alg: "RS256",
    typ: "JWT",
  });
  const payload = JSON.stringify({
    iss: issuer,
    sub: subject,
    iat: Math.trunc(issuedAt.getTime() / 1000),
  });

  const textEncoder = new TextEncoder();
  const header64 = base64url.encode(textEncoder.encode(header));
  const payload64 = base64url.encode(textEncoder.encode(payload));
  const signature = await webcrypto.subtle.sign(
    privateKey.algorithm.name,
    privateKey,
    textEncoder.encode(`${header64}.${payload64}`),
  );
  const signature64 = base64url.encode(new Uint8Array(signature));
  const jwt = `${header64}.${payload64}.${signature64}`;

  console.log(`License for ${payload}:`);
  console.log(jwt);
}

main();
