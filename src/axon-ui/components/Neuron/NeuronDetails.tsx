import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import React, { Fragment } from "react";
import { canisterId as governanceCanisterId } from "../../declarations/Governance";
import { subaccountToAccount } from "../../lib/account";
import { Topic } from "../../lib/governance";
import { useIsMember } from "../../lib/hooks/Axon/useIsMember";
import { useNeuronRelationships } from "../../lib/hooks/Axon/useNeuronRelationships";
import useAxonId from "../../lib/hooks/useAxonId";
import { calculateVotingPower, parseDissolveState } from "../../lib/neurons";
import { formatNumber } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import Panel from "../Containers/Panel";
import BalanceLabel from "../Labels/BalanceLabel";
import ControllerTypeLabel from "../Labels/ControllerTypeLabel";
import { DissolveStateLabel } from "../Labels/DissolveStateLabel";
import { renderNeuronIdLink } from "../Labels/NeuronIdLink";
import { TimestampLabel } from "../Labels/TimestampLabel";
import RemoveHotkeyModal from "./RemoveHotkeyModal";
import TopupNeuronModal from "./TopupNeuronModal";

const governanceCanister = Principal.fromText(governanceCanisterId);

export default function NeuronDetails({ neuronId }: { neuronId: string }) {
  const axonId = useAxonId();
  const isMember = useIsMember();
  const neurons = useNeuronRelationships();
  const neuron = neurons.find((fn) => fn.id[0].id.toString() === neuronId);

  const controller = neuron?.controller[0];
  const account = neuron
    ? subaccountToAccount(governanceCanister, neuron.account)
    : null;

  const votingPower = neuron ? calculateVotingPower(neuron) / 1e8 : null;
  const isSpawnable = neuron?.maturity_e8s_equivalent > BigInt(1e8);

  const dissolveState = neuron
    ? parseDissolveState(neuron.dissolve_state[0])
    : null;

  return (
    <div className="flex flex-col gap-4 xs:gap-8">
      <div className="flex flex-col md:flex-row gap-4 xs:gap-8">
        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">Neuron</label>
          <h2 className="text-xl font-bold">{neuronId}</h2>
        </Panel>

        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">Stake</label>
          <h2 className="text-2xl font-bold">
            {neuron && (
              <BalanceLabel
                value={neuron.cached_neuron_stake_e8s - neuron.neuron_fees_e8s}
              />
            )}
          </h2>
        </Panel>

        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">Maturity</label>
          {isSpawnable && (
            <label className="ml-2 bg-green-300 text-green-700 px-2 py-0.5 rounded uppercase text-xs">
              Spawnable
            </label>
          )}
          <h2 className="text-2xl font-bold">
            {neuron && <BalanceLabel value={neuron.maturity_e8s_equivalent} />}
          </h2>
        </Panel>

        <Panel className="flex-1 p-4">
          <label className="text-gray-500 uppercase text-sm">
            Voting Power
          </label>
          <h2 className="text-2xl font-bold">
            {neuron && (
              <>
                {formatNumber(votingPower)}{" "}
                {votingPower > 0 && <span className="text-xs">×10⁸</span>}
              </>
            )}
          </h2>
        </Panel>
      </div>

      <Panel className="px-6 flex flex-col divide-y divide-gray-200 py-4">
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Type</div>
          <div>{neuron && <ControllerTypeLabel type={neuron._type} />}</div>
        </div>
        {neuron?._managedBy.length > 0 && (
          <div className="md:flex leading-tight py-2">
            <div className="w-32 font-bold">
              Managed By ({neuron._managedBy.length})
            </div>
            <div>
              <ul>
                {neuron._managedBy.map((nid) => (
                  <li key={nid}>
                    {nid === neuronId ? (
                      "This Neuron"
                    ) : (
                      <IdentifierLabelWithButtons
                        type="Neuron"
                        id={nid}
                        render={renderNeuronIdLink(axonId)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {neuron?._managerOf.length > 0 && (
          <div className="md:flex leading-tight py-2">
            <div className="w-32 font-bold">
              Manager Of ({neuron._managerOf.length})
            </div>
            <div className="flex-1">
              <ul className="overflow-y-auto" style={{ maxHeight: "20rem" }}>
                {neuron._managerOf.map((id) => (
                  <li key={id}>
                    {id === neuronId ? (
                      "This Neuron"
                    ) : (
                      <IdentifierLabelWithButtons
                        type="Neuron"
                        id={id}
                        render={renderNeuronIdLink(axonId)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Account</div>
          <div>
            {account && (
              <IdentifierLabelWithButtons type="Account" id={account} />
            )}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Controller</div>
          <div>
            {neuron && (
              <IdentifierLabelWithButtons type="Principal" id={controller} />
            )}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Hot Keys</div>
          <div>
            <ul>
              {neuron?.hot_keys.map((hotkey) => (
                <li key={hotkey.toText()}>
                  <IdentifierLabelWithButtons type="Principal" id={hotkey} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Following</div>
          <div>
            <div className="xs:grid grid-cols-label">
              {neuron?.followees.map(([topic, followee]) => (
                <Fragment key={topic}>
                  <div className="pr-4">
                    <div className="flex h-4 items-end">
                      <span className="uppercase text-xs text-gray-500 leading-none">
                        {Topic[topic]}
                      </span>
                    </div>
                  </div>
                  <ul>
                    {followee.followees.map((f) => (
                      <li key={f.id.toString()}>
                        <IdentifierLabelWithButtons type="Neuron" id={f.id} />
                      </li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Created</div>
          <div>
            {neuron && (
              <TimestampLabel
                dt={DateTime.fromSeconds(
                  Number(neuron.created_timestamp_seconds)
                )}
              />
            )}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Aging Since</div>
          <div>
            {neuron &&
            neuron.aging_since_timestamp_seconds < BigInt("2000000000") ? (
              <TimestampLabel
                dt={DateTime.fromSeconds(
                  Number(neuron.aging_since_timestamp_seconds)
                )}
              />
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">State</div>
          <div>
            {neuron && (
              <DissolveStateLabel dissolveState={neuron.dissolve_state[0]} />
            )}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Dissolve Date</div>
          <div>
            {neuron &&
              (dissolveState.datetime ? (
                <TimestampLabel
                  dt={dissolveState.datetime}
                  showRelative={false}
                />
              ) : (
                "-"
              ))}
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Actions</div>
          <div className="flex gap-2">
            <TopupNeuronModal account={account} controller={controller} />
            {isMember && neuron?._type === "Hot Key" && (
              <RemoveHotkeyModal neuronId={neuronId} />
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
