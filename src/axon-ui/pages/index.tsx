import Head from "next/head";
import React from "react";
import { FaGithub } from "react-icons/fa";
import ActiveProposals from "../components/ActiveProposals";
import IdentifierLabelWithButtons from "../components/Buttons/IdentifierLabelWithButtons";
import Nav from "../components/Nav";
import Neurons from "../components/Neurons";
import Operators from "../components/Operators";
import { canisterId } from "../declarations/Axon";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-yellow-300 to-pink-500">
      <div className="flex flex-col justify-between min-h-screen w-full sm:max-w-screen-lg px-4">
        <Head>
          <title>Axon</title>
          <meta name="description" content="Neuron management canister" />
          <link rel="icon" href="/img/axon-logo.svg" />
        </Head>

        <main className="flex flex-col gap-8 justify-start">
          <Nav />

          <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Canister</h2>
            <IdentifierLabelWithButtons type="Principal" id={canisterId}>
              {canisterId}
            </IdentifierLabelWithButtons>
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
