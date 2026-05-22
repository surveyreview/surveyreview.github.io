const DATA_PATH = "./data/benchmark.json";

async function main() {
  const response = await fetch(DATA_PATH);
  if (!response.ok) {
    throw new Error(`Failed to load ${DATA_PATH}: ${response.status}`);
  }

  const data = await response.json();
  renderPage(data);
}

function renderPage(data) {
  renderHero(data);
  renderOverview(data.overview);
  renderDimensions(data.dimensions);
  renderPipeline(data.pipeline);
  renderDataset(data.datasetStats);
  renderLeaderboard(data.leaderboard);
  renderExamples(data.examples);
  renderUsage(data);
}

function renderHero(data) {
  document.title = `${data.site.title} | Benchmark`;
  setText("hero-title", data.site.title);
  setText("hero-subtitle", data.site.subtitle);
  setText("hero-announcement", data.site.announcement);

  const links = [
    { label: "Code", href: data.site.repoUrl, secondary: false },
    { label: "Current Dataset", href: data.site.datasetUrl, secondary: false },
    { label: "Leaderboard", href: "#leaderboard", secondary: true },
    { label: "Paper", href: data.site.paperUrl, secondary: true, optional: true },
  ];

  const linksRoot = document.getElementById("hero-links");
  linksRoot.innerHTML = "";
  links.forEach((item) => {
    if (item.optional && !item.href) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.className = `button-link${item.secondary ? " secondary" : ""}${item.href ? "" : " disabled"}`;
    anchor.textContent = item.label;
    anchor.href = item.href || "#";
    if (item.href && /^https?:\/\//.test(item.href)) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }
    linksRoot.appendChild(anchor);
  });

  const metricRoot = document.getElementById("hero-metrics");
  metricRoot.innerHTML = "";
  data.heroMetrics.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `
      <span class="metric-value">${metric.value}</span>
      <span class="metric-label">${metric.label}</span>
    `;
    metricRoot.appendChild(card);
  });
}

function renderOverview(overview) {
  setText("overview-intro", overview.intro);
  renderList("overview-highlights", overview.highlights);
}

