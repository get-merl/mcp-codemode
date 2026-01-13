export function slugifyServerName(serverName: string) {
  // Keep it filesystem-friendly and stable.
  return serverName.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

