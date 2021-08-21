import Link from "next/link";
import React from "react";
import { IdentifierRenderProps } from "../Buttons/IdentifierLabelWithButtons";

export const renderNeuronIdLink = (axonId: string) => {
  return ({ rawId, displayId, name }: IdentifierRenderProps) => {
    const display = name ?? displayId;
    return (
      <Link href={`/axon/${axonId}/neuron/${rawId}`}>
        <a className="text-blue-600 font-semibold hover:underline cursor-pointer">
          {display}
        </a>
      </Link>
    );
  };
};
