import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Axons from "../components/Axons/Axons";
import Panel from "../components/Containers/Panel";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <Panel className="p-8 text-xl">
        <div className="flex justify-between">
          <span>
            <strong>Axon</strong> is a multi-user, multi-neuron management
            canister.
          </span>
          <Link href="/axon/new">
            <a className="rounded-md btn-cta px-4 py-2 text-xl inline-flex gap-2 items-center">
              Create Axon <FaArrowRight />
            </a>
          </Link>
        </div>
      </Panel>

      <Axons />
    </div>
  );
}
