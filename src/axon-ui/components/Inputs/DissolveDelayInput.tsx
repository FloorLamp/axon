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
      className="w-full mt-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={0}
      max={252_460_800}
      required={required}
    />
  );
}
