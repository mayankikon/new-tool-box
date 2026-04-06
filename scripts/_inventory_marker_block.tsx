/** Selected marker scale; peers stay subdued when another vehicle is selected. */
const INVENTORY_MAP_SELECTED_MARKER_SCALE_CLASS = "scale-[1.05]";

type InventoryVehicleMapMarkerMountOptions = {
  entryStaggerMs: number;
  playEntryAnimation: boolean;
};

function inventoryMapHtmlMarkersPreferReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function InventoryVehicleMapMarkerBody({
  props,
  markerMode,
  isSelected,
  dimPeerMarkers,
  entryStaggerMs = 0,
  playEntryAnimation = false,
}: {
  props: InventoryVehicleMapFeatureProperties;
  markerMode: "chip" | "pin";
  isSelected: boolean;
  dimPeerMarkers: boolean;
  entryStaggerMs?: number;
  playEntryAnimation?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const pinTone =
    props.ageTier === "fresh" ? "teal" : props.ageTier === "aging" ? "gold" : "red";

  const motionClass = prefersReducedMotion
    ? ""
    : "transition-[transform,opacity,filter,box-shadow] duration-200 ease-out";

  const statusHex = INVENTORY_LOT_AGE_TIER_HEX[props.ageTier];

  return (
    <div
      className={cn(
        "group/mv pointer-events-none relative inline-flex flex-col items-center justify-center",
        motionClass,
        dimPeerMarkers && "opacity-[0.7] saturate-[0.7]",
        isSelected && INVENTORY_MAP_SELECTED_MARKER_SCALE_CLASS
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -bottom-0.5 left-1/2 h-[18px] w-[52px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.55)_0%,transparent_72%)] transition-[opacity,filter,width] duration-150 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          "opacity-[0.12] blur-[24px]",
          "group-hover/mv:opacity-[0.18] group-hover/mv:blur-[28px]",
          isSelected && "opacity-[0.2] group-hover/mv:opacity-[0.24]"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 inline-flex flex-col items-center justify-center",
          !prefersReducedMotion &&
            playEntryAnimation &&
            "animate-inventory-marker-drop-in"
        )}
        style={{
          animationDelay:
            playEntryAnimation && !prefersReducedMotion
              ? `${entryStaggerMs}ms`
              : undefined,
        }}
      >
        <div
          className={cn(
            "inline-flex flex-col items-center justify-center",
            isSelected && !prefersReducedMotion && "inventory-marker-glow-pulse"
          )}
          style={
            {
              "--inventory-marker-glow": statusHex,
              ...(isSelected && prefersReducedMotion
                ? { boxShadow: `0 0 16px 4px ${applyAlpha(statusHex, 0.25)}` }
                : {}),
            } as CSSProperties
          }
        >
          {markerMode === "chip" ? (
            <VehicleMapMarkerChip
              variantIndex={inventoryMapChipVariantIndexForAgeTier(props.ageTier)}
              imageSrc={props.imageSrc}
              imageAlt={props.imageAlt}
              title={props.title}
              hoverOverlayColor={INVENTORY_LOT_AGE_TIER_HEX[props.ageTier]}
            />
          ) : (
            <VehicleMapMarkerPin
              tone={pinTone}
              title={props.title}
              hoverable
            />
          )}
        </div>
      </div>
    </div>
  );
}

function mountInventoryVehicleMapMarker(
  props: InventoryVehicleMapFeatureProperties,
  markerMode: "chip" | "pin",
  onVehicleSelect?: InventoryVehicleSelectHandler,
  mountOptions?: InventoryVehicleMapMarkerMountOptions
): { wrap: HTMLDivElement; root: Root } {
  const wrap = document.createElement("div");
  wrap.style.cursor = "pointer";
  wrap.className = "pointer-events-auto inline-flex items-center justify-center";
  const root = createRoot(wrap);
  const selectionFlags = inventoryVehicleMarkerSelectionFlags(props.vin);
  root.render(
    <InventoryVehicleMapMarkerBody
      props={props}
      markerMode={markerMode}
      isSelected={selectionFlags.isSelected}
      dimPeerMarkers={selectionFlags.dimPeerMarkers}
      entryStaggerMs={mountOptions?.entryStaggerMs ?? 0}
      playEntryAnimation={mountOptions?.playEntryAnimation ?? false}
    />
  );
  if (onVehicleSelect) {
    wrap.addEventListener("click", () => {
      onVehicleSelect(props.vin);
    });
  }
  return { wrap, root };
}

function renderInventoryVehicleMapMarker(
  root: Root,
  props: InventoryVehicleMapFeatureProperties,
  markerMode: "chip" | "pin"
) {
  const selectionFlags = inventoryVehicleMarkerSelectionFlags(props.vin);
  root.render(
    <InventoryVehicleMapMarkerBody
      props={props}
      markerMode={markerMode}
      isSelected={selectionFlags.isSelected}
      dimPeerMarkers={selectionFlags.dimPeerMarkers}
      playEntryAnimation={false}
    />
  );
}

