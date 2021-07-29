import { Principal } from "@dfinity/principal";
import { Disclosure } from "@headlessui/react";
import { DateTime } from "luxon";
import React, { Fragment } from "react";
import { canisterId as AxonCanisterId } from "../../declarations/Axon";
import { Neuron } from "../../declarations/Axon/Axon.did";
import { canisterId as governanceCanisterId } from "../../declarations/Governance";
import { subaccountToAccount } from "../../lib/account";
import { Topic } from "../../lib/governance";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { DisclosureListButton } from "../ExpandableList/ListButton";
import ListPanel from "../ExpandableList/ListPanel";
import BalanceLabel from "../Labels/BalanceLabel";
import ControllerTypeLabel from "../Labels/ControllerTypeLabel";
import { DissolveStateLabel } from "../Labels/DissolveStateLabel";
import { TimestampLabel } from "../Labels/TimestampLabel";
import TopupNeuronModal from "./TopupNeuronModal";

const governanceCanister = Principal.fromText(governanceCanisterId);

const NeuronPanel = ({ neuron }: { neuron: Neuron }) => {
  const controller = neuron.controller[0];
  const account = subaccountToAccount(governanceCanister, neuron.account);

  return (
    <ListPanel>
      <div className="shadow-inner px-6 flex flex-col divide-y divide-gray-200 py-4">
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Account</div>
          <div>
            <IdentifierLabelWithButtons type="Account" id={account} />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Controller</div>
          <div>
            <IdentifierLabelWithButtons type="Principal" id={controller} />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Hot Keys</div>
          <div>
            <ul>
              {neuron.hot_keys.map((hotkey) => (
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
              {neuron.followees.map(([topic, followee]) => (
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
            <TimestampLabel
              dt={DateTime.fromSeconds(
                Number(neuron.created_timestamp_seconds)
              )}
            />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
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
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Stake</div>
          <div>
            <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Maturity</div>
          <div>
            <BalanceLabel value={neuron.maturity_e8s_equivalent} />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">State</div>
          <div>
            <DissolveStateLabel state={neuron.dissolve_state[0]} />
          </div>
        </div>
        <div className="md:flex leading-tight py-2">
          <div className="w-32 font-bold">Actions</div>
          <div>
            <TopupNeuronModal account={account} controller={controller} />
          </div>
        </div>
      </div>
    </ListPanel>
  );
};

export default function NeuronDetails({
  id,
  neuron,
  defaultOpen,
}: {
  id: string;
  neuron: Neuron | null;
  defaultOpen?: boolean;
}) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <DisclosureListButton open={open} disabled={!neuron}>
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 sm:flex-none sm:w-72 md:w-96 xs:flex gap-2 items-center">
                {neuron && (
                  <ControllerTypeLabel
                    type={
                      neuron.controller[0].toText() === AxonCanisterId
                        ? "Controller"
                        : "Hot Key"
                    }
                  />
                )}
                <IdentifierLabelWithButtons type="Neuron" id={id} />
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
          </DisclosureListButton>
          {neuron && <NeuronPanel neuron={neuron} />}
        </>
      )}
    </Disclosure>
  );
}
