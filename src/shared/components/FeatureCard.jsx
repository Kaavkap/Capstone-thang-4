function FeatureCard({ title, description, badge }) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
      <p className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
        {badge}
      </p>
      <h3 className="font-heading text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

export default FeatureCard;

