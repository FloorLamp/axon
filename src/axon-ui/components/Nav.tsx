import React from "react";
import { shortPrincipal } from "../lib/utils";
import IdentifierLabelWithButtons from "./Buttons/IdentifierLabelWithButtons";
import LoginButton from "./Buttons/LoginButton";
import { useGlobalContext } from "./Store";

export default function Nav() {
  const {
    state: { principal },
  } = useGlobalContext();

  return (
    <nav className="py-4 flex flex-col sm:flex-row items-center justify-between border-b border-black border-opacity-10">
      <img src="/img/axon-full-logo.svg" className="h-14" />
      <div className="flex items-center gap-4">
        {principal && !principal.isAnonymous() && (
          <IdentifierLabelWithButtons type="Principal" id={principal}>
            <span title={principal.toText()}>{shortPrincipal(principal)}</span>
          </IdentifierLabelWithButtons>
        )}
        <LoginButton />
      </div>
    </nav>
  );
}