function renderDimensions(dimensions) {
  const root = document.getElementById("dimension-grid");
  root.innerHTML = "";

  dimensions.forEach((item) => {
    const article = document.createElement("article");
    article.className = "dimension-card";
    article.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="dimension-meta">
        <span class="meta-chip">${item.samples} test items</span>
        <span class="meta-chip">${item.range}</span>
      </div>
    `;
    root.appendChild(article);
  });
}

function renderPipeline(steps) {
  const root = document.getElementById("pipeline-grid");
  root.innerHTML = "";

  steps.forEach((step) => {
    const article = document.createElement("article");
    article.className = "pipeline-card";
    article.innerHTML = `
      <span class="pipeline-step">${step.step}</span>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    `;
    root.appendChild(article);
  });
}

function renderDataset(stats) {
  const root = document.getElementById("dataset-grid");
  root.innerHTML = "";

  stats.forEach((item) => {
    const article = document.createElement("article");
    article.className = "dataset-card";
    const distRows = Object.entries(item.distribution)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([score, count]) => distributionRow(score, count, item.total))
      .join("");

    article.innerHTML = `
      <div class="dataset-topline">
        <div>
          <h3>${item.name}</h3>
          <span>${item.definition}</span>
        </div>
        <strong>${item.total}</strong>
      </div>
      <p>Positive labels: ${item.positive} · Negative labels: ${item.negative}</p>
      <div class="distribution">${distRows}</div>
    `;
    root.appendChild(article);
  });
}

function distributionRow(score, count, total) {
  const width = Math.max((count / total) * 100, 4);
  return `
    <div class="distribution-row">
      <span class="distribution-label">${score}</span>
      <div class="distribution-bar">
        <div class="distribution-fill" style="width: ${width}%"></div>
      </div>
      <span class="distribution-value">${count}</span>
    </div>
  `;
}

function renderLeaderboard(rows) {
  const bestSsr = Math.max(...rows.map((row) => row.ssr));
  const bestRqs = Math.max(...rows.map((row) => row.rqs));
  const bestValues = bestMetricMap(rows);

  const root = document.getElementById("leaderboard-body");
  root.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.rank === 1) {
      tr.classList.add("is-top");
    }

    tr.innerHTML = `
      <td>${row.rank}</td>
      <td class="model-cell">
        <span class="model-name">${row.model}</span>
        <span class="model-org">${row.org}</span>
      </td>
      <td class="${row.ssr === bestSsr ? "best-score" : ""}">${formatNumber(row.ssr)}</td>
      <td class="${bestValues.readabilityMse === row.readabilityMse ? "best-score" : ""}">${formatNumber(row.readabilityMse)}</td>
      <td class="${bestValues.readabilityMae === row.readabilityMae ? "best-score" : ""}">${formatNumber(row.readabilityMae)}</td>
      <td class="${bestValues.criticalnessMse === row.criticalnessMse ? "best-score" : ""}">${formatNumber(row.criticalnessMse)}</td>
      <td class="${bestValues.criticalnessMae === row.criticalnessMae ? "best-score" : ""}">${formatNumber(row.criticalnessMae)}</td>
      <td class="${bestValues.comprehensivenessMse === row.comprehensivenessMse ? "best-score" : ""}">${formatNumber(row.comprehensivenessMse)}</td>
      <td class="${bestValues.comprehensivenessMae === row.comprehensivenessMae ? "best-score" : ""}">${formatNumber(row.comprehensivenessMae)}</td>
      <td class="${bestValues.structureMse === row.structureMse ? "best-score" : ""}">${formatNumber(row.structureMse)}</td>
      <td class="${bestValues.structureMae === row.structureMae ? "best-score" : ""}">${formatNumber(row.structureMae)}</td>
      <td class="${bestValues.averageMse === row.averageMse ? "best-score" : ""}">${formatNumber(row.averageMse)}</td>
      <td class="${bestValues.averageMae === row.averageMae ? "best-score" : ""}">${formatNumber(row.averageMae)}</td>
      <td class="${row.rqs === bestRqs ? "best-score" : ""}">${formatNumber(row.rqs)}</td>
    `;
    root.appendChild(tr);
  });
}

function renderExamples(examples) {
  const tabsRoot = document.getElementById("example-tabs");
  tabsRoot.innerHTML = "";

  examples.forEach((example, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `example-tab${index === 0 ? " is-active" : ""}`;
    button.innerHTML = `
      <strong>${example.dimension}</strong>
      <span>${example.title}</span>
    `;
    button.addEventListener("click", () => {
      tabsRoot.querySelectorAll(".example-tab").forEach((tab) => tab.classList.remove("is-active"));
      button.classList.add("is-active");
      renderExampleCard(example);
    });
    tabsRoot.appendChild(button);
  });

  if (examples.length > 0) {
    renderExampleCard(examples[0]);
  }
}

function renderExampleCard(example) {
  setText("example-dimension", example.dimension);
  setText("example-title", example.title);
  setText("example-uid", `UID: ${example.uid}`);
  setText("example-summary", example.summary);
  renderList("example-reasons", example.reasons);

  const badge = document.getElementById("example-score");
  badge.textContent = `Score ${example.score > 0 ? "+" : ""}${example.score}`;
  badge.className = `score-badge ${example.score > 0 ? "positive" : "negative"}`;
}

function renderUsage(data) {
  renderList("usage-list", data.usage);
  setText("release-note", data.releaseNote);
  const link = document.getElementById("contact-link");
  link.textContent = data.site.contactEmail;
  link.href = `mailto:${data.site.contactEmail}`;
}

function renderList(id, items) {
  const root = document.getElementById(id);
  root.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    root.appendChild(li);
  });
}

function setText(id, value) {
  const node = document.getElementById(id);
  node.textContent = value;
}

function formatNumber(value) {
  return Number(value).toFixed(2);
}

function bestMetricMap(rows) {
  const keys = [
    "readabilityMse",
    "readabilityMae",
    "criticalnessMse",
    "criticalnessMae",
    "comprehensivenessMse",
    "comprehensivenessMae",
    "structureMse",
    "structureMae",
    "averageMse",
    "averageMae",
  ];

  return Object.fromEntries(
    keys.map((key) => [key, Math.min(...rows.map((row) => row[key]))])
  );
}

main().catch((error) => {
  console.error(error);
  document.body.innerHTML = `
    <main style="padding: 40px; font-family: sans-serif;">
      <h1>SurveyReview</h1>
      <p>Failed to load page data.</p>
      <pre>${error.message}</pre>
    </main>
  `;
});
