"use client";

import * as React from "react";
import {
  CarFront,
  ChevronDown,
  Minus,
  RotateCcw,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const inventoryTypes = [
  { value: "used", label: "Used vehicles", count: 254 },
  { value: "certified", label: "Certified pre-owned", count: 82 },
  { value: "new", label: "New inventory", count: 116 },
] as const;

const bodyStyles = [
  { value: "suv", label: "SUV", count: 96, icon: CarFront },
  { value: "sedan", label: "Sedan", count: 74, icon: CarFront },
  { value: "truck", label: "Truck", count: 41, icon: Truck },
  { value: "coupe", label: "Coupe", count: 19, icon: CarFront },
  { value: "wagon", label: "Wagon", count: 12, icon: CarFront },
  { value: "van", label: "Van", count: 8, icon: Truck },
] as const;

const priceRanges = [
  { value: "under-20", label: "Under $20,000", count: 28 },
  { value: "20-35", label: "$20,000 - $35,000", count: 93 },
  { value: "35-50", label: "$35,000 - $50,000", count: 79 },
  { value: "50-plus", label: "$50,000+", count: 46 },
] as const;

const featureOptions = [
  { value: "navigation", label: "Navigation", count: 171 },
  { value: "third-row", label: "3rd row seating", count: 53 },
  { value: "sunroof", label: "Sunroof / moonroof", count: 114 },
  { value: "heated-seats", label: "Heated seats", count: 198 },
  { value: "carplay", label: "Apple CarPlay", count: 207 },
  { value: "tow-package", label: "Tow package", count: 39 },
] as const;

const exteriorColors = [
  { value: "black", label: "Black", count: 88, color: "#20222A" },
  { value: "white", label: "White", count: 76, color: "#F3F5F7" },
  { value: "gray", label: "Gray", count: 63, color: "#7A828E" },
  { value: "silver", label: "Silver", count: 39, color: "#B7BDC7" },
  { value: "blue", label: "Blue", count: 24, color: "#2F6DB4" },
  { value: "red", label: "Red", count: 18, color: "#C93C3C" },
] as const;

const interiorColors = [
  { value: "black", label: "Black", count: 122, color: "#24262C" },
  { value: "gray", label: "Gray", count: 57, color: "#7B818A" },
  { value: "beige", label: "Beige", count: 34, color: "#CBB99B" },
  { value: "brown", label: "Brown", count: 16, color: "#845C3D" },
] as const;

const modelOptions = [
  { value: "rav4", label: "Toyota RAV4", count: 18 },
  { value: "highlander", label: "Toyota Highlander", count: 15 },
  { value: "f150", label: "Ford F-150", count: 13 },
  { value: "x5", label: "BMW X5", count: 11 },
  { value: "crv", label: "Honda CR-V", count: 10 },
  { value: "tahoe", label: "Chevrolet Tahoe", count: 9 },
] as const;

const drivetrainOptions = [
  { value: "awd", label: "AWD", count: 119 },
  { value: "fwd", label: "FWD", count: 87 },
  { value: "rwd", label: "RWD", count: 46 },
  { value: "4wd", label: "4WD", count: 31 },
] as const;

const fuelTypeOptions = [
  { value: "gas", label: "Gas", count: 223 },
  { value: "hybrid", label: "Hybrid", count: 41 },
  { value: "electric", label: "Electric", count: 26 },
  { value: "diesel", label: "Diesel", count: 12 },
] as const;

const yearOptions = [
  { value: "2024", label: "2024", count: 22 },
  { value: "2023", label: "2023", count: 51 },
  { value: "2022", label: "2022", count: 74 },
  { value: "2021", label: "2021", count: 68 },
  { value: "2020", label: "2020", count: 43 },
] as const;

const mileageOptions = [
  { value: "10k", label: "Under 10,000 mi", count: 28 },
  { value: "30k", label: "10,000 - 30,000 mi", count: 102 },
  { value: "60k", label: "30,000 - 60,000 mi", count: 93 },
  { value: "60k-plus", label: "60,000+ mi", count: 35 },
] as const;

const filterRowOuterClass = "block py-1";
const filterRowHoverLayerClass =
  "pointer-events-none absolute inset-y-0 -inset-x-[6px] rounded-sm bg-muted/60 opacity-0 transition-opacity group-hover:opacity-100";
const filterRowInnerClass =
  "relative grid grid-cols-[16px_1fr_auto] items-center gap-x-3 px-0 py-2";

type SectionKey =
  | "inventory"
  | "price"
  | "body"
  | "features"
  | "exterior"
  | "interior"
  | "models"
  | "drivetrain"
  | "fuel"
  | "year"
  | "mileage";

interface FiltersPanelProps extends React.ComponentProps<"section"> {
  variant?: "standalone" | "embedded";
  onReset?: () => void;
}

function FiltersPanel({
  className,
  variant = "standalone",
  onReset,
  ...props
}: FiltersPanelProps) {
  const [inventoryType, setInventoryType] = React.useState("used");
  const [priceRange, setPriceRange] = React.useState("");
  const [selectedBodyStyles, setSelectedBodyStyles] = React.useState<string[]>(["suv"]);
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([
    "navigation",
    "heated-seats",
  ]);
  const [selectedExteriorColors, setSelectedExteriorColors] = React.useState<string[]>([]);
  const [selectedInteriorColors, setSelectedInteriorColors] = React.useState<string[]>([]);
  const [selectedModels, setSelectedModels] = React.useState<string[]>([]);
  const [selectedDrivetrains, setSelectedDrivetrains] = React.useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = React.useState<string[]>([]);
  const [selectedYears, setSelectedYears] = React.useState<string[]>([]);
  const [selectedMileage, setSelectedMileage] = React.useState<string[]>([]);
  const [openSections, setOpenSections] = React.useState<Record<SectionKey, boolean>>({
    inventory: true,
    price: true,
    body: true,
    features: true,
    exterior: true,
    interior: false,
    models: false,
    drivetrain: false,
    fuel: false,
    year: false,
    mileage: false,
  });

  function toggleSection(section: SectionKey) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function toggleMultiValue(
    value: string,
    currentValues: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setValues(
      currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]
    );
  }

  function resetAll() {
    setInventoryType("used");
    setPriceRange("");
    setSelectedBodyStyles([]);
    setSelectedFeatures([]);
    setSelectedExteriorColors([]);
    setSelectedInteriorColors([]);
    setSelectedModels([]);
    setSelectedDrivetrains([]);
    setSelectedFuelTypes([]);
    setSelectedYears([]);
    setSelectedMileage([]);
    onReset?.();
  }

  const isStandalone = variant === "standalone";

  return (
    <section
      data-slot="filters-panel"
      className={cn(
        isStandalone
          ? "w-full max-w-[320px] overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm"
          : "w-full text-card-foreground",
        className
      )}
      {...props}
    >
      {isStandalone ? (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium tracking-[0.02em] text-foreground">
              Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-0 text-xs text-muted-foreground"
              onClick={resetAll}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      <div className={cn("overflow-y-auto", isStandalone && "max-h-[980px]")}>
        <FilterSection
          title="Inventory type"
          open={openSections.inventory}
          onToggle={() => toggleSection("inventory")}
        >
          <RadioGroup value={inventoryType} onValueChange={setInventoryType} className="gap-1">
            {inventoryTypes.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <RadioGroupItem
                    id={`inventory-${option.value}`}
                    value={option.value}
                  />
                }
              />
            ))}
          </RadioGroup>
        </FilterSection>

        <FilterSection
          title="Body style"
          open={openSections.body}
          onToggle={() => toggleSection("body")}
        >
          <div className="grid grid-cols-2 gap-2">
            {bodyStyles.map((style) => {
              const selected = selectedBodyStyles.includes(style.value);
              const Icon = style.icon;

              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() =>
                    toggleMultiValue(
                      style.value,
                      selectedBodyStyles,
                      setSelectedBodyStyles
                    )
                  }
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-sm border px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:bg-muted/60"
                  )}
                >
                  <div className="flex h-12 w-full items-center justify-center rounded-xs bg-muted/60">
                    <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{style.label}</p>
                    <p className="text-xs text-muted-foreground">{style.count} vehicles</p>
                  </div>
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection
          title="Price"
          open={openSections.price}
          onToggle={() => toggleSection("price")}
        >
          <RadioGroup value={priceRange} onValueChange={setPriceRange} className="gap-1">
            {priceRanges.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <RadioGroupItem
                    id={`price-${option.value}`}
                    value={option.value}
                  />
                }
              />
            ))}
          </RadioGroup>
        </FilterSection>

        <FilterSection
          title="Key features"
          open={openSections.features}
          onToggle={() => toggleSection("features")}
        >
          <div className="space-y-1">
            {featureOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedFeatures.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(
                        option.value,
                        selectedFeatures,
                        setSelectedFeatures
                      )
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Exterior color"
          open={openSections.exterior}
          onToggle={() => toggleSection("exterior")}
        >
          <div className="space-y-1">
            {exteriorColors.map((option) => (
              <ColorOptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                color={option.color}
                checked={selectedExteriorColors.includes(option.value)}
                onChange={() =>
                  toggleMultiValue(
                    option.value,
                    selectedExteriorColors,
                    setSelectedExteriorColors
                  )
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Interior color"
          open={openSections.interior}
          onToggle={() => toggleSection("interior")}
        >
          <div className="space-y-1">
            {interiorColors.map((option) => (
              <ColorOptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                color={option.color}
                checked={selectedInteriorColors.includes(option.value)}
                onChange={() =>
                  toggleMultiValue(
                    option.value,
                    selectedInteriorColors,
                    setSelectedInteriorColors
                  )
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Model"
          open={openSections.models}
          onToggle={() => toggleSection("models")}
        >
          <div className="space-y-1">
            {modelOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedModels.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(option.value, selectedModels, setSelectedModels)
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Drivetrain"
          open={openSections.drivetrain}
          onToggle={() => toggleSection("drivetrain")}
        >
          <div className="space-y-1">
            {drivetrainOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedDrivetrains.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(
                        option.value,
                        selectedDrivetrains,
                        setSelectedDrivetrains
                      )
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Fuel type"
          open={openSections.fuel}
          onToggle={() => toggleSection("fuel")}
        >
          <div className="space-y-1">
            {fuelTypeOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedFuelTypes.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(
                        option.value,
                        selectedFuelTypes,
                        setSelectedFuelTypes
                      )
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Year"
          open={openSections.year}
          onToggle={() => toggleSection("year")}
        >
          <div className="space-y-1">
            {yearOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedYears.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(option.value, selectedYears, setSelectedYears)
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Mileage"
          open={openSections.mileage}
          onToggle={() => toggleSection("mileage")}
        >
          <div className="space-y-1">
            {mileageOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                count={option.count}
                control={
                  <Checkbox
                    checked={selectedMileage.includes(option.value)}
                    onCheckedChange={() =>
                      toggleMultiValue(option.value, selectedMileage, setSelectedMileage)
                    }
                  />
                }
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </section>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border last:border-b-0">
      <div className="px-[6px] py-1">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 rounded-sm px-4 py-2 text-left transition-colors hover:bg-muted/60"
        >
          <span className="text-sm font-medium text-foreground">{title}</span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </div>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}

function OptionRow({
  label,
  count,
  control,
}: {
  label: string;
  count: number;
  control: React.ReactNode;
}) {
  return (
    <label className={cn(filterRowOuterClass, "group block cursor-pointer")}>
      <span className={cn(filterRowInnerClass, "w-full")}>
        <span aria-hidden className={filterRowHoverLayerClass} />
        <span className="z-[1] flex items-center justify-center">{control}</span>
        <span className="z-[1] min-w-0 text-sm text-foreground">{label}</span>
        <span className="z-[1] text-xs tabular-nums text-muted-foreground">{count}</span>
      </span>
    </label>
  );
}

function ColorOptionRow({
  label,
  count,
  color,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  color: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={filterRowOuterClass}>
      <button
        type="button"
        onClick={onChange}
        className={cn(filterRowInnerClass, "group w-full text-left")}
      >
        <span
          aria-hidden
          className={cn(filterRowHoverLayerClass, checked && "opacity-100 bg-muted/40")}
        />
        <span
          className="z-[1] flex size-4 shrink-0 items-center justify-center rounded-full border border-border"
          style={{ backgroundColor: color }}
        >
          {checked ? (
            <Minus
              className={cn(
                "size-3",
                color === "#F3F5F7" || color === "#B7BDC7" || color === "#CBB99B"
                  ? "text-foreground"
                  : "text-white"
              )}
            />
          ) : null}
        </span>
        <span className="z-[1] min-w-0 flex-1 text-sm text-foreground">{label}</span>
        <span className="z-[1] text-xs tabular-nums text-muted-foreground">{count}</span>
      </button>
    </div>
  );
}

export { FiltersPanel };
