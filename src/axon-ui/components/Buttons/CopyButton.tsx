import { BsCheck } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";
import { useClipboard } from "use-clipboard-copy";

export default function CopyButton({
  text,
  title,
}: {
  text: string;
  title?: string;
}) {
  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });

  const handleClick = (e) => {
    e.stopPropagation();
    clipboard.copy(text);
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer filter hover:drop-shadow opacity-50 hover:opacity-100 transition-all"
      title={title}
    >
      {clipboard.copied ? <BsCheck /> : <MdContentCopy />}
    </button>
  );
}
