import { Disclosure } from "@headlessui/react";
import classNames from "classnames";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { FOUR_HOUR_SEC } from "../../lib/constants";
import { ProposalOptions } from "../../lib/types";

export function ProposalOptionsForm({
  onChangeOptions,
}: {
  onChangeOptions: (opts: ProposalOptions) => void;
}) {
  const [timeStart, setTimeStart] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [execute, setExecute] = useState(true);

  // Sync state with parent
  useEffect(() => {
    let maybeTimeStart;
    if (timeStart) {
      try {
        maybeTimeStart = BigInt(DateTime.fromISO(timeStart).toSeconds());
      } catch (err) {}
    }
    onChangeOptions({
      timeStart: maybeTimeStart,
      durationSeconds: durationSeconds ? BigInt(durationSeconds) : undefined,
      execute,
    });
  }, [timeStart, durationSeconds, execute]);

  return (
    <Disclosure as="div" className="py-4">
      {({ open }) => (
        <>
          <Disclosure.Button className="group leading-none inline-flex items-center cursor-pointer px-2 py-1">
            Options
            <FiChevronRight
              className={classNames(
                "transform transition-transform transition-100",
                {
                  "group-hover:translate-x-0.5": !open,
                  "rotate-90": open,
                }
              )}
            />
          </Disclosure.Button>

          <Disclosure.Panel as="div" className="flex flex-col gap-2 pt-2">
            <div>
              <span className="flex justify-between">
                <label>Time Start</label>
                {!!timeStart && (
                  <button
                    type="reset"
                    className="px-2 py-0.5 text-xs leading-none bg-indigo-100 text-indigo-500"
                    onClick={() => setTimeStart("")}
                  >
                    Clear
                  </button>
                )}
              </span>
              <input
                type="datetime-local"
                placeholder="Time Start"
                className="w-full mt-1"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                min={0}
              />
            </div>

            <div>
              <label>Duration (seconds)</label>
              <input
                type="number"
                placeholder="Duration (seconds)"
                className="w-full mt-1"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                min={FOUR_HOUR_SEC}
              />
            </div>

            <div>
              <label
                className={classNames("inline-flex items-center", {
                  "cursor-pointer": !timeStart,
                  "text-gray-400 cursor-not-allowed": !!timeStart,
                })}
              >
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={execute}
                  onChange={(e) => setExecute(e.target.checked)}
                  disabled={!!timeStart}
                />
                Execute immediately
              </label>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
