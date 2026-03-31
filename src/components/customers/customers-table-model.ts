/**
 * Shared customer table domain: sample rows, tab filters, and sort helpers.
 * Used by `CustomersPage` (full row set + search; design-system **Table** pattern) and the
 * design-system **Table with tabs** demo (`CUSTOMER_DECK_*`). `CUSTOMER_PRODUCT_TAB_*` remains for
 * product filters if tabs or segmented controls return later.
 */

export type CustomerStatus = "accepted" | "pending" | "resend";

export interface CustomerRecord {
  id: string;
  name: string;
  purchaseDate: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  email: string;
  status: CustomerStatus;
}

export type CustomerSortKey =
  | "vin"
  | "name"
  | "purchaseDate"
  | "year"
  | "make"
  | "model"
  | "email"
  | "status";

/** Matches `FileCabinetTabRow` / chrome layout (four slots); labels are customer-facing copy. */
export const CUSTOMER_DECK_TAB_LABELS: Record<string, string> = {
  drive: "Show All",
  climate: "Accepted",
  media: "Invited",
  system: "Not Accepted",
};

export const CUSTOMER_TAB_FILTER: Record<string, (row: CustomerRecord) => boolean> = {
  drive: () => true,
  climate: (r) => r.status === "accepted",
  media: (r) => r.status === "pending",
  system: (r) => r.status === "resend",
};

/** Inventory-style pages: two tabs (Show all / Accepted and pending). */
export const CUSTOMER_PRODUCT_TAB_VALUES = ["all", "accepted_pending"] as const;

export const CUSTOMER_PRODUCT_TAB_LABELS: Record<string, string> = {
  all: "Show all",
  accepted_pending: "Accepted and pending",
};

export const CUSTOMER_PRODUCT_TAB_FILTER: Record<string, (row: CustomerRecord) => boolean> = {
  all: () => true,
  accepted_pending: (r) => r.status === "accepted" || r.status === "pending",
};

export const CUSTOMER_ROWS: CustomerRecord[] = [
  {
    id: "cust-ryan-parker",
    name: "Ryan Parker",
    purchaseDate: "08/02/2024",
    year: 2020,
    make: "BMW",
    model: "X5",
    vin: "XZ12345MNBVCXZQW1",
    email: "customer1@example.com",
    status: "accepted",
  },
  {
    id: "cust-emma-thompson",
    name: "Emma Thompson",
    purchaseDate: "11/15/2023",
    year: 2021,
    make: "Audi",
    model: "Q7",
    vin: "AB45678POIUYTREW2",
    email: "customer2@example.com",
    status: "accepted",
  },
  {
    id: "cust-benjamin-foster",
    name: "Benjamin Foster",
    purchaseDate: "03/03/2024",
    year: 2021,
    make: "Mercedes-Benz",
    model: "GLE",
    vin: "EF23456QWERTYUIO4",
    email: "customer4@example.com",
    status: "accepted",
  },
  {
    id: "cust-liam-garcia-toyota",
    name: "Liam Garcia",
    purchaseDate: "12/25/2023",
    year: 2021,
    make: "Toyota",
    model: "RAV4",
    vin: "GH56789ASDFGHJKL5",
    email: "customer5@example.com",
    status: "resend",
  },
  {
    id: "cust-ava-martinez",
    name: "Ava Martinez",
    purchaseDate: "07/04/2024",
    year: 2023,
    make: "Ford",
    model: "Explorer",
    vin: "IJ89012ZXCVBNMAS6",
    email: "customer6@example.com",
    status: "accepted",
  },
  {
    id: "cust-ethan-davis",
    name: "Ethan Davis",
    purchaseDate: "02/14/2024",
    year: 2021,
    make: "Chevrolet",
    model: "Tahoe",
    vin: "KL34567PLMNBVCXZ7",
    email: "customer7@example.com",
    status: "pending",
  },
  {
    id: "cust-harper-butler-lexus",
    name: "Harper Butler",
    purchaseDate: "01/01/2024",
    year: 2024,
    make: "Lexus",
    model: "RX",
    vin: "CD78901LKJHGFDSA3",
    email: "customer3@example.com",
    status: "accepted",
  },
  {
    id: "cust-chloe-hall",
    name: "Chloe Hall",
    purchaseDate: "05/06/2024",
    year: 2024,
    make: "Nissan",
    model: "Pathfinder",
    vin: "MN67890QWERTYUI8",
    email: "customer8@example.com",
    status: "accepted",
  },
  {
    id: "cust-liam-garcia-dodge",
    name: "Liam Garcia",
    purchaseDate: "12/25/2023",
    year: 2021,
    make: "Dodge",
    model: "Durango",
    vin: "CD23456PLMNBVCXZ6",
    email: "customer16@example.com",
    status: "resend",
  },
  {
    id: "cust-james-taylor",
    name: "James Taylor",
    purchaseDate: "09/30/2023",
    year: 2021,
    make: "Honda",
    model: "CR-V",
    vin: "OP90123LKJHGFDSE9",
    email: "customer9@example.com",
    status: "accepted",
  },
  {
    id: "cust-charlotte-anderson",
    name: "Charlotte Anderson",
    purchaseDate: "04/22/2024",
    year: 2023,
    make: "Subaru",
    model: "Outback",
    vin: "QR23456ZXCVBNMAS0",
    email: "customer10@example.com",
    status: "pending",
  },
  {
    id: "cust-oliver-thomas",
    name: "Oliver Thomas",
    purchaseDate: "06/10/2024",
    year: 2019,
    make: "Kia",
    model: "Telluride",
    vin: "WX34567QWERTYUIO3",
    email: "customer13@example.com",
    status: "accepted",
  },
  {
    id: "cust-harper-butler-porsche",
    name: "Harper Butler",
    purchaseDate: "01/01/2024",
    year: 2024,
    make: "Porsche",
    model: "Cayenne",
    vin: "AB90123ZXCVBNMAS5",
    email: "customer15@example.com",
    status: "accepted",
  },
  {
    id: "cust-amelia-white",
    name: "Amelia White",
    purchaseDate: "10/08/2023",
    year: 2022,
    make: "Volkswagen",
    model: "Tiguan",
    vin: "ST56789POIUYTREW1",
    email: "customer11@example.com",
    status: "accepted",
  },
  {
    id: "cust-henry-martin",
    name: "Henry Martin",
    purchaseDate: "03/17/2024",
    year: 2021,
    make: "Hyundai",
    model: "Santa Fe",
    vin: "UV89012LKJHGFDSA2",
    email: "customer12@example.com",
    status: "pending",
  },
];

export function inviteStatusLabel(status: CustomerStatus): string {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "pending":
      return "Invited";
    case "resend":
      return "Not accepted";
  }
}

export function compareCustomerValues(
  left: CustomerRecord,
  right: CustomerRecord,
  sortKey: CustomerSortKey,
  direction: "asc" | "desc",
): number {
  const multiplier = direction === "asc" ? 1 : -1;
  const leftValue = left[sortKey];
  const rightValue = right[sortKey];

  if (sortKey === "status") {
    return (
      inviteStatusLabel(left.status).localeCompare(inviteStatusLabel(right.status)) * multiplier
    );
  }

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return (leftValue - rightValue) * multiplier;
  }

  return String(leftValue).localeCompare(String(rightValue)) * multiplier;
}
