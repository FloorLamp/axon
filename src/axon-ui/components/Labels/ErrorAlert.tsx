export default function ErrorAlert({ children }) {
  return (
    <div
      className="px-2 py-1 rounded-md border border-red-500 bg-red-200 text-red-500 text-sm"
      role="alert"
    >
      {children}
    </div>
  );
}
