// Verdict labels: what each deal signal means, and how it is shown.
// A deal is only as good as the evidence behind it, so every verdict carries
// a one-line reason that names the evidence (see data.js).

export const VERDICTS = {
  "new-low": {
    label: "NEW LOW",
    short: "New low",
    blurb: "Lowest price the trackers have seen. The real thing.",
  },
  strong: {
    label: "STRONG DEAL",
    short: "Strong deal",
    blurb: "A real cut, well below the usual price.",
  },
  small: {
    label: "SMALL CUT",
    short: "Small cut",
    blurb: "A genuine discount, but a small one.",
  },
  routine: {
    label: "ROUTINE",
    short: "Routine",
    blurb: "About the usual sale price. Only buy if you need it now.",
  },
};

// Discount in whole percent, from the sale price and the usual price.
export function discountPercent(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.round((1 - deal.price / deal.was) * 100);
}

// Dollars saved.
export function dollarsSaved(deal) {
  return Math.max(0, deal.was - deal.price);
}

// Money as shoppers read it: $1,049, $29, $229.99.
export function money(amount) {
  const text = Number(amount).toFixed(2);
  return "$" + (text.endsWith(".00") ? text.slice(0, -3) : text);
}

// A deal counts as "really a deal" when its verdict is a new low or strong.
export function isRealDeal(deal) {
  return deal.verdict === "new-low" || deal.verdict === "strong";
}
