/** Curated sample logos and app icons for Brand Profile (public/static assets). */
export interface BrandIdentitySample {
  id: string;
  /** Title Case label for UI */
  label: string;
  dealershipName: string;
  logoUrl: string;
  appIconUrl: string;
}

export const BRAND_IDENTITY_SAMPLES: BrandIdentitySample[] = [
  {
    id: "premier-motors",
    label: "Premier Motors",
    dealershipName: "Premier Motors",
    logoUrl: "/media/brand-samples/logo-premier-motors.svg",
    appIconUrl: "/media/brand-samples/icon-premier-motors.svg",
  },
  {
    id: "apex-auto",
    label: "Apex Auto Group",
    dealershipName: "Apex Auto Group",
    logoUrl: "/media/brand-samples/logo-apex-auto.svg",
    appIconUrl: "/media/brand-samples/icon-apex-auto.svg",
  },
  {
    id: "hometown-cars",
    label: "Hometown Cars",
    dealershipName: "Hometown Cars",
    logoUrl: "/media/brand-samples/logo-hometown-cars.svg",
    appIconUrl: "/media/brand-samples/icon-hometown-cars.svg",
  },
];
