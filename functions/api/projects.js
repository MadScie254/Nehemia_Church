import { jsonResponse, loadStore, optionsResponse, serializeProject } from "./_lib/store.js";

export const onRequestOptions = async () => optionsResponse();

export const onRequestGet = async ({ env }) => {
  try {
    const store = await loadStore(env);
    return jsonResponse({ projects: store.projects.map(serializeProject) });
  } catch (error) {
    return jsonResponse(
      { message: error instanceof Error ? error.message : "Unable to read project data." },
      500
    );
  }
};
