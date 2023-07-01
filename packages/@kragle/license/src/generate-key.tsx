import { webcrypto } from "node:crypto";
import { algorithm } from "./keys.js";

async function main() {
  const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
    {
      ...algorithm,
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    },
    true,
    ["sign", "verify"]
  );

  console.log("public key:");
  console.log(
    JSON.stringify(await webcrypto.subtle.exportKey("jwk", publicKey), null, 2)
  );

  console.log("private key:");
  console.log(
    JSON.stringify(await webcrypto.subtle.exportKey("jwk", privateKey), null, 2)
  );
}

await main();
