import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FOUR_HOUR_SEC } from "../lib/constants";

export function ProposalOptionsForm({
  onChangeOptions,
}: {
  onChangeOptions: (any) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeStart, setTimeStart] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [execute, setExecute] = useState(true);

  // Clear state when closed
  useEffect(() => {
    onChangeOptions({ timeStart, durationSeconds, execute });
  }, [timeStart, durationSeconds, execute]);

  return (
    <div className="py-4">
      <label
        className={classNames(
          "group leading-none inline-flex items-center cursor-pointer"
        )}
        onClick={() => setIsVisible(!isVisible)}
      >
        Proposal Settings
        {isVisible ? (
          <FiChevronDown />
        ) : (
          <FiChevronRight className="transform group-hover:translate-x-0.5 transition-transform transition-100" />
        )}
      </label>

      {isVisible && (
        <div className="flex flex-col gap-2 pt-2">
          <div>
            <label>Time Start</label>
            <input
              type="number"
              placeholder="Time Start"
              className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
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
              className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              min={FOUR_HOUR_SEC}
            />
          </div>

          <div>
            <label className="cursor-pointer">
              <input
                type="checkbox"
                className="mr-1"
                checked={execute}
                onChange={(e) => setExecute(e.target.checked)}
              />
              Execute immediately
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
