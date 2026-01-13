type ToolboxServerConfig = {
    registryId: string;
    channel: "latest";
    overrides?: {
        run?: {
            command: string;
            args?: string[];
            env?: Record<string, string>;
        };
        http?: {
            url: string;
            headers?: Record<string, string>;
        };
    };
};
type ToolboxConfig = {
    servers: ToolboxServerConfig[];
    generation: {
        outDir: string;
        language: "ts";
    };
    security: {
        allowStdioExec: boolean;
        envAllowlist: string[];
    };
    cli?: {
        interactive?: boolean;
    };
};

type CallArgs = {
    registryId: string;
    toolName: string;
    input: unknown;
};
declare function callMcpTool<T = unknown>(args: CallArgs): Promise<T>;

export { type ToolboxConfig, type ToolboxServerConfig, callMcpTool };
