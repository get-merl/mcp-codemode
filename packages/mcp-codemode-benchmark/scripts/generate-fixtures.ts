#!/usr/bin/env tsx
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSalesData, computeGroundTruth as computeSalesGroundTruth } from '../src/fixtures/database-generator.js';
import { generateIncidentLogs, computeGroundTruth as computeIncidentGroundTruth } from '../src/fixtures/incident-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

function main() {
  console.log('Generating benchmark fixtures...\n');

  // 1. Generate database fixtures
  console.log('1. Generating database fixtures...');

  // Small database
  const dbSmall = generateSalesData(42, 1000);
  const dbSmallPath = join(FIXTURES_DIR, 'database', 'db_sales_30d_small.json');
  mkdirSync(dirname(dbSmallPath), { recursive: true });
  writeFileSync(dbSmallPath, JSON.stringify(dbSmall, null, 2));
  console.log(`   ✓ Created ${dbSmallPath} (1,000 rows)`);

  // Large database
  const dbLarge = generateSalesData(42, 100000);
  const dbLargePath = join(FIXTURES_DIR, 'database', 'db_sales_30d_large.json');
  writeFileSync(dbLargePath, JSON.stringify(dbLarge, null, 2));
  console.log(`   ✓ Created ${dbLargePath} (100,000 rows)`);

  // Ground truth for sales data
  const salesGroundTruth = computeSalesGroundTruth(dbLarge);
  const salesGroundTruthPath = join(FIXTURES_DIR, 'database', 'ground-truth', 'sales_aggregates.json');
  mkdirSync(dirname(salesGroundTruthPath), { recursive: true });
  writeFileSync(salesGroundTruthPath, JSON.stringify(salesGroundTruth, null, 2));
  console.log(`   ✓ Created ${salesGroundTruthPath}`);
  console.log(`     - Total Sales: $${salesGroundTruth.totalSales}`);
  console.log(`     - Avg Order Value: $${salesGroundTruth.avgOrderValue}`);
  console.log(`     - Top Products: ${salesGroundTruth.topProducts.slice(0, 3).join(', ')}`);

  // 2. Generate incident logs
  console.log('\n2. Generating incident log fixtures...');

  const incidentLogs = generateIncidentLogs(123, 250000, ['timeout', 'auth_fail', 'rate_limit']);
  const incidentLogsPath = join(FIXTURES_DIR, 'incident', 'incident_logs_weekly.json');
  mkdirSync(dirname(incidentLogsPath), { recursive: true });
  writeFileSync(incidentLogsPath, JSON.stringify(incidentLogs, null, 2));
  console.log(`   ✓ Created ${incidentLogsPath} (250,000 lines)`);

  // Ground truth for incident logs
  const incidentGroundTruth = computeIncidentGroundTruth(incidentLogs);
  const incidentGroundTruthPath = join(FIXTURES_DIR, 'incident', 'ground-truth', 'labeled_causes.json');
  mkdirSync(dirname(incidentGroundTruthPath), { recursive: true });
  writeFileSync(incidentGroundTruthPath, JSON.stringify(incidentGroundTruth, null, 2));
  console.log(`   ✓ Created ${incidentGroundTruthPath}`);
  console.log(`     - Total Errors: ${incidentGroundTruth.totalErrors}`);
  console.log(`     - Top Causes: ${incidentGroundTruth.topCauses.join(', ')}`);

  // 3. Create placeholder curated fixtures
  console.log('\n3. Creating placeholder curated fixtures...');

  // Meeting transcript placeholder
  const transcriptContent = `# Meeting Transcript - Product Planning Session
Date: December 15, 2024
Duration: 2 hours
Participants: Alice (PM), Bob (Engineering), Carol (Design)

[00:00] Alice: Let's start with our Q1 roadmap. We need to prioritize features.

[00:05] Bob: The authentication refactor is critical. Current system has security issues.
ACTION: Bob to complete security audit by Dec 20th.

[00:15] Carol: I'll need designs reviewed before implementation starts.
ACTION: Carol to share Figma designs by Dec 18th for team review.

[00:30] Alice: Mobile app performance is a customer complaint. We should address it.
ACTION: Alice to analyze performance metrics and share report by Dec 22nd.

[01:00] Bob: Database migration needs to happen in Q1. Can't delay further.
ACTION: Bob to create migration plan and timeline by Jan 5th.

[01:30] Carol: User onboarding flow needs simplification.
ACTION: Carol to prototype new onboarding flow by Jan 10th.

[01:45] Alice: Let's schedule follow-up for early January to review progress.
ACTION: Alice to schedule Q1 kickoff meeting for Jan 8th.

[02:00] Meeting concluded.`;

  const transcriptPath = join(FIXTURES_DIR, 'document', 'meeting_transcript_2h.txt');
  mkdirSync(dirname(transcriptPath), { recursive: true });
  writeFileSync(transcriptPath, transcriptContent);
  console.log(`   ✓ Created ${transcriptPath}`);

  // Ground truth for transcript (action items)
  const transcriptGroundTruth = {
    actions: [
      'Complete security audit by Dec 20th',
      'Share Figma designs by Dec 18th for team review',
      'Analyze performance metrics and share report by Dec 22nd',
      'Create migration plan and timeline by Jan 5th',
      'Prototype new onboarding flow by Jan 10th',
      'Schedule Q1 kickoff meeting for Jan 8th'
    ]
  };
  const transcriptGroundTruthPath = join(FIXTURES_DIR, 'document', 'ground-truth', 'labeled_actions.json');
  mkdirSync(dirname(transcriptGroundTruthPath), { recursive: true });
  writeFileSync(transcriptGroundTruthPath, JSON.stringify(transcriptGroundTruth, null, 2));
  console.log(`   ✓ Created ${transcriptGroundTruthPath} (6 action items)`);

  // PR diff placeholder
  const prDiffContent = `diff --git a/src/auth/middleware.ts b/src/auth/middleware.ts
index 1234567..abcdefg 100644
--- a/src/auth/middleware.ts
+++ b/src/auth/middleware.ts
@@ -10,7 +10,7 @@ export async function authMiddleware(req: Request, res: Response, next: NextFun
   const token = req.headers.authorization?.split(' ')[1];

   if (!token) {
-    return res.status(401).json({ error: 'No token provided' });
+    return res.status(401).json({ error: 'Authentication required' });
   }

   try {
@@ -25,6 +25,11 @@ export async function authMiddleware(req: Request, res: Response, next: NextFun

 diff --git a/src/config/database.ts b/src/config/database.ts
index 7891011..2345678 100644
--- a/src/config/database.ts
+++ b/src/config/database.ts
@@ -5,7 +5,7 @@ export const databaseConfig = {
   host: process.env.DB_HOST || 'localhost',
   port: parseInt(process.env.DB_PORT || '5432'),
   database: process.env.DB_NAME || 'myapp',
-  password: process.env.DB_PASSWORD || 'changeme',
+  password: process.env.DB_PASSWORD,
   ssl: process.env.NODE_ENV === 'production',
 };

diff --git a/src/models/User.ts b/src/models/User.ts
index 3456789..4567890 100644
--- a/src/models/User.ts
+++ b/src/models/User.ts
@@ -15,6 +15,7 @@ export class User {
   async save() {
     await db.query(
       'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
-      [this.email, this.password, this.name]
+      [this.email, this.password, this.name],
+      { returning: true }
     );
   }
 }`;

  const prDiffPath = join(FIXTURES_DIR, 'code', 'pr_diff_risky.patch');
  mkdirSync(dirname(prDiffPath), { recursive: true });
  writeFileSync(prDiffPath, prDiffContent);
  console.log(`   ✓ Created ${prDiffPath}`);

  // Ground truth for PR risks
  const prRisksGroundTruth = {
    risks: [
      'database configuration',
      'authentication',
      'data migration'
    ],
    testGaps: [
      'No tests for auth middleware changes',
      'Missing database migration tests'
    ]
  };
  const prRisksGroundTruthPath = join(FIXTURES_DIR, 'code', 'ground-truth', 'labeled_risks.json');
  mkdirSync(dirname(prRisksGroundTruthPath), { recursive: true });
  writeFileSync(prRisksGroundTruthPath, JSON.stringify(prRisksGroundTruth, null, 2));
  console.log(`   ✓ Created ${prRisksGroundTruthPath}`);

  console.log('\n✅ All fixtures generated successfully!');
  console.log('\nFixture Summary:');
  console.log('  - Database: 1K rows (small) + 100K rows (large)');
  console.log('  - Incident Logs: 250K log entries');
  console.log('  - Meeting Transcript: ~2 hour transcript with 6 action items');
  console.log('  - PR Diff: Risky changes with security implications');
  console.log('\nGround truth files created for all fixtures.');
}

main();
