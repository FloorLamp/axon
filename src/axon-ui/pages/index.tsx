import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa";
import AllAxons from "../components/Axons/AllAxons";
import MyAxons from "../components/Axons/MyAxons";
import Panel from "../components/Containers/Panel";
import { useGlobalContext } from "../components/Store/Store";

export default function Home() {
  const {
    state: { isAuthed },
  } = useGlobalContext();

  return (
    <div className="flex flex-col gap-8 pt-8">
      <Panel className="p-8 text-xl">
        <div className="flex flex-col gap-4 items-start md:flex-row md:justify-between">
          <span>
            <strong>Axon</strong> is a multi-user, multi-neuron management
            canister.
          </span>
          <Link href="/axon/new">
            <a className="rounded-md btn-cta px-4 py-2 text-xl inline-flex gap-2 items-center whitespace-nowrap">
              Create Axon <FaArrowRight />
            </a>
          </Link>
        </div>
      </Panel>

      {isAuthed && <MyAxons />}

      <AllAxons />
    </div>
  );
}
