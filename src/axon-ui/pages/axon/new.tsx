import React from "react";
import CreateAxonForm from "../../components/Axons/CreateAxonForm";
import Panel from "../../components/Containers/Panel";
import { useGlobalContext } from "../../components/Store/Store";

export default function CreateAxonPage() {
  const {
    state: { isAuthed },
  } = useGlobalContext();

  return (
    <div className=" flex flex-col gap-8 items-center pt-8">
      <Panel className="p-8 max-w-xl">
        {!isAuthed ? "Login to create an Axon!" : <CreateAxonForm />}
      </Panel>
    </div>
  );
}
