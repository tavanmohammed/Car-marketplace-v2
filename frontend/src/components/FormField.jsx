export default function FormField({ label, required, children, className = "" }) {
  return (
    <label className={`grid gap-1 text-sm ${className}`}>
      {label}
      {required && <span className="text-red-500">*</span>}
      {children}
    </label>
  );
}
