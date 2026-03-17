"use client";

import { useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Feature, Polygon } from "geojson";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GeofenceDrawStep } from "./geofence-draw-step";
import { GeofenceDetailsStep } from "./geofence-details-step";
import type { GeofenceFeature } from "@/lib/geofences/geofence-store";
import type { GeofenceProperties } from "@/lib/inventory/dealership-geofences";
import { cn } from "@/lib/utils";

interface GeofenceWizardProps {
  map: mapboxgl.Map | null;
  onCancel: () => void;
  onComplete: (feature: GeofenceFeature) => void;
  className?: string;
}

function generateGeofenceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `geofence-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function GeofenceWizard({
  map,
  onCancel,
  onComplete,
  className,
}: GeofenceWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [shape, setShape] = useState<Feature<Polygon> | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddressSelectFromStep1 = useCallback((value: string) => {
    setAddress(value);
    setSearchQuery(value);
  }, []);

  const handleContinue = useCallback(() => {
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  const handleSave = useCallback(() => {
    if (!shape || !name.trim()) return;
    setSaving(true);
    const id = generateGeofenceId();
    const properties: GeofenceProperties = {
      id,
      name: name.trim(),
      ...(address.trim() ? { address: address.trim() } : {}),
    };
    const feature: GeofenceFeature = {
      type: "Feature",
      properties,
      geometry: shape.geometry,
    };
    onComplete(feature);
    setSaving(false);
  }, [shape, name, address, onComplete]);

  return (
    <Card
      className={cn(
        "absolute left-8 top-24 z-20 w-full max-w-md border-border bg-card/95 shadow-lg backdrop-blur-sm",
        className
      )}
      data-slot="geofence-wizard"
    >
      <CardHeader>
        <CardTitle>Create Geofence</CardTitle>
        <CardDescription>
          {step === 1
            ? "Use the tools below to create a geofence."
            : "Give your new geofence a name. This is usually the lot name."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <GeofenceDrawStep
            map={map}
            shape={shape}
            onShapeChange={setShape}
            searchQuery={searchQuery}
            onAddressSelect={handleAddressSelectFromStep1}
            onCancel={onCancel}
            onContinue={handleContinue}
          />
        ) : (
          <GeofenceDetailsStep
            name={name}
            onNameChange={setName}
            address={address}
            onAddressChange={setAddress}
            onBack={handleBack}
            onCancel={onCancel}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </CardContent>
    </Card>
  );
}
