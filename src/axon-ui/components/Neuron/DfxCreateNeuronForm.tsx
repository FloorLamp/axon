import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc.js";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224.js";
import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import React, { useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import shajs from "sha.js";
import { canisterId } from "../../declarations/Governance";
import CodeBlockWithCopy from "../Inputs/CodeBlockWithCopy";

export const addCrc32 = (buf: Buffer): Buffer => {
  const crc32Buf = Buffer.alloc(4);
  crc32Buf.writeUInt32BE(getCrc32(buf), 0);
  return Buffer.concat([crc32Buf, buf]);
};
const accountIdentifierFromSubaccount = (
  principal: Buffer,
  subaccount: Buffer
) => {
  const preimage = Buffer.concat([
    Buffer.from("\x0Aaccount-id"),
    principal,
    subaccount,
  ]);
  const hashed = Buffer.from(sha224(preimage));
  return addCrc32(hashed).toString("hex");
};

export function DfxCreateNeuronForm({}: {}) {
  const [principal, setPrincipal] = useState("");

  const dfxCommands = useMemo(() => {
    let pbuf: Buffer;
    try {
      pbuf = Buffer.from(Principal.fromText(principal).toUint8Array());
    } catch (error) {
      return "Enter a principal...";
    }

    const nonce = 0;
    const nonceBuf = Buffer.alloc(8);
    const buf = Buffer.concat([
      Buffer.from("\x0Cneuron-stake"),
      pbuf,
      nonceBuf,
    ]);

    const subaccount = shajs("sha256").update(buf).digest();

    const account = accountIdentifierFromSubaccount(
      Buffer.from(Principal.fromText(canisterId).toUint8Array()),
      subaccount
    );
    return `dfx ledger --network ic transfer ${account} --amount 1 --memo ${nonce} && dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai claim_or_refresh_neuron_from_account "(record {controller=principal \"${principal}\"; memo=${nonce}:nat64})"`;
  }, [principal]);

  return (
    <Disclosure as="div" className="">
      {({ open }) => (
        <>
          <Disclosure.Button className="group leading-none inline-flex items-center cursor-pointer text-sm">
            Show commands
            <FiChevronRight
              className={classNames(
                "transform transition-transform transition-100",
                {
                  "group-hover:translate-x-0.5": !open,
                  "rotate-90": open,
                }
              )}
            />
          </Disclosure.Button>

          <Disclosure.Panel as="div" className="flex flex-col gap-2 pt-2">
            <label className="block">
              Principal (Controller of the new Neuron)
              <input
                type="text"
                placeholder="Principal"
                className="w-full mt-1"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                maxLength={64}
                required
              />
            </label>

            <CodeBlockWithCopy value={dfxCommands} />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
