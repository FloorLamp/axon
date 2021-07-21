import { Principal } from "@dfinity/principal";
import React, { ReactNode } from "react";
import CopyButton from "./CopyButton";
import ExternalLinkButton from "./ExternalLinkButton";

export default function IdentifierLabelWithButtons({
  children,
  type,
  id,
}: {
  children: ReactNode;
  type: "Principal" | "Account" | "Neuron" | "Proposal";
  id: Principal | string | bigint;
}) {
  const str =
    id instanceof Principal
      ? id.toText()
      : typeof id === "bigint"
      ? id.toString()
      : id;
  let link;
  switch (type) {
    case "Principal":
      link = `https://ic.rocks/principal/${str}`;
      break;
    case "Account":
      link = `https://ic.rocks/account/${str}`;
      break;
    case "Neuron":
      link = `https://ic.rocks/neuron/${str}`;
      break;
    case "Proposal":
      link = `https://ic.rocks/proposal/${str}`;
      break;
  }
  return (
    <span className="flex items-center gap-1 break-all">
      {children}
      <CopyButton text={str} title={`Copy ${type}`} />
      {!!link && <ExternalLinkButton link={link} title="View on ic.rocks" />}
    </span>
  );
}
