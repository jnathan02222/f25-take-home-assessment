"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { WeatherDisplay } from "./weather-display";

interface WeatherLookupData {
  id: string;
}

export function WeatherLookup() {

  const [formData, setFormData] = useState<WeatherLookupData>({
    id: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${formData.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setResult({
          success: true,
          message: "Weather request submitted successfully!",
          data: data,
        });
        // Avoid resetting form so we can still see the id
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: errorData.detail || "Failed to find weather report with provided ID",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Lookup Request</CardTitle>
        <CardDescription>
          Look up a weather data request with an ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              name="id"
              type="text"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
          </div>


          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Look Up"}
          </Button>

          {result && <>
            <div
              className={`p-3 rounded-md ${result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
                }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
            </div>
            {result.success && result.data && <WeatherDisplay weatherAtLocation={{
              current_units: { temperature_2m: '°C' },
              current: { temperature_2m: result.data.current.temperature },
              location: {
                name: result.data.location.name,
                lat: result.data.location.lat,
                lon: result.data.location.lon
              }
            }} />}
          </>}
        </form>
      </CardContent>
    </Card>
  );
}
