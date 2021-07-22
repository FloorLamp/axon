import { Principal } from "@dfinity/principal";
import { Disclosure } from "@headlessui/react";
import { DateTime } from "luxon";
import React from "react";
import { CgSpinner } from "react-icons/cg";
import { Neuron } from "../../declarations/Axon/Axon.did";
import { canisterId as governanceCanisterId } from "../../declarations/Governance";
import { subaccountToAccount } from "../../lib/account";
import { Topic } from "../../lib/governance";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import ListButton from "../ExpandableList/ListButton";
import ListPanel from "../ExpandableList/ListPanel";
import BalanceLabel from "../Labels/BalanceLabel";
import { DissolveStateLabel } from "../Labels/DissolveStateLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";

const governanceCanister = Principal.fromText(governanceCanisterId);

const NeuronPanel = ({ neuron }: { neuron: Neuron }) => {
  const controller = neuron.controller[0];
  const account = subaccountToAccount(governanceCanister, neuron.account);

  return (
    <ListPanel>
      <div className="shadow-inner px-6 flex flex-col divide-y divide-gray-200 py-4">
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Account</div>
          <div>
            <IdentifierLabelWithButtons type="Account" id={account}>
              {account}
            </IdentifierLabelWithButtons>
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Controller</div>
          <div>
            <IdentifierLabelWithButtons type="Principal" id={controller}>
              {controller.toText()}
            </IdentifierLabelWithButtons>
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Hot Keys</div>
          <div>
            <ul>
              {neuron.hot_keys.map((hotkey) => (
                <li key={hotkey.toText()}>
                  <IdentifierLabelWithButtons type="Principal" id={hotkey}>
                    {hotkey.toText()}
                  </IdentifierLabelWithButtons>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Following</div>
          <div>
            <ul>
              {neuron.followees.map(([topic, followee]) => (
                <li key={topic} className="divide-x divide-gray-400">
                  <label className="pr-2">{Topic[topic]}</label>
                  <span className="pl-2">
                    {followee.followees.map((f) => f.id).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Created</div>
          <div>
            <TimestampLabel
              dt={DateTime.fromSeconds(
                Number(neuron.created_timestamp_seconds)
              )}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Aging Since</div>
          <div>
            {neuron.aging_since_timestamp_seconds < BigInt("2000000000") ? (
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
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Stake</div>
          <div>
            <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">Maturity</div>
          <div>
            <BalanceLabel value={neuron.maturity_e8s_equivalent} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row leading-tight py-2">
          <div className="w-32 font-bold">State</div>
          <div>
            <DissolveStateLabel state={neuron.dissolve_state[0]} />
          </div>
        </div>
      </div>
    </ListPanel>
  );
};

export default function NeuronDetails({
  id,
  isFetching,
  neuron,
  defaultOpen,
}: {
  id: string;
  isFetching?: boolean;
  neuron: Neuron | null;
  defaultOpen?: boolean;
}) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <ListButton open={open} disabled={!neuron}>
            <div className="flex flex-col sm:flex-row">
              <div className="w-64 flex gap-2 items-center">
                <IdentifierLabelWithButtons type="Neuron" id={id}>
                  {id}
                </IdentifierLabelWithButtons>
                {isFetching && <CgSpinner className="block animate-spin" />}
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
                {neuron && (
                  <>
                    <DissolveStateLabel state={neuron.dissolve_state[0]} />
                    <div className="flex-1 sm:pr-8 sm:text-right">
                      <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </ListButton>
          {neuron && <NeuronPanel neuron={neuron} />}
        </>
      )}
    </Disclosure>
  );
}
