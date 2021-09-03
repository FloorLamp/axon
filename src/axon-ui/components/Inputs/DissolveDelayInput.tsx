import {
  MAX_DISSOLVE_DELAY_SECONDS,
  MIN_DISSOLVE_DELAY_FOR_VOTE_ELIGIBILITY_SECONDS,
  ONE_DAY_SECONDS,
} from "../../lib/constants";
import { formatDuration, secondsToDuration } from "../../lib/datetime";

export default function DissolveDelayInput({
  value,
  onChange,
  required = true,
}: {
  value: string;
  onChange: (arg: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block">Dissolve Delay</label>
      <div className="flex justify-between">
        <span>
          {!!value && !isNaN(Number(value)) ? (
            formatDuration(secondsToDuration(Number(value)))
          ) : (
            <span className="text-gray-500">Not set</span>
          )}
        </span>
        <div>
          <input
            type="button"
            value="6 mo"
            className="mr-1 text-xs px-2 py-0.5 cursor-pointer btn-secondary"
            onClick={() =>
              onChange(
                MIN_DISSOLVE_DELAY_FOR_VOTE_ELIGIBILITY_SECONDS.toString()
              )
            }
          />
          <input
            type="button"
            value="8 yr"
            className="text-xs px-2 py-0.5 cursor-pointer btn-secondary"
            onClick={() => onChange(MAX_DISSOLVE_DELAY_SECONDS.toString())}
          />
        </div>
      </div>
      <input
        type="range"
        placeholder="Dissolve Delay (sec)"
        className="w-full mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={0}
        step={ONE_DAY_SECONDS}
        max={MAX_DISSOLVE_DELAY_SECONDS}
        required={required}
      />
    </div>
  );
}
