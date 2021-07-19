import {
  AddHotKey,
  Command,
  Configure,
  IncreaseDissolveDelay,
} from "../../declarations/Axon/Axon.did";
import { CommandKey, OperationKey } from "../../lib/types";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";

export default function CommandDescription({ command }: { command: Command }) {
  const key = Object.keys(command)[0] as CommandKey;
  switch (key) {
    case "Configure": {
      const operation = (command[key] as Configure).operation[0];
      const opKey = Object.keys(operation)[0] as OperationKey;
      switch (opKey) {
        case "AddHotKey":
        case "RemoveHotKey":
          const {
            new_hot_key: [id],
          } = operation[opKey] as AddHotKey;
          return (
            <span>
              <strong>
                {opKey === "AddHotKey" ? "Add" : "Remove"} Hot Key
              </strong>
              <IdentifierLabelWithButtons id={id} type="Principal">
                {id.toText()}
              </IdentifierLabelWithButtons>
            </span>
          );
        case "StartDissolving":
          return <strong>Start Dissolving</strong>;
        case "StopDissolving":
          return <strong>Stop Dissolving</strong>;
        case "IncreaseDissolveDelay":
          const { additional_dissolve_delay_seconds } = operation[
            opKey
          ] as IncreaseDissolveDelay;
          return (
            <span>
              <strong>Increase Dissolve Delay</strong> by{" "}
              <strong>{additional_dissolve_delay_seconds}s</strong>
            </span>
          );
      }
    }
    default:
      return <>{JSON.stringify(command)}</>;
  }
}
