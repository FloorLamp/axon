import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224.js";

export const subaccountToAccount = (principal: Principal, bytes: number[]) => {
  const subaccount = Buffer.from(bytes);
  const aId = Buffer.from(
    sha224(
      Buffer.concat([
        Buffer.from("\x0Aaccount-id"),
        Buffer.from(principal.toUint8Array()),
        subaccount,
      ])
    )
  );
  return addCrc32(aId).toString("hex");
};

export const addCrc32 = (buf: Buffer): Buffer => {
  const crc32Buf = Buffer.alloc(4);
  crc32Buf.writeUInt32BE(getCrc32(buf), 0);
  return Buffer.concat([crc32Buf, buf]);
};

export const isAccount = (string: string) => {
  try {
    const blob = Buffer.from(string, "hex");
    const crc32Buf = Buffer.alloc(4);
    crc32Buf.writeUInt32BE(getCrc32(blob.slice(4)));
    return blob.slice(0, 4).toString() === crc32Buf.toString();
  } catch (error) {
    return false;
  }
};
