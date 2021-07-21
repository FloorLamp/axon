export default function SuccessAlert({ children }) {
  return (
    <div
      className="px-2 py-1 rounded-md bg-green-100 text-green-700 w-max"
      role="alert"
    >
      {children}
    </div>
  );
}
