"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Download, Filter, Search, UserPlus } from "lucide-react";

import { TopBar } from "@/components/app/top-bar";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import { CustomersFileCabinetTable } from "@/components/customers/customers-file-cabinet-table";
import {
  compareCustomerValues,
  CUSTOMER_ROWS,
  inviteStatusLabel,
  type CustomerSortKey,
} from "@/components/customers/customers-table-model";
import { Button } from "@/components/ui/button";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import { Paginator } from "@/components/ui/paginator";

interface CustomersPageProps {
  /** Shown in the page TopBar; Smart Marketing uses "Audiences". */
  pageTitle?: string;
  onRegisterCustomer?: () => void;
}

export function CustomersPage({
  pageTitle = "Customers",
  onRegisterCustomer,
}: CustomersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: CustomerSortKey;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    if (!normalizedQuery) return CUSTOMER_ROWS;

    return CUSTOMER_ROWS.filter((customer) => {
      return [
        customer.name,
        customer.purchaseDate,
        String(customer.year),
        customer.make,
        customer.model,
        customer.vin,
        customer.email,
        inviteStatusLabel(customer.status),
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  const sortedCustomers = useMemo(
    () =>
      [...filteredCustomers].sort((left, right) =>
        compareCustomerValues(left, right, sortConfig.key, sortConfig.direction),
      ),
    [filteredCustomers, sortConfig.direction, sortConfig.key],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCustomers = sortedCustomers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
      <TopBar
        title={pageTitle}
        right={
          <>
            <Button variant="secondary" size="header" leadingIcon={<Download />}>
              Export
            </Button>
            <Button
              type="button"
              size="header"
              leadingIcon={<UserPlus />}
              onClick={onRegisterCustomer}
            >
              Register Customer
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-8 pb-8 pt-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <InputContainer size="lg" className="w-full max-w-sm">
            <InputIcon position="lead">
              <Search className="size-4" />
            </InputIcon>
            <Input
              standalone={false}
              size="lg"
              aria-label="Search customers"
              placeholder="Search customers"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </InputContainer>

          <div className="flex-1" />

          <Button variant="secondary" size="md" leadingIcon={<Filter />}>
            Filters
          </Button>
        </div>

        <DesignSystemTableShellNoTabs
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          pagination={
            <Paginator
              variant="inline"
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={sortedCustomers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          }
        >
          <CustomersFileCabinetTable
            rows={pagedCustomers}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </DesignSystemTableShellNoTabs>
      </div>
    </div>
  );
}
