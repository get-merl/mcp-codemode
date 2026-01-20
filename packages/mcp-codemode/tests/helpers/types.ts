export type ExecResult = {
  exitCode: number;
  signal: string | null;
  stdout: string;
  stderr: string;
};

export type TestConfig = {
  outDir: string;
  configPath: string;
};
