import React from "react";
import { Ballot } from "../../declarations/Axon/Axon.did";
import { shortPrincipal } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import VoteLabel from "../Labels/VoteLabel";

export default function Ballots({ ballots }: { ballots: Ballot[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {ballots.map((ballot, i) => {
        const principalText = ballot.principal.toText();
        return (
          <li key={principalText + i} className="flex gap-2">
            <VoteLabel vote={ballot.vote[0]} />
            <IdentifierLabelWithButtons type="Principal" id={ballot.principal}>
              <span title={principalText}>
                {shortPrincipal(ballot.principal)}
              </span>
            </IdentifierLabelWithButtons>
          </li>
        );
      })}
    </ul>
  );
}
