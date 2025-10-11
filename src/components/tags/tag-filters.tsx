"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TagFilterParams = {
  sortBy: "popular" | "recent" | "liked" | "oldest";
  dateRange: "all" | "week" | "month" | "year";
  type: string;
  domain: string;
};

type TagFilterOption = {
  value: string;
  label: string;
};

interface TagFiltersProps {
  initialFilters: TagFilterParams;
  options: {
    domains: TagFilterOption[];
    types: TagFilterOption[];
  };
}

const SORT_LABELS: Record<TagFilterParams["sortBy"], string> = {
  popular: "Most Popular",
  recent: "Most Recent",
  liked: "Most Liked",
  oldest: "Oldest",
};

const DATE_LABELS: Record<TagFilterParams["dateRange"], string> = {
  all: "All Time",
  week: "Last Week",
  month: "Last Month",
  year: "Last Year",
};

export function TagFilters({ initialFilters, options }: TagFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [sortBy, setSortBy] = useState<TagFilterParams["sortBy"]>(initialFilters.sortBy);
  const [dateRange, setDateRange] = useState<TagFilterParams["dateRange"]>(initialFilters.dateRange);
  const [type, setType] = useState(initialFilters.type);
  const [domain, setDomain] = useState(initialFilters.domain);

  useEffect(() => {
    setSortBy(initialFilters.sortBy);
  }, [initialFilters.sortBy]);

  useEffect(() => {
    setDateRange(initialFilters.dateRange);
  }, [initialFilters.dateRange]);

  useEffect(() => {
    setType(initialFilters.type);
  }, [initialFilters.type]);

  useEffect(() => {
    setDomain(initialFilters.domain);
  }, [initialFilters.domain]);

  const hasTypeOptions = options.types.length > 0;
  const hasDomainOptions = options.domains.length > 0;

  const domainOptions = useMemo(() => {
    const defaultOption: TagFilterOption = { value: "all", label: "All Domains" };
    if (!hasDomainOptions) {
      return [defaultOption];
    }
    return [defaultOption, ...options.domains];
  }, [hasDomainOptions, options.domains]);

  const typeOptions = useMemo(() => {
    const defaultOption: TagFilterOption = { value: "all", label: "All Types" };
    if (!hasTypeOptions) {
      return [defaultOption];
    }
    return [defaultOption, ...options.types];
  }, [hasTypeOptions, options.types]);

  const updateRoute = (nextFilters: TagFilterParams) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (nextFilters.sortBy !== "recent") {
      params.set("sort", nextFilters.sortBy);
    } else {
      params.delete("sort");
    }

    if (nextFilters.dateRange !== "all") {
      params.set("time", nextFilters.dateRange);
    } else {
      params.delete("time");
    }

    if (nextFilters.type !== "all") {
      params.set("type", nextFilters.type);
    } else {
      params.delete("type");
    }

    if (nextFilters.domain !== "all") {
      params.set("domain", nextFilters.domain);
    } else {
      params.delete("domain");
    }

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const handleClearAll = () => {
    const cleared: TagFilterParams = {
      sortBy: "recent",
      dateRange: "all",
      type: "all",
      domain: "all",
    };

    setSortBy(cleared.sortBy);
    setDateRange(cleared.dateRange);
    setType(cleared.type);
    setDomain(cleared.domain);
    updateRoute(cleared);
  };

  const handleChange = (field: keyof TagFilterParams, value: string) => {
    const nextFilters: TagFilterParams = {
      sortBy,
      dateRange,
      type,
      domain,
    };

    if (field === "sortBy") {
      const nextValue = value as TagFilterParams["sortBy"];
      setSortBy(nextValue);
      nextFilters.sortBy = nextValue;
    } else if (field === "dateRange") {
      const nextValue = value as TagFilterParams["dateRange"];
      setDateRange(nextValue);
      nextFilters.dateRange = nextValue;
    } else if (field === "type") {
      const normalized = value || "all";
      setType(normalized);
      nextFilters.type = normalized;
    } else if (field === "domain") {
      const normalized = value || "all";
      setDomain(normalized);
      nextFilters.domain = normalized;
    }

    updateRoute(nextFilters);
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Filter Bookmarks</h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-neutral-500 hover:text-neutral-700"
          type="button"
          disabled={isPending}
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Sort by</label>
          <select
            value={sortBy}
            onChange={(event) => handleChange("sortBy", event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending}
          >
            {(Object.keys(SORT_LABELS) as Array<TagFilterParams["sortBy"]>).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Date Range</label>
          <select
            value={dateRange}
            onChange={(event) => handleChange("dateRange", event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending}
          >
            {(Object.keys(DATE_LABELS) as Array<TagFilterParams["dateRange"]>).map((option) => (
              <option key={option} value={option}>
                {DATE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Type</label>
          <select
            value={type}
            onChange={(event) => handleChange("type", event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending || !hasTypeOptions}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Domain</label>
          <select
            value={domain}
            onChange={(event) => handleChange("domain", event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending || !hasDomainOptions}
          >
            {domainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
