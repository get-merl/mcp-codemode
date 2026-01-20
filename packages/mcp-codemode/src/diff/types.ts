export type ToolChange =
  | { kind: "tool_added"; toolName: string }
  | { kind: "tool_removed"; toolName: string }
  | { kind: "tool_changed"; toolName: string; fields: string[] }
  | { kind: "tool_description_changed"; toolName: string };

export type DiffSummary = {
  breaking: boolean;
  changes: ToolChange[];
};

