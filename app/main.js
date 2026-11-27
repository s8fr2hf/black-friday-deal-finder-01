// Wiring: the controls, the hash routes and the stats bar.
// Routes: "" (all deals), "#/new-lows" (real deals only, new lows first),
// "#/deal/<id>" (one deal's page), "#/search/<words>" (a search).
// Everything runs from local files; nothing is fetched.

import { DEALS, CATEGORIES, STORES, CHECKED_LABEL } from "./data.js";
import { blankFilters, applyFilters, countByCategory, SORTS } from "./filters.js";
import { dealGrid, dealDetail, checkedLabel } from "./views.js";
import { discountPercent, dollarsSaved, isRealDeal, money } from "./verdict.js";

const root = document.getElementById("app");
const filters = blankFilters();

function readRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [route, ...rest] = hash.split("/");
  if (route === "deal") return { page: "deal", id: decodeURIComponent(rest.join("/")) };
  if (route === "new-lows") return { page: "new-lows" };
  if (route === "search") return { page: "search", query: decodeURIComponent(rest.join("/")) };
  return { page: "list" };
}

function statsBar(deals) {
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  const real = deals.filter(isRealDeal).length;
  const saved = deals.reduce((sum, d) => sum + dollarsSaved(d), 0);
  const best = Math.max(...deals.map(discountPercent));
  return `<section class="stats" aria-label="Sale at a glance">
    <div><strong>${deals.length}</strong><span>deals checked</span></div>
    <div><strong>${newLows}</strong><span>new lows</span></div>
    <div><strong>${real}</strong><span>really a deal</span></div>
    <div><strong>${best}%</strong><span>biggest cut</span></div>
    <div><strong>${money(saved)}</strong><span>total savings if you bought one of each</span></div>
  </section>`;
}

function controlsBar(counts) {
  const categories = ["All", ...CATEGORIES];
  const stores = ["All", ...STORES];
  const discounts = [0, 20, 30, 40, 50];
  return `<section class="controls" aria-label="Search and filter deals">
    <label class="search-label">Search
      <input id="search" type="search" placeholder="Try &quot;airpods&quot;, &quot;lego&quot;, &quot;dyson&quot;&hellip;" value="${filters.query.replaceAll('"', "&quot;")}">
    </label>
    <div class="chips" role="group" aria-label="Category">
      ${categories.map((c) => `<button type="button" class="chip${filters.category === c ? " active" : ""}" data-category="${c}">${c}${c === "All" ? "" : ` (${counts[c] ?? 0})`}</button>`).join("")}
    </div>
    <div class="selects">
      <label>Store
        <select id="store">${stores.map((s) => `<option${filters.store === s ? " selected" : ""}>${s}</option>`).join("")}</select>
      </label>
      <label>At least
        <select id="min-discount">${discounts.map((d) => `<option value="${d}"${filters.minDiscount === d ? " selected" : ""}>${d === 0 ? "Any discount" : d + "% off"}</option>`).join("")}</select>
      </label>
      <label>Sort by
        <select id="sort">${Object.entries(SORTS).map(([value, label]) => `<option value="${value}"${filters.sort === value ? " selected" : ""}>${label}</option>`).join("")}</select>
      </label>
      <label class="real-only"><input id="real-only" type="checkbox"${filters.realOnly ? " checked" : ""}> Real deals only</label>
    </div>
  </section>`;
}

function render() {
  const route = readRoute();
  if (route.page === "deal") {
    const deal = DEALS.find((d) => d.id === route.id);
    root.innerHTML = deal ? dealDetail(deal) : `<p class="empty">That deal is not on the board. <a href="#/">Back to all deals</a>.</p>`;
    return;
  }
  if (route.page === "new-lows") {
    filters.realOnly = true;
    filters.sort = "new-lows-first";
  } else if (route.page === "search") {
    filters.query = route.query;
  }
  const shown = applyFilters(DEALS, filters);
  const counts = countByCategory(DEALS);
  const heading =
    route.page === "new-lows"
      ? `<h2>New lows &amp; strong deals</h2><p class="lede">Only the deals our checks say are really deals: ${shown.length} of ${DEALS.length}.</p>`
      : `<h2>All Black Friday &amp; Cyber Monday deals</h2><p class="lede">Showing ${shown.length} of ${DEALS.length} deals, each price-checked by our agent on ${checkedLabel()}.</p>`;
  root.innerHTML = `${statsBar(DEALS)}${controlsBar(counts)}${heading}${dealGrid(shown)}
    <footer class="method">
      <h3>How the prices were checked</h3>
      <p>Every deal on this board was found and checked by the agent that built this site on Black Friday itself, 27 November 2026, by reading the store's own sale page or a deals roundup that names the store and the price. Each card names where its price was read and when. Prices can change during the sale, so check the live price at the store before you buy. The verdict on each deal says whether it is really a deal: a <strong>new low</strong> is the lowest price the trackers have seen, a <strong>strong deal</strong> is a real cut well below the usual price, a <strong>small cut</strong> is genuine but small, and a <strong>routine</strong> price is about the usual sale price.</p>
      <p>Deal Drop &middot; an independent Black Friday finder &middot; not affiliated with any store. Black Friday 27 Nov 2026, Cyber Monday 30 Nov 2026.</p>
    </footer>`;

  document.getElementById("search").addEventListener("input", (event) => {
    filters.query = event.target.value;
    renderResultsOnly();
  });
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filters.category = chip.dataset.category;
      render();
    });
  });
  document.getElementById("store").addEventListener("change", (event) => {
    filters.store = event.target.value;
    render();
  });
  document.getElementById("min-discount").addEventListener("change", (event) => {
    filters.minDiscount = Number(event.target.value);
    render();
  });
  document.getElementById("sort").addEventListener("change", (event) => {
    filters.sort = event.target.value;
    render();
  });
  document.getElementById("real-only").addEventListener("change", (event) => {
    filters.realOnly = event.target.checked;
    render();
  });
}

// Re-render only the heading and grid while typing, so the search box keeps focus.
function renderResultsOnly() {
  const shown = applyFilters(DEALS, filters);
  const heading = root.querySelector("h2");
  const lede = root.querySelector(".lede");
  const grid = root.querySelector(".grid, .empty");
  if (heading) heading.textContent = "All Black Friday & Cyber Monday deals";
  if (lede) lede.textContent = `Showing ${shown.length} of ${DEALS.length} deals, each price-checked by our agent on ${checkedLabel()}.`;
  if (grid) grid.outerHTML = dealGrid(shown);
}

window.addEventListener("hashchange", render);
render();
