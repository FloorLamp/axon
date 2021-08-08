import React, { useEffect, useState } from "react";
import { Action, Motion } from "../../declarations/Axon/Axon.did";
import useDebounce from "../../lib/hooks/useDebounce";

export default function MotionForm({
  setAction,
  defaults,
}: {
  setAction: (cmd: Action | null) => void;
  defaults?: Motion;
}) {
  const [text, setText] = useState(defaults?.motion_text ?? "");

  const debouncedText = useDebounce(text);

  useEffect(() => {
    if (!text) {
      return setAction(null);
    }

    setAction({
      Motion: {
        motion_text: text,
      },
    });
  }, [debouncedText]);

  return (
    <div>
      <label className="block">Motion</label>
      <textarea
        placeholder="Motion text..."
        className="w-full"
        style={{ minHeight: "5rem" }}
        maxLength={500}
        onChange={(e) => setText(e.target.value)}
        value={text}
        required
      />
    </div>
  );
}
