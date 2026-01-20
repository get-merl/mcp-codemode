interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  error_type?: string;
}

interface GroundTruth {
  topCauses: string[];
  totalErrors: number;
  errorCounts: Record<string, number>;
}

// Simple seeded random number generator (same as database-generator)
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)]!;
  }

  date(start: Date, end: Date): string {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + this.next() * (endTime - startTime);
    return new Date(randomTime).toISOString();
  }
}

export function generateIncidentLogs(seed: number, lineCount: number, errorPatterns: string[]): LogEntry[] {
  const rng = new SeededRandom(seed);

  const services = ['api-gateway', 'auth-service', 'user-service', 'payment-service', 'worker-01'];
  const levels = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];

  // Error message templates
  const errorTemplates: Record<string, string[]> = {
    timeout: [
      'Request timeout after 30s',
      'Connection timeout to database',
      'Upstream service timeout',
      'HTTP request timeout',
    ],
    auth_fail: [
      'Authentication failed: invalid token',
      'Authorization error: insufficient permissions',
      'JWT token expired',
      'API key validation failed',
    ],
    rate_limit: [
      'Rate limit exceeded: 1000 req/min',
      'Quota exceeded for API endpoint',
      'Too many requests from client',
      'Throttling limit reached',
    ],
  };

  const logs: LogEntry[] = [];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const endDate = new Date();

  for (let i = 0; i < lineCount; i++) {
    const level = rng.choice(levels);
    const service = rng.choice(services);

    // 20% chance of error
    if (rng.next() < 0.2 && level === 'ERROR') {
      const errorType = rng.choice(errorPatterns);
      const message = rng.choice(errorTemplates[errorType]!);

      logs.push({
        timestamp: rng.date(startDate, endDate),
        level,
        service,
        message,
        error_type: errorType,
      });
    } else {
      // Normal log
      logs.push({
        timestamp: rng.date(startDate, endDate),
        level: rng.choice(['INFO', 'WARN']),
        service,
        message: `${service} processed request successfully`,
      });
    }
  }

  // Sort by timestamp
  logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return logs;
}

export function computeGroundTruth(logs: LogEntry[]): GroundTruth {
  const errorCounts: Record<string, number> = {};

  for (const log of logs) {
    if (log.error_type) {
      errorCounts[log.error_type] = (errorCounts[log.error_type] || 0) + 1;
    }
  }

  const totalErrors = Object.values(errorCounts).reduce((sum, count) => sum + count, 0);

  const topCauses = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cause]) => cause);

  return {
    topCauses,
    totalErrors,
    errorCounts,
  };
}
