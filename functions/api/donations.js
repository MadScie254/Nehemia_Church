import { jsonResponse, loadStore, optionsResponse, saveStore, serializeProject } from "./_lib/store.js";

const sanitizeText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

export const onRequestOptions = async () => optionsResponse();

export const onRequestPost = async ({ env, request }) => {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON payload." }, 400);
  }

  const projectId = sanitizeText(payload.projectId, 120);
  const amount = Number(payload.amount);

  if (!projectId) {
    return jsonResponse({ message: "Project is required." }, 400);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonResponse({ message: "Donation amount must be greater than zero." }, 400);
  }

  try {
    const store = await loadStore(env);
    const project = store.projects.find((item) => item.id === projectId);

    if (!project) {
      return jsonResponse({ message: "Project not found." }, 404);
    }

    const donation = {
      id: crypto.randomUUID(),
      projectId,
      amount,
      donorName: sanitizeText(payload.donorName, 120),
      donorEmail: sanitizeText(payload.donorEmail, 180),
      paymentMethod: sanitizeText(payload.paymentMethod, 60),
      note: sanitizeText(payload.note, 1200),
      createdAt: new Date().toISOString()
    };

    project.raised = Number(project.raised || 0) + amount;
    store.donations.push(donation);

    await saveStore(env, store);

    return jsonResponse(
      {
        message: "Donation recorded successfully.",
        donation,
        project: serializeProject(project)
      },
      201
    );
  } catch (error) {
    return jsonResponse(
      { message: error instanceof Error ? error.message : "Unable to record donation." },
      500
    );
  }
};
