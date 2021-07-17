import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { canisterId, createActor } from "../../declarations/Axon";
import { ProposalResult } from "../../declarations/Axon/Axon.did";
import LoginButton from "../components/LoginButton";
import Neurons from "../components/Neurons";

export default function Home() {
  const [axon, setAxon] = useState(
    createActor(canisterId, new HttpAgent({ host: "https://ic0.app" }))
  );
  const [agent, setAgent] = useState<HttpAgent>(null);
  const [operators, setOperators] = useState<Principal[]>(null);
  const [activeProposals, setActiveProposals] = useState<ProposalResult>(null);
  const fetchData = async () => {
    if (!canisterId) return;

    setOperators(await axon.getOperators());
    setActiveProposals(await axon.getActiveProposals());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [principal, setPrincipal] = useState(null);
  useEffect(() => {
    if (agent) {
      setAxon(createActor(canisterId, agent));
      (async () => {
        setPrincipal(await agent.getPrincipal());
      })();
    }
  }, [agent]);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-yellow-300 to-pink-500">
      <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg p-4">
        <Head>
          <title>Axon UI</title>
          <meta name="description" content="Decentralized neuron management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col gap-8">
          <div className="flex flex-col items-center py-4 gap-4">
            <h1 className="text-5xl font-bold filter drop-shadow-md font-display">
              Axon
            </h1>
            {principal && principal.toText()}
            <LoginButton agent={agent} setAgent={setAgent} />
          </div>
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

          <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Operators</h2>
            {operators ? (
              <ul>
                {operators.map((p) => (
                  <li key={p.toText()}>{p.toText()}</li>
                ))}
              </ul>
            ) : (
              "Loading..."
            )}
          </section>

          <Neurons axon={axon} isAuthed={!!agent} />

          <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Active Proposals</h2>
            {activeProposals ? (
              "ok" in activeProposals ? (
                activeProposals.ok.length > 0 ? (
                  <ul>
                    {activeProposals.ok.map((p) => (
                      <li key={p.id.toString()}>p.id</li>
                    ))}
                  </ul>
                ) : (
                  "None"
                )
              ) : (
                JSON.stringify(activeProposals.err)
              )
            ) : (
              "Loading..."
            )}
          </section>
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
