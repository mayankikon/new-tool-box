"use client";

import type { CSSProperties } from "react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Download,
  Ellipsis,
  Filter,
  RotateCcw,
  Search,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { TopBar } from "@/components/app/top-bar";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import { Paginator } from "@/components/ui/paginator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeaderCell } from "@/components/ui/table-header-cell";
import { TableSlotCell } from "@/components/ui/table-slot-cell";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import { cn } from "@/lib/utils";

const {
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT = "var(--theme-stroke-subtle)";

const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle)]";

const STAFF_HEADER_TH_STYLE: CSSProperties = {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderStyle: "solid",
  borderColor: "transparent",
  borderBottomWidth: 1,
  borderBottomColor: ROW_STROKE_LIGHT,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  height: headerCellHeightPx,
  minHeight: headerCellHeightPx,
  maxHeight: headerCellHeightPx,
  boxSizing: "border-box",
  verticalAlign: "middle",
};

type StaffInviteStatus = "accepted" | "pending" | "revoked";

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  jobTitle: string;
  permissionLevel: string;
  inviteStatus: StaffInviteStatus;
}

type SortKey =
  | "name"
  | "email"
  | "phoneNumber"
  | "department"
  | "jobTitle"
  | "permissionLevel";

const STAFF_ROWS: StaffRecord[] = [
  {
    id: "staff-1",
    name: "Jim Anani",
    email: "jim.anani@dealer.com",
    phoneNumber: "(725) 827 - 2858",
    department: "Admin & Operations",
    jobTitle: "General Manager",
    permissionLevel: "Admin",
    inviteStatus: "accepted",
  },
  {
    id: "staff-2",
    name: "Adnan Aziz",
    email: "adnan.aziz@dealer.com",
    phoneNumber: "(314) 289 - 1199",
    department: "Admin & Operations",
    jobTitle: "Owner",
    permissionLevel: "Member",
    inviteStatus: "accepted",
  },
  {
    id: "staff-3",
    name: "Nathan Bernard",
    email: "nathan.bernard@dealer.com",
    phoneNumber: "(817) 727 - 1121",
    department: "Admin & Operations",
    jobTitle: "Office Manager",
    permissionLevel: "Admin",
    inviteStatus: "pending",
  },
  {
    id: "staff-4",
    name: "Andrew Brown",
    email: "andrew.brown@dealer.com",
    phoneNumber: "(614) 899 - 0092",
    department: "Account & Backoffice",
    jobTitle: "Accountant",
    permissionLevel: "Admin",
    inviteStatus: "revoked",
  },
  {
    id: "staff-5",
    name: "Emmanuel Cummings",
    email: "emmanuel.cummings@dealer.com",
    phoneNumber: "(725) 827 - 2858",
    department: "Account & Backoffice",
    jobTitle: "Accountant",
    permissionLevel: "Member",
    inviteStatus: "accepted",
  },
  {
    id: "staff-6",
    name: "Michael Gray",
    email: "michael.gray@dealer.com",
    phoneNumber: "(817) 854 - 4968",
    department: "Account & Backoffice",
    jobTitle: "Controller",
    permissionLevel: "Member",
    inviteStatus: "pending",
  },
  {
    id: "staff-7",
    name: "Jim Johansen",
    email: "jim.johansen@dealer.com",
    phoneNumber: "(817) 727 - 1121",
    department: "F&I",
    jobTitle: "F&I Director",
    permissionLevel: "Admin",
    inviteStatus: "accepted",
  },
  {
    id: "staff-8",
    name: "Michael King",
    email: "michael.king@dealer.com",
    phoneNumber: "(314) 289 - 1199",
    department: "F&I",
    jobTitle: "F&I Manager",
    permissionLevel: "Member",
    inviteStatus: "pending",
  },
  {
    id: "staff-9",
    name: "Tayana Lawrence",
    email: "tayana.lawrence@dealer.com",
    phoneNumber: "(725) 827 - 2858",
    department: "F&I",
    jobTitle: "F&I Assistant",
    permissionLevel: "Admin",
    inviteStatus: "revoked",
  },
  {
    id: "staff-10",
    name: "Mario Limas",
    email: "mario.limas@dealer.com",
    phoneNumber: "(817) 727 - 1121",
    department: "F&I",
    jobTitle: "F&I Assistant",
    permissionLevel: "Member",
    inviteStatus: "accepted",
  },
  {
    id: "staff-11",
    name: "Greggory Markham",
    email: "greggory.markham@dealer.com",
    phoneNumber: "(314) 289 - 1199",
    department: "Sales",
    jobTitle: "General Sales Manager",
    permissionLevel: "Member",
    inviteStatus: "pending",
  },
  {
    id: "staff-12",
    name: "Adam Martin",
    email: "adam.martin@dealer.com",
    phoneNumber: "(614) 899 - 0092",
    department: "Sales",
    jobTitle: "Sales Manager",
    permissionLevel: "Member",
    inviteStatus: "accepted",
  },
  {
    id: "staff-13",
    name: "Emily Martinez",
    email: "emily.martinez@dealer.com",
    phoneNumber: "(725) 827 - 2858",
    department: "Sales",
    jobTitle: "Salesperson",
    permissionLevel: "Admin",
    inviteStatus: "pending",
  },
  {
    id: "staff-14",
    name: "Antoinette Peters",
    email: "antoinette.peters@dealer.com",
    phoneNumber: "(817) 727 - 1121",
    department: "Sales",
    jobTitle: "Salesperson",
    permissionLevel: "Admin",
    inviteStatus: "accepted",
  },
];

