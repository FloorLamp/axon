import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FOUR_HOUR_SEC } from "../lib/constants";

export function ProposalOptionsForm({
  timeStart,
  setTimeStart,
  durationSeconds,
  setDurationSeconds,
}) {
  const [isVisible, setIsVisible] = useState(false);

  // Clear state when closed
  useEffect(() => {
    if (!isVisible) {
      setTimeStart("");
      setDurationSeconds("");
    }
  }, [isVisible]);

  return (
    <>
      <div>
        <label
          className={classNames(
            "leading-none inline-flex items-center cursor-pointer",
            {
              "text-gray-400": !isVisible,
              "text-black": isVisible,
            }
          )}
          onClick={() => setIsVisible(!isVisible)}
        >
          Proposal Settings
          {isVisible ? <FiChevronDown /> : <FiChevronRight />}
        </label>
      </div>

      {isVisible && (
        <div className="border-t border-gray-300 flex flex-col gap-2 pt-2">
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
        </div>
      )}
    </>
  );
}
