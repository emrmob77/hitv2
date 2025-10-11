"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TIME_OPTION_VALUES = ["all", "today", "week", "month", "year"];
const SORT_OPTION_VALUES = ["popular", "recent", "liked", "saved"];
const TIME_OPTION_SET = new Set<string>(TIME_OPTION_VALUES);
const SORT_OPTION_SET = new Set<string>(SORT_OPTION_VALUES);

interface ExploreFiltersProps {
  categories: Array<{ slug: string; label: string }>;
  initialCategory?: string;
  initialTimePeriod?: string;
  initialSortBy?: string;
}

export function ExploreFilters({
  categories,
  initialCategory = "all",
  initialTimePeriod = "all",
  initialSortBy = "popular",
}: ExploreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState(initialCategory);
  const [timePeriod, setTimePeriod] = useState(initialTimePeriod);
  const [sortBy, setSortBy] = useState(initialSortBy);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setTimePeriod(initialTimePeriod);
  }, [initialTimePeriod]);

  useEffect(() => {
    setSortBy(initialSortBy);
  }, [initialSortBy]);

  const normalizedCategories = categories.length
    ? categories
    : [{ slug: "all", label: "All Categories" }];

  const updateRoute = (next: {
    category: string;
    timePeriod: string;
    sortBy: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    const validCategory = normalizedCategories.some((option) => option.slug === next.category)
      ? next.category
      : "all";
    const validTime = TIME_OPTION_SET.has(next.timePeriod)
      ? next.timePeriod
      : "all";
    const validSort = SORT_OPTION_SET.has(next.sortBy)
      ? next.sortBy
      : "popular";

    if (validCategory !== "all") {
      params.set("category", validCategory);
    } else {
      params.delete("category");
    }

    if (validTime !== "all") {
      params.set("time", validTime);
    } else {
      params.delete("time");
    }

    if (validSort !== "popular") {
      params.set("sort", validSort);
    } else {
      params.delete("sort");
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `/explore?${queryString}` : "/explore", { scroll: false });
    });
  };

  const handleChange = (
    type: "category" | "timePeriod" | "sortBy",
    value: string
  ) => {
    const nextFilters = {
      category,
      timePeriod,
      sortBy,
    };

    if (type === "category") {
      setCategory(value);
      nextFilters.category = value;
    } else if (type === "timePeriod") {
      setTimePeriod(value);
      nextFilters.timePeriod = value;
    } else {
      setSortBy(value);
      nextFilters.sortBy = value;
    }

    updateRoute(nextFilters);
  };

  return (
    <div className="sticky top-8 rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-neutral-900">Filters</h3>

      <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          disabled={isPending}
        >
          {normalizedCategories.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-700">
            Time Period
          </label>
          <select
            value={timePeriod}
            onChange={(e) => handleChange("timePeriod", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending}
          >
            {TIME_OPTION_VALUES.map((value) => (
              <option key={value} value={value}>
                {value === "all"
                  ? "All Time"
                  : value === "today"
                  ? "Today"
                  : value === "week"
                  ? "This Week"
                  : value === "month"
                  ? "This Month"
                  : "This Year"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-700">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            disabled={isPending}
          >
            {SORT_OPTION_VALUES.map((value) => (
              <option key={value} value={value}>
                {value === "popular"
                  ? "Most Popular"
                  : value === "recent"
                  ? "Most Recent"
                  : value === "liked"
                  ? "Most Liked"
                  : "Most Saved"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
