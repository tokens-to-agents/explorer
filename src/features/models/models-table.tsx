"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  type RowData,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceLink } from "@/components/wiki-link";
import { benchmarks } from "@/config/benchmarks";
import { OPENNESS, opennessLabels, palette } from "@/config/taxonomy";
import type { Model } from "@/lib/data/schema";
import { cn, formatBillions, formatPartialDate, formatTokens, formatUsd, partialDateKey } from "@/lib/utils";

export type ScoreCell = { score: number; variant?: string; source: string; checked?: string };
export type ModelRow = Model & { labName: string; scores: Partial<Record<string, ScoreCell>> };

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Explanation shown when the reader points at the column header. */
    hint?: React.ReactNode;
  }
}

const opennessColors: Record<Model["openness"], string> = {
  closed: palette.salmon,
  "open-weights": palette.mint,
  "open-source": palette.green,
};

const column = createColumnHelper<ModelRow>();

const columns = [
  column.accessor("name", {
    header: "Model",
    cell: (info) => (
      <div className="space-y-0.5">
        <div className="font-medium">{info.getValue()}</div>
        <div className="text-xs text-muted-foreground">{info.row.original.labName}</div>
      </div>
    ),
  }),
  column.accessor("openness", {
    header: "Weights",
    cell: (info) => (
      <span className="inline-flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className="size-2 rounded-full"
          style={{ backgroundColor: opennessColors[info.getValue()] }}
        />
        {opennessLabels[info.getValue()]}
      </span>
    ),
  }),
  column.accessor("released", {
    header: "Released",
    sortingFn: (a, b) => partialDateKey(a.original.released!).localeCompare(partialDateKey(b.original.released!)),
    cell: (info) => <span className="tabular-nums">{info.getValue() ? formatPartialDate(info.getValue()!) : "—"}</span>,
  }),
  ...benchmarks.map((benchmark) =>
    column.accessor((row) => row.scores[benchmark.id]?.score, {
      id: benchmark.id,
      header: benchmark.label,
      meta: { hint: benchmark.description },
      cell: (info) => {
        const cell = info.row.original.scores[benchmark.id];
        if (!cell) return <span className="text-faint-foreground">—</span>;
        const value = benchmark.format === "percent" ? `${cell.score}%` : cell.score.toLocaleString("en");
        return (
          <a
            href={cell.source}
            target="_blank"
            rel="noreferrer"
            title={cell.checked ? `Checked ${formatPartialDate(cell.checked)}` : "Not verified yet"}
            className={cn("tabular-nums hover:underline", !cell.checked && "text-muted-foreground")}
          >
            {value}
            {!cell.checked && <span aria-label="not verified yet">*</span>}
            {cell.variant && <span className="ml-1.5 text-xs text-faint-foreground">{cell.variant}</span>}
          </a>
        );
      },
    }),
  ),
  column.accessor("params_total_b", {
    header: "Parameters",
    cell: (info) => {
      const { params_total_b: total, params_active_b: active } = info.row.original;
      return (
        <span className="tabular-nums">
          {formatBillions(total)}
          {total !== undefined && active !== undefined && active !== total && (
            <span className="text-muted-foreground"> · {formatBillions(active)} active</span>
          )}
        </span>
      );
    },
  }),
  column.accessor("context_tokens", {
    header: "Context",
    cell: (info) => <span className="tabular-nums">{formatTokens(info.getValue())}</span>,
  }),
  column.accessor("price_in_usd_per_mtok", {
    header: "$ / M tokens in · out",
    cell: (info) => {
      const { price_in_usd_per_mtok: input, price_out_usd_per_mtok: output } = info.row.original;
      return (
        <span className="tabular-nums">{input === undefined ? "—" : `${formatUsd(input)} · ${formatUsd(output)}`}</span>
      );
    },
  }),
  column.accessor("source", {
    header: "Source",
    enableSorting: false,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <SourceLink href={info.getValue()} />
        {!info.row.original.checked && <span className="text-xs text-faint-foreground">not verified</span>}
      </div>
    ),
  }),
];

export function ModelsTable({ models }: { models: ModelRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "released", desc: true }]);
  const [query, setQuery] = useState("");
  const [openness, setOpenness] = useState<Set<Model["openness"]>>(() => new Set(OPENNESS));

  const data = useMemo(() => models.filter((model) => openness.has(model.openness)), [models, openness]);

  // TanStack Table v8 is not React Compiler-safe; the project does not enable the compiler, so this is expected.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    // A value that is not public yet sorts last, whatever the direction.
    defaultColumn: { sortUndefined: "last" },
    state: { sorting, globalFilter: query },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    globalFilterFn: (row, _columnId, value: string) => {
      const needle = value.toLowerCase();
      const { name, labName, family } = row.original;
      return [name, labName, family].some((text) => text.toLowerCase().includes(needle));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const model of models) result[model.openness] = (result[model.openness] ?? 0) + 1;
    return result;
  }, [models]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {OPENNESS.map((value) => (
            <FilterChip
              key={value}
              label={opennessLabels[value]}
              color={opennessColors[value]}
              count={counts[value] ?? 0}
              pressed={openness.has(value)}
              disabled={!counts[value]}
              onPressedChange={(on) =>
                setOpenness((current) => {
                  const next = new Set(current);
                  if (on) next.add(value);
                  else next.delete(value);
                  return next;
                })
              }
            />
          ))}
        </div>
        <div className="relative md:ml-auto md:w-64">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-faint-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a model or a lab"
            aria-label="Search models"
            className="pl-9"
          />
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    >
                      <span className="group/tip relative inline-flex">
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            aria-describedby={header.column.columnDef.meta?.hint ? `hint-${header.id}` : undefined}
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
                              sorted && "text-foreground",
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <Icon className="size-3.5" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {header.column.columnDef.meta?.hint && (
                          <Tooltip id={`hint-${header.id}`} content={header.column.columnDef.meta.hint} />
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  No model matches these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs leading-relaxed text-faint-foreground">
        Scores:{" "}
        {benchmarks.map((benchmark, index) => (
          <span key={benchmark.id}>
            {index > 0 && " · "}
            <a
              href={benchmark.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {benchmark.label}
            </a>
          </span>
        ))}
        . Each score links to its source; * = not verified yet. A small label next to a score is the setting tested
        (reasoning effort, version).
      </p>
    </div>
  );
}
