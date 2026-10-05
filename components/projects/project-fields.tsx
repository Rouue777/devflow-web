type ProjectFieldsProps = {
  disabled: boolean;
  errors: { nome?: string; descricao?: string };
  defaultValues?: { nome: string; descricao: string };
};

export function ProjectFields({
  disabled,
  errors,
  defaultValues,
}: ProjectFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="nome" className="mb-2 block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={defaultValues?.nome}
          disabled={disabled}
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={errors.nome ? "nome-error" : undefined}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 aria-[invalid=true]:border-red-500"
        />
        {errors.nome ? <p id="nome-error" className="mt-1.5 text-sm text-red-600">{errors.nome}</p> : null}
      </div>
      <div>
        <label htmlFor="descricao" className="mb-2 block text-sm font-medium text-slate-700">
          Descrição <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          defaultValue={defaultValues?.descricao}
          disabled={disabled}
          aria-invalid={Boolean(errors.descricao)}
          aria-describedby={errors.descricao ? "descricao-error" : undefined}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 aria-[invalid=true]:border-red-500"
        />
        {errors.descricao ? <p id="descricao-error" className="mt-1.5 text-sm text-red-600">{errors.descricao}</p> : null}
      </div>
    </div>
  );
}
