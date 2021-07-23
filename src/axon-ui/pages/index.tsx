import Head from "next/head";
import React from "react";
import { FaGithub } from "react-icons/fa";
import AxonDetails from "../components/Axon/AxonDetails";
import Nav from "../components/Layout/Nav";
import Neurons from "../components/Neuron/Neurons";
import NnsProposals from "../components/NnsProposal/NnsProposals";
import Proposals from "../components/Proposal/Proposals";

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

          <AxonDetails />

          <Neurons />

          <Proposals />

          <NnsProposals />
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
