"use client";

import { useState } from "react";

export function TagFilters() {
  const [sortBy, setSortBy] = useState("recent");
  const [dateRange, setDateRange] = useState("all");
  const [type, setType] = useState("all");
  const [domain, setDomain] = useState("all");

  const handleClearAll = () => {
    setSortBy("recent");
    setDateRange("all");
    setType("all");
    setDomain("all");
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Filter Bookmarks
        </h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="liked">Most Liked</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="all">All Types</option>
            <option value="articles">Articles</option>
            <option value="tools">Tools</option>
            <option value="videos">Videos</option>
            <option value="resources">Resources</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <option value="all">All Domains</option>
            <option value="dribbble">dribbble.com</option>
            <option value="behance">behance.net</option>
            <option value="figma">figma.com</option>
          </select>
        </div>
      </div>
    </section>
  );
}
