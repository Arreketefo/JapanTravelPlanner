import CitySection from "@/components/city-section";
import CityMap from "@/components/city-map";
import { useQuery } from "@tanstack/react-query";
import type { Suggestion } from "@shared/schema";

const cityConfig = {
  osaka: { name: "Osaka", days: 2 },
  kyoto: { name: "Kyoto", days: 4 },
  tokyo: { name: "Tokyo", days: 4 },
} as const;

type CityPageProps = {
  city: keyof typeof cityConfig;
};

export default function CityPage({ city }: CityPageProps) {
  const { data: suggestions } = useQuery<Suggestion[]>({
    queryKey: [`/api/suggestions/${city}`],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{cityConfig[city].name}</h1>
      <div className="space-y-8">
        <CitySection city={city} days={cityConfig[city].days} />
        {suggestions && <CityMap city={city} suggestions={suggestions} />}
      </div>
    </div>
  );
}
