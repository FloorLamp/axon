import { Principal } from "@dfinity/principal";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import ActiveProposals from "../components/ActiveProposals";
import LoginButton from "../components/Buttons/LoginButton";
import Neurons from "../components/Neurons";
import Operators from "../components/Operators";
import { useGlobalContext } from "../components/Store";
import { canisterId } from "../declarations/Axon";
import { shortPrincipal } from "../lib/utils";

export default function Home() {
  const {
    state: { agent },
  } = useGlobalContext();

  const [principal, setPrincipal] = useState<Principal>(null);
  useEffect(() => {
    if (agent) {
      (async () => {
        setPrincipal(await agent.getPrincipal());
      })();
    } else {
      setPrincipal(null);
    }
  }, [agent]);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-yellow-300 to-pink-500">
      <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
        <Head>
          <title>Axon</title>
          <meta name="description" content="Neuron management canister" />
          <link rel="icon" href="/img/axon-logo.svg" />
        </Head>

        <main className="flex flex-col gap-8 justify-start">
          <nav className="py-4 flex items-center justify-between border-b border-black border-opacity-10">
            <img src="/img/axon-full-logo.svg" className="h-14" />
            <div className="flex items-center gap-4">
              {principal && (
                <span title={principal.toText()}>
                  {!principal.isAnonymous() && shortPrincipal(principal)}
                </span>
              )}
              <LoginButton />
            </div>
          </nav>
          <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Canister</h2>
            {canisterId ? (
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://ic.rocks/principal/${canisterId}`}
              >
                {canisterId}
              </a>
            ) : (
              "Not found"
            )}
          </section>

          <Operators />

          <Neurons />

          <ActiveProposals />
        </main>

        <footer className="py-8 flex justify-center">
          <a
            href="https://github.com/FloorLamp/axon"
            className="underline inline-flex items-center gap-1 text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub /> Github
          </a>
        </footer>
      </div>
    </div>
  );
}
