export function toCamelCase(name: string) {
  const parts = name.split(/[^a-zA-Z0-9]+/g).filter(Boolean);
  if (parts.length === 0) return "tool";
  const [first, ...rest] = parts;
  return (
    first.toLowerCase() +
    rest.map((p) => p.slice(0, 1).toUpperCase() + p.slice(1).toLowerCase()).join("")
  );
}

export function toPascalCase(name: string) {
  const c = toCamelCase(name);
  return c.slice(0, 1).toUpperCase() + c.slice(1);
}

