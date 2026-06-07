const STORE_KEY = "donations:store:v1";

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

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createDefaultStore = () => ({
  projects: defaultProjects.map((project) => ({ ...project })),
  donations: []
});

const normalizeStore = (store) => {
  const safeStore = {
    projects: Array.isArray(store?.projects) ? store.projects : [],
    donations: Array.isArray(store?.donations) ? store.donations : []
  };

  defaultProjects.forEach((defaultProject) => {
    const existing = safeStore.projects.find((project) => project.id === defaultProject.id);

    if (existing) {
      existing.name = String(existing.name || defaultProject.name);
      existing.target = toNumber(existing.target, defaultProject.target);
      existing.raised = Math.max(0, toNumber(existing.raised, defaultProject.raised));
      return;
    }

    safeStore.projects.push({ ...defaultProject });
  });

  return safeStore;
};

const getKvBinding = (env) => {
  const kv = env?.DONATIONS_KV;
  if (!kv) {
    throw new Error("Cloudflare KV binding 'DONATIONS_KV' is missing.");
  }
  return kv;
};

export const loadStore = async (env) => {
  const kv = getKvBinding(env);

  const stored = await kv.get(STORE_KEY, "json");
  if (stored) {
    return normalizeStore(stored);
  }

  const initial = createDefaultStore();
  await kv.put(STORE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStore = async (env, store) => {
  const kv = getKvBinding(env);
  const normalized = normalizeStore(store);
  await kv.put(STORE_KEY, JSON.stringify(normalized));
};

export const serializeProject = (project) => {
  const target = Math.max(0, toNumber(project.target));
  const raised = Math.max(0, toNumber(project.raised));
  const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  return {
    id: String(project.id),
    name: String(project.name || "Project"),
    target,
    raised,
    percent: Number(percent.toFixed(2))
  };
};

export const jsonResponse = (body, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }
  });
};

export const optionsResponse = () => new Response(null, { status: 204 });
