import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
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

export async function callOpenAI(
  options: ApiCallOptions,
): Promise<ApiCallResult> {
  const apiKey = process.env[options.provider.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `Missing API key: ${options.provider.apiKeyEnv}\n` +
      `Please set the ${options.provider.apiKeyEnv} environment variable before running benchmarks.`
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: options.provider.baseUrl,
  });

  const response = await client.chat.completions.create({
    model: options.provider.model,
    messages: options.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tools: options.tools as OpenAI.Chat.Completions.ChatCompletionTool[] | undefined,
    tool_choice: options.tools ? 'auto' : undefined,
    temperature: 0,
  });

  const choice = response.choices[0];
  if (!choice) {
    throw new Error('No response from OpenAI');
  }

  const usage = response.usage;
  const tokens: TokenUsage = {
    input: usage?.prompt_tokens ?? 0,
    output: usage?.completion_tokens ?? 0,
    total: usage?.total_tokens ?? 0,
  };

  return {
    response: choice.message,
    tokens,
  };
}

export async function callAnthropic(
  options: ApiCallOptions,
): Promise<ApiCallResult> {
  const apiKey = process.env[options.provider.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `Missing API key: ${options.provider.apiKeyEnv}\n` +
      `Please set the ${options.provider.apiKeyEnv} environment variable before running benchmarks.`
    );
  }

  const client = new Anthropic({
    apiKey,
    baseURL: options.provider.baseUrl,
  });

  // Convert tools format for Anthropic
  const tools = options.tools?.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  }));

  const response = await client.messages.create({
    model: options.provider.model,
    max_tokens: 4096,
    messages: options.messages.map((msg) => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      content: msg.content,
    })) as Anthropic.MessageParam[],
    tools: tools as Anthropic.Tool[] | undefined,
  });

  const tokens: TokenUsage = {
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
    total: response.usage.input_tokens + response.usage.output_tokens,
  };

  return {
    response,
    tokens,
  };
}

export async function callProvider(
  options: ApiCallOptions,
): Promise<ApiCallResult> {
  if (options.provider.kind === 'openai') {
    return callOpenAI(options);
  } else if (options.provider.kind === 'anthropic') {
    return callAnthropic(options);
  } else {
    throw new Error(`Unsupported provider: ${options.provider.kind}`);
  }
}
