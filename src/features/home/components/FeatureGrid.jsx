import FeatureCard from "../../../shared/components/FeatureCard";
import { homeFeatures } from "../data/homeFeatures";

function FeatureGrid() {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-2">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Tính năng trang chủ</h2>
        <p className="text-sm text-slate-500">Dữ liệu và thành phần được tách theo thư mục</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {homeFeatures.map((feature) => (
          <FeatureCard
            key={feature.id}
            badge={feature.badge}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

export default FeatureGrid;
