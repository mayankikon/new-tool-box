"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
}

interface GeocodingResponse {
  features: GeocodingFeature[];
}

interface GeofenceDetailsStepProps {
  /** Current geofence name. */
  name: string;
  /** Called when name changes. */
  onNameChange: (value: string) => void;
  /** Current geofence address (e.g. pre-filled from step 1 search). */
  address: string;
  /** Called when address changes (user typing or selecting suggestion). */
  onAddressChange: (value: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  /** Whether save is in progress (disable buttons). */
  saving?: boolean;
  className?: string;
}

export function GeofenceDetailsStep({
  name,
  onNameChange,
  address,
  onAddressChange,
  onBack,
  onCancel,
  onSave,
  saving = false,
  className,
}: GeofenceDetailsStepProps) {
  const [addressInputValue, setAddressInputValue] = useState(address);
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAddressInputValue(address);
  }, [address]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `${GEOCODE_URL}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place,poi&limit=5`;
      const res = await fetch(url);
      const data = (await res.json()) as GeocodingResponse;
      setSuggestions(data.features ?? []);
      setSuggestionsOpen(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInputValue(value);
    onAddressChange(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  const handleSelectSuggestion = (feature: GeocodingFeature) => {
    setAddressInputValue(feature.place_name);
    onAddressChange(feature.place_name);
    setSuggestionsOpen(false);
    setSuggestions([]);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSave = name.trim().length > 0 && !saving;

  return (
    <div className={cn("flex flex-col gap-4", className)} ref={containerRef}>
      <div className="flex w-full flex-col gap-2">
        <label
          htmlFor="geofence-name"
          className="text-sm font-medium leading-5 text-foreground"
        >
          Geofence Name
        </label>
        <Input
          id="geofence-name"
          placeholder="e.g. Main Lot"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          aria-required
          className="h-8"
        />
      </div>

      <div className="relative flex w-full flex-col gap-2">
        <label
          htmlFor="geofence-address"
          className="text-sm font-medium leading-5 text-foreground"
        >
          Geofence Address (optional)
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="geofence-address"
            placeholder="Search or enter address"
            value={addressInputValue}
            onChange={handleAddressInputChange}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="geofence-address-suggestions"
            className="h-8 pl-8"
          />
        </div>
        {suggestionsOpen && suggestions.length > 0 && (
          <div
            id="geofence-address-suggestions"
            className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
            role="listbox"
          >
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(feature);
                }}
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={saving}
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!canSave}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
