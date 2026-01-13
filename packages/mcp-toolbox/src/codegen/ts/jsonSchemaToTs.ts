// Very small subset converter for MVP:
// - object with properties -> interface
// - primitive -> primitive
// - anything else -> unknown
export function jsonSchemaToTsType(schema: any): string {
  if (!schema || typeof schema !== "object") return "unknown";

  const t = schema.type;
  if (t === "string") return "string";
  if (t === "number" || t === "integer") return "number";
  if (t === "boolean") return "boolean";
  if (t === "null") return "null";
  if (t === "array") {
    return `${jsonSchemaToTsType(schema.items)}[]`;
  }
  if (t === "object" || schema.properties) {
    return "Record<string, unknown>";
  }

  // anyOf/oneOf fallback
  if (Array.isArray(schema.anyOf)) return "unknown";
  if (Array.isArray(schema.oneOf)) return "unknown";
  return "unknown";
}

export function jsonSchemaToTsInterface(name: string, schema: any): string {
  if (!schema || typeof schema !== "object") {
    return `export type ${name} = unknown;\n`;
  }
  const isObject = schema.type === "object" || schema.properties;
  if (!isObject) {
    return `export type ${name} = ${jsonSchemaToTsType(schema)};\n`;
  }

  const props: Record<string, any> = schema.properties ?? {};
  const required: string[] = Array.isArray(schema.required) ? schema.required : [];
  const lines: string[] = [];
  lines.push(`export interface ${name} {`);
  for (const key of Object.keys(props)) {
    const optional = required.includes(key) ? "" : "?";
    lines.push(`  ${safeProp(key)}${optional}: ${jsonSchemaToTsType(props[key])};`);
  }
  lines.push(`}`);
  lines.push("");
  return lines.join("\n") + "\n";
}

function safeProp(key: string) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

