import React from "react";
import { BsCheck, BsClipboard } from "react-icons/bs";
import { useClipboard } from "use-clipboard-copy";

export default function CodeBlockWithCopy({ value }: { value: string }) {
  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });

  const handleCopy = (e) => {
    clipboard.copy(value);
  };
  return (
    <div className="group relative p-2 bg-gray-200 rounded text-xs">
      <button
        onClick={handleCopy}
        className="hidden group-hover:block absolute right-2 top-2 z-10 p-2 bg-gray-300 text-gray-800 fill-current focus:outline-none rounded border border-gray-400 border-0.5"
      >
        {clipboard.copied ? <BsCheck /> : <BsClipboard />}
      </button>
      <code>{value}</code>
    </div>
  );
}
