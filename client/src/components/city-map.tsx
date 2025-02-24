import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Suggestion } from '@shared/schema';
import 'leaflet/dist/leaflet.css';
import { icon } from 'leaflet';

// Fix for the default marker icon issue in react-leaflet
const defaultIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const cityCoordinates = {
  osaka: { lat: 34.6937, lng: 135.5023 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
};

type CityMapProps = {
  city: keyof typeof cityCoordinates;
  suggestions: Suggestion[];
};

function SetViewOnClick({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  map.setView([coords.lat, coords.lng], 13);
  return null;
}

export default function CityMap({ city, suggestions }: CityMapProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Agrupar sugerencias por día
  const suggestionsByDay = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.day]) {
      acc[suggestion.day] = [];
    }
    acc[suggestion.day].push(suggestion);
    return acc;
  }, {} as Record<number, Suggestion[]>);

  const filteredSuggestions = selectedDay
    ? suggestionsByDay[selectedDay]
    : suggestions;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.keys(suggestionsByDay).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(selectedDay === Number(day) ? null : Number(day))}
            className={`px-4 py-2 rounded ${
              selectedDay === Number(day)
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {selectedDay === Number(day) ? 'Show all' : `Day ${day}`}
          </button>
        ))}
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={[cityCoordinates[city].lat, cityCoordinates[city].lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          />
          <SetViewOnClick coords={cityCoordinates[city]} />
          {filteredSuggestions.map((suggestion) => (
            <Marker
              key={suggestion.id}
              position={{
                lat: cityCoordinates[city].lat + (Math.random() - 0.5) * 0.02,
                lng: cityCoordinates[city].lng + (Math.random() - 0.5) * 0.02
              }}
              icon={defaultIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{suggestion.placeName}</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  <p className="text-sm font-medium mt-1">
                    Day {suggestion.day} - {suggestion.period === 'morning' ? 'Morning' : 'Afternoon'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}