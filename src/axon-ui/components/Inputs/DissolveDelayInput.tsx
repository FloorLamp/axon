export default function DissolveDelayInput({
  value,
  onChange,
  required = true,
}: {
  value: string;
  onChange: (string) => void;
  required?: boolean;
}) {
  return (
    <input
      type="number"
      placeholder="Dissolve Delay"
      className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
      value={value}
      onChange={onChange}
      min={0}
      max={252_460_800}
      required={required}
    />
  );
}
