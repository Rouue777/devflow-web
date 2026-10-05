export function DeveloperCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-slate-500 ${className}`}>
      Desenvolvido por{" "}
      <a
        href="https://www.linkedin.com/in/jefersonsantos36/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-current underline-offset-4 transition hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        JefersonPaixãoDev
      </a>
    </p>
  );
}
