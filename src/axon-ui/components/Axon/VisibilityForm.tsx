import classNames from "classnames";
import React, { useEffect, useState } from "react";
import {
  AxonCommandRequest,
  Visibility,
} from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";

export function VisibilityForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [isPublic, setIsPublic] = useState(
    "Public" in data?.visibility ?? true
  );

  useEffect(() => {
    makeCommand({
      SetVisibility: {
        [isPublic ? "Public" : "Private"]: null,
      } as Visibility,
    });
  }, [isPublic]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-tight">
        Choose who can view full neuron data.
      </p>

      <label
        className={classNames(
          "flex py-2 px-4 rounded-md border border-transparent",
          {
            "bg-indigo-100 border-indigo-400": isPublic,
          }
        )}
      >
        <div className="w-6">
          <input
            type="radio"
            onChange={(e) => setIsPublic(true)}
            checked={isPublic}
          />
        </div>
        <div>
          <strong>Public</strong>
          <p className="text-sm text-gray-500">
            Neuron data can be viewed by anyone
          </p>
        </div>
      </label>

      <label
        className={classNames(
          "flex py-2 px-4 rounded-md border border-transparent",
          {
            "bg-indigo-100 border-indigo-400": !isPublic,
          }
        )}
      >
        <div className="w-6">
          <input
            type="radio"
            onChange={(e) => setIsPublic(false)}
            checked={!isPublic}
          />
        </div>
        <div>
          <strong>Private</strong>
          <p className="text-sm text-gray-500">
            Only owners can view neuron data
          </p>
        </div>
      </label>
    </div>
  );
}
