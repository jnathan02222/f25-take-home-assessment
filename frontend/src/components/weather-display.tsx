'use client';

interface WeatherAtLocation {
  current_units: {
    temperature_2m: string;
  };
  current: {
    temperature_2m: number;
  };
  location: {
    name: string;
    lat: string;
    lon: string;
  };
}

function n(num: number): number {
  return Math.ceil(num);
}

export function WeatherDisplay({ weatherAtLocation }: { weatherAtLocation: WeatherAtLocation }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px] bg-blue-400`}
    >
      <div className="flex flex-row justify-between items-center">
        <div>
          <div className="text-xl">{weatherAtLocation.location.name}</div>
          <div className="text-sm">{`${weatherAtLocation.location.lat}, ${weatherAtLocation.location.lon}`}</div>

        </div>
        <div className="flex flex-row gap-2 items-center">
          <div
            className={`size-10 rounded-full skeleton-div bg-yellow-300`}
          />
          <div className="text-4xl font-medium text-blue-50">
            {n(weatherAtLocation.current.temperature_2m)}
            {weatherAtLocation.current_units.temperature_2m}
          </div>
        </div>

      </div>
      
    </div>
  );
}
