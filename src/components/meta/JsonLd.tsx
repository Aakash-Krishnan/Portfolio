import type { PortfolioData } from "@/types/portfolio";
import { buildPortfolioGraph } from "@/lib/json-ld";

export default function JsonLd({ data }: { data: PortfolioData }) {
  const graph = buildPortfolioGraph(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
