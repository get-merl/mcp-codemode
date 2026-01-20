import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { ProviderConfig, TokenUsage } from '../types.js';

export interface ApiCallOptions {
  provider: ProviderConfig;
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}

export interface ApiCallResult {
  response: unknown;
  tokens: TokenUsage;
}

export async function callProvider(
  options: ApiCallOptions,
): Promise<ApiCallResult> {
  const apiKey = process.env[options.provider.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `Missing API key: ${options.provider.apiKeyEnv}\n` +
      `Please set the ${options.provider.apiKeyEnv} environment variable.`
    );
  }

  // Create provider instance
  let modelInstance;
  if (options.provider.kind === 'openai') {
    const openai = createOpenAI({
      apiKey,
      baseURL: options.provider.baseUrl,
    });
    modelInstance = openai(options.provider.model);
  } else if (options.provider.kind === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey,
      baseURL: options.provider.baseUrl,
    });
    modelInstance = anthropic(options.provider.model);
  } else {
    throw new Error(`Unsupported provider: ${options.provider.kind}`);
  }

  // Convert tools to AI SDK format
  const aiSdkTools = options.tools
    ? Object.fromEntries(
        options.tools.map((tool) => [
          tool.function.name,
          {
            description: tool.function.description,
            parameters: tool.function.parameters,
          },
        ])
      )
    : undefined;

  // Call generateText
  const result = await generateText({
    model: modelInstance,
    messages: options.messages,
    tools: aiSdkTools,
    temperature: 0,
    maxTokens: options.provider.kind === 'anthropic' ? 4096 : undefined,
  });

  // Extract token usage
  const tokens: TokenUsage = {
    input: result.usage.promptTokens,
    output: result.usage.completionTokens,
    total: result.usage.totalTokens,
  };

  // Format response for backward compatibility
  let response: unknown;
  if (result.toolCalls && result.toolCalls.length > 0) {
    response = {
      tool_calls: result.toolCalls.map((call) => ({
        function: {
          name: call.toolName,
          arguments: JSON.stringify(call.args),
        },
      })),
      content: result.text || '',
    };
  } else {
    response = {
      content: result.text,
    };
  }

  return { response, tokens };
}
