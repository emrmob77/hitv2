"use client";

import { useState } from "react";

interface ExploreFiltersProps {
  onFilterChange?: (filters: {
    category: string;
    timePeriod: string;
    sortBy: string;
  }) => void;
}

export function ExploreFilters({ onFilterChange }: ExploreFiltersProps) {
  const [category, setCategory] = useState("all");
  const [timePeriod, setTimePeriod] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const handleChange = (
    type: "category" | "timePeriod" | "sortBy",
    value: string
  ) => {
    const newFilters = { category, timePeriod, sortBy };

    if (type === "category") {
      setCategory(value);
      newFilters.category = value;
    } else if (type === "timePeriod") {
      setTimePeriod(value);
      newFilters.timePeriod = value;
    } else {
      setSortBy(value);
      newFilters.sortBy = value;
    }

    onFilterChange?.(newFilters);
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
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="development">Development</option>
            <option value="business">Business</option>
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
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
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
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Most Recent</option>
            <option value="liked">Most Liked</option>
            <option value="saved">Most Saved</option>
          </select>
        </div>
      </div>
    </div>
  );
}
