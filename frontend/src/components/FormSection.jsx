export default function FormSection({ title, required, optional, children }) {
  return (
    <section>
      <h2 className="font-semibold text-lg flex items-center justify-between">
        {title}
        {required && (
          <span className="text-xs text-red-500 font-medium">Required</span>
        )}
        {optional && (
          <span className="text-xs text-zinc-500 font-medium">Optional</span>
        )}
      </h2>
      {children}
    </section>
  );
}
