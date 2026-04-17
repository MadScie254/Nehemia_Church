const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const dataDir = path.join(__dirname, "backend", "data");
const dataFilePath = path.join(dataDir, "donations.json");

const defaultProjects = [
  {
    id: "church-building",
    name: "Church Building Project",
    target: 5000000,
    raised: 2600000
  },
  {
    id: "youth-equipment",
    name: "Youth Equipment Fund",
    target: 750000,
    raised: 277500
  },
  {
    id: "community-outreach",
    name: "Community Outreach Fund",
    target: 1200000,
    raised: 768000
  }
];

const createDefaultStore = () => ({
  projects: defaultProjects,
  donations: []
});

const ensureDataStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(createDefaultStore(), null, 2), "utf8");
  }
};

const normalizeStore = (store) => {
  const safeStore = {
    projects: Array.isArray(store.projects) ? store.projects : [],
    donations: Array.isArray(store.donations) ? store.donations : []
  };

  defaultProjects.forEach((defaultProject) => {
    const existing = safeStore.projects.find((project) => project.id === defaultProject.id);

    if (existing) {
      existing.name = String(existing.name || defaultProject.name);
      existing.target = Number(existing.target) > 0 ? Number(existing.target) : defaultProject.target;
      existing.raised = Number(existing.raised) >= 0 ? Number(existing.raised) : defaultProject.raised;
    } else {
      safeStore.projects.push({ ...defaultProject });
    }
  });

  return safeStore;
};

const readStore = () => {
  ensureDataStore();

  try {
    const raw = fs.readFileSync(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeStore(parsed);
  } catch (_error) {
    const fallback = createDefaultStore();
    fs.writeFileSync(dataFilePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
};

const writeStore = (store) => {
  const normalized = normalizeStore(store);
  fs.writeFileSync(dataFilePath, JSON.stringify(normalized, null, 2), "utf8");
};

const serializeProject = (project) => {
  const target = Number(project.target) || 0;
  const raised = Number(project.raised) || 0;
  const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  return {
    id: project.id,
    name: project.name,
    target,
    raised,
    percent: Number(percent.toFixed(2))
  };
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/projects", (_req, res) => {
  const store = readStore();
  res.json({
    projects: store.projects.map(serializeProject)
  });
});

app.post("/api/donations", (req, res) => {
  const { projectId, amount, donorName, donorEmail, paymentMethod, note } = req.body || {};

  const sanitizedProjectId = String(projectId || "").trim();
  const sanitizedAmount = Number(amount);

  if (!sanitizedProjectId) {
    res.status(400).json({ message: "Project is required." });
    return;
  }

  if (!Number.isFinite(sanitizedAmount) || sanitizedAmount <= 0) {
    res.status(400).json({ message: "Donation amount must be greater than zero." });
    return;
  }

  const store = readStore();
  const project = store.projects.find((item) => item.id === sanitizedProjectId);

  if (!project) {
    res.status(404).json({ message: "Project not found." });
    return;
  }

  const donation = {
    id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now()),
    projectId: sanitizedProjectId,
    amount: sanitizedAmount,
    donorName: String(donorName || "").trim().slice(0, 120),
    donorEmail: String(donorEmail || "").trim().slice(0, 180),
    paymentMethod: String(paymentMethod || "").trim().slice(0, 60),
    note: String(note || "").trim().slice(0, 1200),
    createdAt: new Date().toISOString()
  };

  project.raised = Number(project.raised || 0) + sanitizedAmount;
  store.donations.push(donation);
  writeStore(store);

  res.status(201).json({
    message: "Donation recorded successfully.",
    donation,
    project: serializeProject(project)
  });
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Nehemia site server running at http://localhost:${PORT}`);
});
