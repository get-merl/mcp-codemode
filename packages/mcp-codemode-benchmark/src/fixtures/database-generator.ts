interface SalesRow {
  id: number;
  date: string;
  product: string;
  amount: number;
  customer_id: number;
}

interface GroundTruth {
  totalSales: number;
  avgOrderValue: number;
  topProducts: string[];
}

// Simple seeded random number generator
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

  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)]!;
  }

  date(start: Date, end: Date): string {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + this.next() * (endTime - startTime);
    return new Date(randomTime).toISOString().split('T')[0]!;
  }
}

export function generateSalesData(seed: number, rowCount: number): SalesRow[] {
  const rng = new SeededRandom(seed);

  const products = [
    'Laptop Pro',
    'Wireless Mouse',
    'Mechanical Keyboard',
    'USB-C Hub',
    'Monitor 27"',
    'Desk Chair',
    'Standing Desk',
    'Webcam HD',
    'Headphones',
    'Phone Stand',
  ];

  const rows: SalesRow[] = [];
  const startDate = new Date('2024-12-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < rowCount; i++) {
    rows.push({
      id: i + 1,
      date: rng.date(startDate, endDate),
      product: rng.choice(products),
      amount: parseFloat(rng.float(10, 1000).toFixed(2)),
      customer_id: rng.int(1, 10000),
    });
  }

  return rows;
}

export function computeGroundTruth(rows: SalesRow[]): GroundTruth {
  const totalSales = rows.reduce((sum, r) => sum + r.amount, 0);
  const avgOrderValue = totalSales / rows.length;

  const productCounts: Record<string, number> = {};
  for (const row of rows) {
    productCounts[row.product] = (productCounts[row.product] || 0) + 1;
  }

  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return {
    totalSales: parseFloat(totalSales.toFixed(2)),
    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    topProducts,
  };
}
