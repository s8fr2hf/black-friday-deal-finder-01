// Rendering: turns deals into HTML. One card per deal on the list, and one
// full page per deal on its own route. No network calls: everything shown
// comes from data.js, and every store link is a plain <a href>.

import { DEALS, CHECKED_LABEL } from "./data.js";
import { VERDICTS, discountPercent, dollarsSaved, money } from "./verdict.js";

// Short, readable check time: "27 Nov 2026, 07:15 UTC".
export function checkedLabel() {
  return CHECKED_LABEL;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// A coloured tile with the product's initials: the site's own artwork, drawn
// in CSS, so no image has to load at all.
const TILE_COLORS = {
  Audio: ["#7c3aed", "#4f46e5"],
  Wearables: ["#0891b2", "#0e7490"],
  Laptops: ["#1d4ed8", "#1e40af"],
  TVs: ["#b91c1c", "#7f1d1d"],
  "Smart home": ["#15803d", "#166534"],
  Gaming: ["#c2410c", "#9a3412"],
  Toys: ["#db2777", "#9d174d"],
  "Kitchen & Home": ["#a16207", "#854d0e"],
  "PC parts": ["#334155", "#0f172a"],
};

function initials(title) {
  const words = title.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function dealCard(deal) {
  const verdict = VERDICTS[deal.verdict];
  const percent = discountPercent(deal);
  const colors = TILE_COLORS[deal.category] ?? ["#334155", "#0f172a"];
  return `<article class="card" data-id="${deal.id}">
    <a class="tile" href="#/deal/${deal.id}" style="background:linear-gradient(135deg, ${colors[0]}, ${colors[1]})" aria-label="${escapeHtml(deal.title)} details">
      <span class="tile-initials">${initials(deal.title)}</span>
      <span class="tile-category">${escapeHtml(deal.category)}</span>
    </a>
    <div class="card-body">
      <div class="card-top">
        <span class="store">${escapeHtml(deal.store)}</span>
        <span class="verdict verdict-${deal.verdict}">${verdict.label}</span>
      </div>
      <h3><a href="#/deal/${deal.id}">${escapeHtml(deal.title)}</a></h3>
      <p class="prices"><span class="price">${money(deal.price)}</span>
        <span class="was">${money(deal.was)}</span>
        <span class="off">-${percent}%</span></p>
      <p class="save">You save ${money(dollarsSaved(deal))}</p>
      <p class="evidence">${escapeHtml(deal.evidence)}</p>
      <p class="checked">Price checked ${checkedLabel()} &middot; ${escapeHtml(deal.source)}</p>
      <a class="buy" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} &rarr;</a>
    </div>
  </article>`;
}

export function dealGrid(deals) {
  if (deals.length === 0) {
    return `<p class="empty">No deals match those filters. Loosen the discount, clear the search, or turn off "real deals only".</p>`;
  }
  return `<div class="grid">${deals.map(dealCard).join("")}</div>`;
}

export function dealDetail(deal) {
  const verdict = VERDICTS[deal.verdict];
  const percent = discountPercent(deal);
  const colors = TILE_COLORS[deal.category] ?? ["#334155", "#0f172a"];
  const others = DEALS.filter((d) => d.store === deal.store && d.id !== deal.id).slice(0, 4);
  return `<div class="detail">
    <p class="back"><a href="#/">&larr; Back to all deals</a></p>
    <div class="detail-head">
      <div class="tile tile-big" style="background:linear-gradient(135deg, ${colors[0]}, ${colors[1]})">
        <span class="tile-initials">${initials(deal.title)}</span>
        <span class="tile-category">${escapeHtml(deal.category)}</span>
      </div>
      <div>
        <p class="card-top"><span class="store">${escapeHtml(deal.store)}</span>
          <span class="verdict verdict-${deal.verdict}">${verdict.label}</span></p>
        <h2>${escapeHtml(deal.title)}</h2>
        <p class="prices"><span class="price price-big">${money(deal.price)}</span>
          <span class="was">${money(deal.was)}</span>
          <span class="off">-${percent}%</span></p>
        <p class="save">You save ${money(dollarsSaved(deal))} off the usual price.</p>
        <a class="buy buy-big" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} &rarr;</a>
      </div>
    </div>
    <section class="verdict-box verdict-box-${deal.verdict}">
      <h3>Is it really a deal? ${verdict.short}</h3>
      <p>${verdict.blurb}</p>
      <p><strong>Evidence:</strong> ${escapeHtml(deal.evidence)}</p>
    </section>
    <section class="facts">
      <h3>Checked, not guessed</h3>
      <dl>
        <dt>Sale price</dt><dd>${money(deal.price)}</dd>
        <dt>Usual price</dt><dd>${money(deal.was)}</dd>
        <dt>Discount</dt><dd>${percent}% (${money(dollarsSaved(deal))} off)</dd>
        <dt>Store</dt><dd>${escapeHtml(deal.store)}</dd>
        <dt>Price checked</dt><dd>${checkedLabel()}</dd>
        <dt>Where it was read</dt><dd>${escapeHtml(deal.source)}</dd>
      </dl>
      <p class="note">Prices move during Black Friday. Check the live price at the store before you buy; the link above goes to the product at ${escapeHtml(deal.store)}.</p>
    </section>
    ${others.length ? `<section class="more"><h3>More at ${escapeHtml(deal.store)}</h3><div class="grid">${others.map(dealCard).join("")}</div></section>` : ""}
  </div>`;
}
