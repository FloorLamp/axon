import { DateTime } from "luxon";
import React from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  Action,
  AddHotKey,
  Command,
  Configure,
  Disburse,
  DisburseToNeuron,
  Follow,
  IncreaseDissolveDelay,
  ManageNeuron,
  Motion,
  NeuronCommand,
  Proposal,
  RegisterVote,
  RemoveHotKey,
  SetDissolveTimestamp,
  Spawn,
  Split,
} from "../../declarations/Axon/Axon.did";
import { accountIdentifierToString } from "../../lib/account";
import { formatDuration, secondsToDuration } from "../../lib/datetime";
import { Topic, Vote } from "../../lib/governance";
import useAxonId from "../../lib/hooks/useAxonId";
import { ActionKey, CommandKey, OperationKey } from "../../lib/types";
import { stringify } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import BalanceLabel from "../Labels/BalanceLabel";
import { renderNeuronIdLink } from "../Labels/NeuronIdLink";
import { TimestampLabel } from "../Labels/TimestampLabel";
import { DataRow, DataTable } from "../Proposal/DataTable";

export default function NeuronCommandSummary({
  neuronCommand: [{ neuronIds, command }],
}: {
  neuronCommand: NeuronCommand;
}) {
  return (
    <div className="flex flex-col gap-2">
      <CommandSummary command={command} />
      <NeuronIds neuronIds={neuronIds} />
    </div>
  );
}

function NeuronIds({ neuronIds: [ids] }: { neuronIds: [] | [bigint[]] }) {
  const axonId = useAxonId();

  return (
    <div>
      <strong>Neurons</strong>
      <div>
        {ids ? (
          <ul>
            {ids.map((id) => (
              <li key={id.toString()}>
                <IdentifierLabelWithButtons
                  type="Neuron"
                  id={id}
                  render={renderNeuronIdLink(axonId)}
                />
              </li>
            ))}
          </ul>
        ) : (
          "All"
        )}
      </div>
    </div>
  );
}

