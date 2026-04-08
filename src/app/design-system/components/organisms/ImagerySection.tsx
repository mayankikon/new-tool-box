"use client";

import Image from "next/image";
import * as React from "react";

import {
  listVehicleImageryRows,
  type VehicleImageryColorVariant,
  type VehicleImageryRow,
} from "@/lib/campaigns/vehicle-imagery-catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";

function VehicleAnglePreview({
  label,
  src,
  alt,
  emptyHint,
}: {
  label: string;
  src: string;
  alt: string;
  emptyHint: string;
}) {
  if (!src.trim()) {
    return (
      <div
        className="flex h-[88px] w-[min(100%,11rem)] items-center justify-center rounded-[var(--radius-xs,4px)] border border-dashed border-border bg-muted/30 px-2 text-center text-xs text-muted-foreground"
        title={emptyHint}
      >
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div
        className={cn(
          "relative h-[88px] w-[min(100%,11rem)] overflow-hidden rounded-[var(--radius-xs,4px)] border border-border bg-neutral-50 dark:bg-muted/20",
        )}
      >
        <Image key={src} src={src} alt={alt} fill className="object-contain p-1" sizes="176px" />
      </div>
    </div>
  );
}

function VehicleImageryTableRow({ row }: { row: VehicleImageryRow }) {
  const variants = row.colorVariants;
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const safeIndex = Math.min(selectedIndex, Math.max(0, variants.length - 1));
  const selected: VehicleImageryColorVariant | undefined = variants[safeIndex];
  const baseName = `${row.make} ${row.model}`.trim();

  if (!selected) {
    return null;
  }

  const colorControl =
    variants.length > 1 ? (
      <Select
        value={String(safeIndex)}
        items={variants.map((v, index) => ({
          value: String(index),
          label: v.label,
        }))}
        onValueChange={(v) => {
          if (v == null) {
            return;
          }
          setSelectedIndex(Number.parseInt(v, 10));
        }}
      >
        <SelectTrigger size="sm" className="w-[min(100%,14rem)] max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {variants.map((v, index) => (
            <SelectItem key={`${v.sideImageUrl}-${index}`} value={String(index)}>
              <span className="block truncate">{v.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <span className="text-sm text-muted-foreground">{selected.label}</span>
    );

  return (
    <TableRow>
      <TableCell className="whitespace-normal font-medium">{row.make}</TableCell>
      <TableCell className="whitespace-normal">{row.model}</TableCell>
      <TableCell className="max-w-[10rem] whitespace-normal text-muted-foreground">{selected.trim}</TableCell>
      <TableCell className="whitespace-normal">{colorControl}</TableCell>
      <TableCell className="whitespace-normal">
        <VehicleAnglePreview
          label="Side"
          src={selected.sideImageUrl}
          alt={`${baseName} — ${selected.label} — side`}
          emptyHint="No side image URL for this color."
        />
      </TableCell>
      <TableCell className="whitespace-normal">
        {selected.slantedImageUrl ? (
          <VehicleAnglePreview
            label="3/4"
            src={selected.slantedImageUrl}
            alt={`${baseName} — ${selected.label} — three-quarter`}
            emptyHint=""
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">3/4</span>
            <div
              className="flex h-[88px] w-[min(100%,11rem)] items-center justify-center rounded-[var(--radius-xs,4px)] border border-dashed border-border bg-muted/20 px-2 text-center text-xs text-muted-foreground"
              title="No signed Evox 032 URL for this paint in the repo (add `slantedImageUrl` on the variant or inventory front-image data)."
            >
              —
            </div>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ImagerySection() {
  const rows = listVehicleImageryRows();

  return (
    <section id="imagery" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Imagery"
        description="Evox side (001) and 3/4 (032) renders. Chevrolet models reuse mock inventory colors (multiple paints per model where available) with VIN-matched 3/4 URLs. Other makes use the campaign catalog; 3/4 appears when a signed 032 URL is available for that asset id."
      />
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <Table containerClassName="rounded-[var(--radius-xs,4px)]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[7rem]">Make</TableHead>
              <TableHead className="min-w-[8rem]">Model</TableHead>
              <TableHead className="min-w-[7rem] whitespace-normal">Trim</TableHead>
              <TableHead className="min-w-[10rem] whitespace-normal">Color</TableHead>
              <TableHead className="min-w-[12rem] whitespace-normal">Side view</TableHead>
              <TableHead className="min-w-[12rem] whitespace-normal">Slanted (3/4)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <VehicleImageryTableRow key={`${row.make}-${row.model}`} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
