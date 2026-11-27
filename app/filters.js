// Filtering and sorting: the pure logic behind the finder's controls.
// No DOM here, so the same rules can be tested on their own.

import { discountPercent, isRealDeal } from "./verdict.js";

export const SORTS = {
  "biggest-discount": "Biggest discount",
  "lowest-price": "Lowest price",
  "biggest-saving": "Biggest saving ($)",
  "new-lows-first": "New lows first",
};

// The finder's state: one object, every control in it.
export function blankFilters() {
  return {
    query: "",
    category: "All",
    store: "All",
    minDiscount: 0,
    realOnly: false,
    sort: "biggest-discount",
  };
}

const VERDICT_RANK = { "new-low": 0, strong: 1, small: 2, routine: 3 };

export function applyFilters(deals, filters) {
  const query = filters.query.trim().toLowerCase();
  const kept = deals.filter((deal) => {
    if (filters.category !== "All" && deal.category !== filters.category) return false;
    if (filters.store !== "All" && deal.store !== filters.store) return false;
    if (discountPercent(deal) < filters.minDiscount) return false;
    if (filters.realOnly && !isRealDeal(deal)) return false;
    if (query) {
      const haystack = `${deal.title} ${deal.store} ${deal.category} ${deal.source}`.toLowerCase();
      if (!query.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });

  const sorted = [...kept];
  if (filters.sort === "biggest-discount") {
    sorted.sort((a, b) => discountPercent(b) - discountPercent(a) || a.price - b.price);
  } else if (filters.sort === "lowest-price") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "biggest-saving") {
    sorted.sort((a, b) => b.was - b.price - (a.was - a.price));
  } else if (filters.sort === "new-lows-first") {
    sorted.sort(
      (a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || discountPercent(b) - discountPercent(a),
    );
  }
  return sorted;
}

// Counts for the filter chips: how many deals each category holds.
export function countByCategory(deals) {
  const counts = {};
  for (const deal of deals) counts[deal.category] = (counts[deal.category] ?? 0) + 1;
  return counts;
}