function CommandSummary({ command }: { command: Command }) {
  const key = Object.keys(command)[0] as CommandKey;

  switch (key) {
    case "RegisterVote": {
      const { vote, proposal } = command[key] as RegisterVote;
      return (
        <DataTable label="Register Vote">
          <DataRow labelClassName="w-20" label="Vote">
            {Vote[vote] === "Yes" && (
              <span className="inline-flex items-center gap-1">
                <FaCheckCircle className="text-green-400" />
                <strong className="text-green-700">{Vote[vote]}</strong>
              </span>
            )}
            {Vote[vote] === "No" && (
              <span className="inline-flex items-center gap-1">
                <FaTimesCircle className="text-red-400" />
                <strong className="text-red-700">{Vote[vote]}</strong>
              </span>
            )}
          </DataRow>
          <DataRow labelClassName="w-20" label="Proposal">
            <IdentifierLabelWithButtons id={proposal[0].id} type="Proposal" />
          </DataRow>
        </DataTable>
      );
    }
    case "Follow": {
      const { followees, topic } = command[key] as Follow;
      return (
        <DataTable label="Set Following">
          <DataRow labelClassName="w-20" label="Topic">
            {Topic[topic]}
          </DataRow>
          <DataRow labelClassName="w-20" label="Targets">
            {followees.length > 0 && (
              <ul>
                {followees.map(({ id }) => {
                  const nid = id.toString();
                  return (
                    <li key={nid}>
                      <IdentifierLabelWithButtons id={nid} type="Neuron" />
                    </li>
                  );
                })}
              </ul>
            )}
          </DataRow>
        </DataTable>
      );
    }
    case "Spawn": {
      const controller = (command[key] as Spawn).new_controller[0];
      return (
        <DataTable label="Spawn">
          <DataRow labelClassName="w-20" label="Account">
            {controller && (
              <IdentifierLabelWithButtons id={controller} type="Principal" />
            )}
          </DataRow>
        </DataTable>
      );
    }
    case "Split": {
      const amount = (command[key] as Split).amount_e8s;
      return (
        <DataTable label="Spawn">
          <DataRow labelClassName="w-20" label="Amount">
            <BalanceLabel value={amount} />
          </DataRow>
        </DataTable>
      );
    }
    case "Disburse": {
      const {
        to_account: [aid],
        amount: [amt],
      } = command[key] as Disburse;
      return (
        <DataTable label="Disburse">
          <DataRow labelClassName="w-20" label="Account">
            {aid && (
              <IdentifierLabelWithButtons
                id={accountIdentifierToString(aid)}
                type="Account"
              />
            )}
          </DataRow>
          <DataRow labelClassName="w-20" label="Amount">
            {amt && <BalanceLabel value={amt.e8s} />}
          </DataRow>
        </DataTable>
      );
    }
    case "DisburseToNeuron": {
      const {
        new_controller: [controller],
        amount_e8s,
        nonce,
        kyc_verified,
        dissolve_delay_seconds,
      } = command[key] as DisburseToNeuron;
      return (
        <DataTable label="Disburse">
          <DataRow labelClassName="w-20" label="Controller">
            {controller && (
              <IdentifierLabelWithButtons id={controller} type="Principal" />
            )}
          </DataRow>
          <DataRow labelClassName="w-20" label="Amount">
            <BalanceLabel value={amount_e8s} digits={8} />
          </DataRow>
          <DataRow labelClassName="w-20" label="Dissolve Delay">
            {dissolve_delay_seconds.toString()} sec
          </DataRow>
          <DataRow labelClassName="w-20" label="Nonce">
            {nonce.toString()}
          </DataRow>
          <DataRow labelClassName="w-20" label="KYC">
            {kyc_verified ? "Yes" : "No"}
          </DataRow>
        </DataTable>
      );
    }
    case "Configure": {
      const operation = (command[key] as Configure).operation[0];
      const opKey = Object.keys(operation)[0] as OperationKey;
      switch (opKey) {
        case "RemoveHotKey": {
          const {
            hot_key_to_remove: [id],
          } = operation[opKey] as RemoveHotKey;
          return (
            <DataTable label={`Remove Hot Key`}>
              <IdentifierLabelWithButtons id={id} type="Principal" />
            </DataTable>
          );
        }
        case "AddHotKey": {
          const {
            new_hot_key: [id],
          } = operation[opKey] as AddHotKey;
          return (
            <DataTable label={`Add Hot Key`}>
              <IdentifierLabelWithButtons id={id} type="Principal" />
            </DataTable>
          );
        }
        case "StartDissolving":
          return <DataTable label="Start Dissolving" />;
        case "StopDissolving":
          return <DataTable label="Stop Dissolving" />;
        case "IncreaseDissolveDelay": {
          const { additional_dissolve_delay_seconds } = operation[
            opKey
          ] as IncreaseDissolveDelay;
          return (
            <DataTable label="Increase Dissolve Delay">
              <span>
                {formatDuration(
                  secondsToDuration(additional_dissolve_delay_seconds)
                )}
                <span className="text-gray-500 ml-2">
                  ({additional_dissolve_delay_seconds.toString()}s)
                </span>
              </span>
            </DataTable>
          );
        }
        case "SetDissolveTimestamp": {
          const { dissolve_timestamp_seconds } = operation[
            opKey
          ] as SetDissolveTimestamp;
          return (
            <DataTable label="Set Dissolve Timestamp">
              <TimestampLabel
                dt={DateTime.fromSeconds(Number(dissolve_timestamp_seconds))}
              />
            </DataTable>
          );
        }
      }
    }
    case "MakeProposal": {
      const {
        url,
        summary,
        action: [action],
      } = command[key] as Proposal;

      return (
        <DataTable label="Make Proposal">
          <DataRow labelClassName="w-32" label="URL">
            {url && (
              <a
                href={url}
                target="_blank"
                className="break-all hover:underline"
              >
                {url}
              </a>
            )}
          </DataRow>
          <DataRow labelClassName="w-32" label="Summary">
            {summary}
          </DataRow>
          <ActionSummary action={action} />
        </DataTable>
      );
    }
  }
}

const ActionSummary = ({ action }: { action: Action }) => {
  const key = Object.keys(action)[0] as ActionKey;
  const axonId = useAxonId();

  switch (key) {
    case "ManageNeuron":
      const {
        id: [id],
        command: [command],
      } = action[key] as ManageNeuron;
      return (
        <div>
          <div className="xs:flex items-center">
            <DataRow labelClassName="w-32" label="Manage Neuron">
              {id && (
                <IdentifierLabelWithButtons
                  id={id}
                  type="Neuron"
                  render={renderNeuronIdLink(axonId)}
                />
              )}
            </DataRow>
          </div>
          <div>
            <div className="flex gap-1">
              <BsArrowReturnRight className="text-gray-500 pointer-events-none mt-0.5" />
              {command ? (
                <CommandSummary command={command} />
              ) : (
                <span className="text-gray-500 text-xs uppercase">
                  No command
                </span>
              )}
            </div>
          </div>
        </div>
      );
    case "Motion":
      const { motion_text } = action[key] as Motion;
      return (
        <div>
          <label className="font-bold block">Motion</label>
          <p className="leading-tight">{motion_text}</p>
        </div>
      );
    default:
      return <pre className="text-xs">{stringify(action)}</pre>;
  }
};
