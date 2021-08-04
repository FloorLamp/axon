import React, { useEffect, useState } from "react";
import { Action } from "../../declarations/Governance/Governance.did.d";
import useDebounce from "../../lib/hooks/useDebounce";

export default function MotionForm({
  setAction,
}: {
  setAction: (cmd: Action | null) => void;
}) {
  const [text, setText] = useState("");

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