const STAFF_HEADERS: { key: SortKey; label: string; widthClassName: string }[] = [
  { key: "name", label: "Name", widthClassName: "w-[220px]" },
  { key: "email", label: "Email", widthClassName: "w-[230px]" },
  { key: "phoneNumber", label: "Phone Number", widthClassName: "w-[220px]" },
  { key: "department", label: "Department", widthClassName: "w-[220px]" },
  { key: "jobTitle", label: "Job Title", widthClassName: "w-[220px]" },
  { key: "permissionLevel", label: "Permission Level", widthClassName: "w-[170px]" },
];

function compareStaffValues(
  left: StaffRecord,
  right: StaffRecord,
  sortKey: SortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return left[sortKey].localeCompare(right[sortKey]) * multiplier;
}

export function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredStaff = useMemo(() => {
    const searchFiltered = STAFF_ROWS.filter((record) => {
      if (!normalizedQuery) return true;

      return [
        record.name,
        record.email,
        record.phoneNumber,
        record.department,
        record.jobTitle,
        record.permissionLevel,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
    return [...searchFiltered].sort((left, right) =>
      compareStaffValues(left, right, sortConfig.key, sortConfig.direction),
    );
  }, [normalizedQuery, sortConfig.direction, sortConfig.key]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedStaff = filteredStaff.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden pt-6">
      <TopBar
        title="Staff"
        right={
          <>
            <Button variant="secondary" size="header" leadingIcon={<Download />}>
              Export
            </Button>
            <Button size="header" leadingIcon={<UserPlus />}>
              Register Staff
            </Button>
          </>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 pb-8 pt-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <InputContainer
            size="lg"
            className="w-full max-w-sm"
          >
            <InputIcon position="lead">
              <Search className="size-4" />
            </InputIcon>
            <Input
              standalone={false}
              size="lg"
              aria-label="Search staff"
              placeholder="Search staff"
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
              totalItems={filteredStaff.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          }
        >
          <Table className="border-separate border-spacing-0 bg-transparent text-sm">
            <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
              <TableRow size="compact" className="!border-0 hover:bg-transparent">
                {STAFF_HEADERS.map((header) => (
                  <TableHead
                    key={header.key}
                    className={cn(header.widthClassName, "p-0 align-middle")}
                    style={STAFF_HEADER_TH_STYLE}
                  >
                    <TableHeaderCell
                      variant="label"
                      label={header.label}
                      sortable
                      sortState={
                        sortConfig.key === header.key
                          ? sortConfig.direction === "asc"
                            ? "asc"
                            : "desc"
                          : "inactive"
                      }
                      className={cn(
                        "[&_span.truncate]:text-sm [&_span.truncate]:leading-5",
                        "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                      )}
                      style={{
                        height: headerCellHeightPx,
                        minHeight: headerCellHeightPx,
                        maxHeight: headerCellHeightPx,
                        boxSizing: "border-box",
                      }}
                      onSort={() => {
                        setSortConfig((current) => ({
                          key: header.key,
                          direction:
                            current.key === header.key && current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setCurrentPage(1);
                      }}
                    />
                  </TableHead>
                ))}
                <TableHead
                  className="w-[64px] p-0 align-middle"
                  style={STAFF_HEADER_TH_STYLE}
                >
                  <TableHeaderCell
                    variant="empty"
                    className="h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none"
                    style={{
                      height: headerCellHeightPx,
                      minHeight: headerCellHeightPx,
                      maxHeight: headerCellHeightPx,
                      boxSizing: "border-box",
                    }}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStaff.map((record, rowIndex) => {
                const innerStyle: CSSProperties = {
                  height: bodyCellHeightPx,
                  minHeight: bodyCellHeightPx,
                  maxHeight: bodyCellHeightPx,
                  paddingLeft: cellPaddingXPx,
                  paddingRight: cellPaddingXPx,
                  boxSizing: "border-box",
                };
                const slotLabelOverrideClass =
                  "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";
                const slotClass = cn("text-foreground", slotLabelOverrideClass);
                const isLastRow = rowIndex === pagedStaff.length - 1;
                const cellFrame = cn(
                  "p-0 align-middle",
                  !isLastRow && BODY_CELL_DIVIDER,
                );

                return (
                  <TableRow
                    key={record.id}
                    size="default"
                    className="!border-0 !bg-transparent hover:!bg-transparent"
                    style={{ minHeight: bodyCellHeightPx }}
                  >
                    <TableCell className={cellFrame}>
                      <div className="flex items-center" style={innerStyle}>
                        <span className="truncate font-medium leading-5 text-foreground">
                          {record.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={record.email}
                        className={slotClass}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={record.phoneNumber}
                        className={slotClass}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={record.department}
                        className={slotClass}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={record.jobTitle}
                        className={slotClass}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <TableSlotCell
                        label={record.permissionLevel}
                        className={slotClass}
                        style={innerStyle}
                      />
                    </TableCell>

                    <TableCell className={cellFrame}>
                      <div
                        className="flex items-center justify-center"
                        style={innerStyle}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                            aria-label={`More actions for ${record.name}`}
                          >
                            <Ellipsis className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom">
                            <DropdownMenuItem>
                              <ShieldCheck />
                              Edit permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RotateCcw />
                              Reset invite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserPlus />
                              View staff profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DesignSystemTableShellNoTabs>
      </div>
    </div>
  );
}
