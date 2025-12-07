# DarkWave Release Manager Specification

> **For AI Agents**: This is the authoritative specification for implementing release management across all DarkWave products. If you're asked to implement "release manager", follow this document.

## Quick Start

```typescript
// Any DarkWave app can register releases with ORBIT Hub
import { DarkWaveReleaseClient } from './releaseClient';

const releaseClient = new DarkWaveReleaseClient();
await releaseClient.registerRelease({
  version: '1.2.0',
  changelog: 'Added new feature X',
  releaseType: 'minor',
});
```

---

## Overview

The DarkWave Release Manager is a cross-product release coordination system hosted by ORBIT Staffing OS. All DarkWave products (ORBIT, Orby, Lot Ops Pro, Pulse, Brew & Board, GarageBot) register their releases to a central hub for:

- **Version tracking** across the entire ecosystem
- **Changelog aggregation** for unified release notes
- **Solana blockchain anchoring** for immutable version verification
- **Cross-product dependency management**
- **Rollback coordination**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORBIT STAFFING OS (Hub)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Release Manager API                         │   │
│  │  POST /api/release-manager/register                     │   │
│  │  GET  /api/release-manager/releases                     │   │
│  │  GET  /api/release-manager/releases/:appSlug            │   │
│  │  POST /api/release-manager/anchor                       │   │
│  │  GET  /api/release-manager/changelog                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        ▲           ▲           ▲           ▲           ▲
        │           │           │           │           │
   ┌────┴───┐  ┌────┴───┐  ┌────┴───┐  ┌────┴───┐  ┌────┴───┐
   │ Orby   │  │Lot Ops │  │ Pulse  │  │Brew &  │  │Garage  │
   │        │  │  Pro   │  │        │  │ Board  │  │  Bot   │
   └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
```

---

## API Endpoints

All endpoints require ecosystem authentication headers:
```
X-Api-Key: <your_api_key>
X-Api-Secret: <your_api_secret>
```

### 1. Register Release

**POST** `/api/release-manager/register`

Registers a new release for your app in the ecosystem.

```json
{
  "version": "1.2.0",
  "releaseType": "minor",
  "changelog": "## What's New\n- Added feature X\n- Fixed bug Y",
  "releaseNotes": "Optional longer description",
  "breakingChanges": false,
  "dependencies": {
    "orby": ">=1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "releaseId": "rel_abc123",
  "version": "1.2.0",
  "appName": "Lot Ops Pro",
  "registeredAt": "2025-12-07T12:00:00Z",
  "solanaAnchor": {
    "hash": "abc123...",
    "transactionSignature": "5xyz...",
    "explorerUrl": "https://solscan.io/tx/..."
  }
}
```

### 2. Get All Releases

**GET** `/api/release-manager/releases`

Returns releases across all DarkWave products.

Query params:
- `limit` - Number of releases (default: 50)
- `since` - ISO date to filter from
- `app` - Filter by app slug

### 3. Get App Releases

**GET** `/api/release-manager/releases/:appSlug`

Returns releases for a specific app.

### 4. Anchor to Blockchain

**POST** `/api/release-manager/anchor`

Creates a Solana blockchain anchor for a release hash.

```json
{
  "releaseId": "rel_abc123",
  "hash": "sha256_of_release_contents"
}
```

### 5. Get Ecosystem Changelog

**GET** `/api/release-manager/changelog`

Returns aggregated changelog across all products.

---

## Data Model

### release_packages Table

```sql
CREATE TABLE release_packages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR REFERENCES ecosystem_connected_apps(id),
  app_slug VARCHAR NOT NULL,
  version VARCHAR NOT NULL,
  release_type VARCHAR NOT NULL, -- 'major' | 'minor' | 'patch'
  changelog TEXT,
  release_notes TEXT,
  breaking_changes BOOLEAN DEFAULT FALSE,
  dependencies JSONB,
  release_hash VARCHAR,
  solana_tx VARCHAR,
  solana_explorer_url VARCHAR,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Client Implementation

Copy this class into your app to integrate with the Release Manager:

```typescript
// releaseClient.ts - Copy this to your DarkWave app

export interface ReleaseData {
  version: string;
  releaseType: 'major' | 'minor' | 'patch';
  changelog: string;
  releaseNotes?: string;
  breakingChanges?: boolean;
  dependencies?: Record<string, string>;
}

export interface ReleaseResult {
  success: boolean;
  releaseId: string;
  version: string;
  appName: string;
  registeredAt: string;
  solanaAnchor?: {
    hash: string;
    transactionSignature: string;
    explorerUrl: string;
  };
}

export class DarkWaveReleaseClient {
  private apiKey: string;
  private apiSecret: string;
  private hubUrl: string;

  constructor() {
    this.apiKey = process.env.ORBIT_API_KEY!;
    this.apiSecret = process.env.ORBIT_API_SECRET!;
    this.hubUrl = process.env.ORBIT_HUB_URL || 'https://orbitstaffing.io/api';
  }

  private async request(method: string, path: string, data?: any) {
    const response = await fetch(this.hubUrl + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        'X-Api-Secret': this.apiSecret,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async registerRelease(data: ReleaseData): Promise<ReleaseResult> {
    return this.request('POST', '/release-manager/register', data);
  }

  async getMyReleases(): Promise<any[]> {
    return this.request('GET', '/release-manager/releases/mine');
  }

  async getEcosystemReleases(limit = 50): Promise<any[]> {
    return this.request('GET', `/release-manager/releases?limit=${limit}`);
  }

  async getChangelog(): Promise<string> {
    const result = await this.request('GET', '/release-manager/changelog');
    return result.changelog;
  }
}
```

---

## Integration Steps

### For New DarkWave Apps

1. **Register with Ecosystem Hub** (one-time):
   ```bash
   curl -X POST "https://orbitstaffing.io/api/admin/ecosystem/register-app" \
     -H "Content-Type: application/json" \
     -d '{"appName": "Your App", "appSlug": "yourapp"}'
   ```
   Save the returned `apiKey` and `apiSecret`.

2. **Add secrets to your app**:
   ```
   ORBIT_API_KEY=dw_app_xxx
   ORBIT_API_SECRET=dw_secret_xxx
   ORBIT_HUB_URL=https://orbitstaffing.io/api
   ```

3. **Copy the ReleaseClient class** from above into your codebase.

4. **Register releases on publish**:
   ```typescript
   // In your publish/deploy script:
   const client = new DarkWaveReleaseClient();
   await client.registerRelease({
     version: '1.0.0',
     releaseType: 'minor',
     changelog: 'Initial release',
   });
   ```

---

## Version Numbering Convention

All DarkWave apps follow semantic versioning:

- **MAJOR** (X.0.0): Breaking changes, major rewrites
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, minor improvements

---

## Solana Blockchain Anchoring

Every release registered through the hub gets automatic Solana blockchain anchoring:

1. Release payload is serialized to JSON and hashed (SHA-256)
2. Hash is stored on Solana mainnet via Helius RPC
3. Transaction signature returned in `solanaAnchor` response field
4. Anyone can verify release authenticity via Solscan

**Graceful Degradation (By Design):**
- If Solana anchoring fails (network issues, rate limits), the release is still registered
- The `solanaAnchor` field will be `null` when anchoring fails
- The `releaseHash` (content hash) is always computed and stored
- This ensures releases are never blocked by blockchain availability
- Unanchored releases can be manually anchored later via admin tools

**Response includes:**
```json
{
  "success": true,
  "releaseHash": "abc123...",
  "solanaAnchor": {
    "hash": "abc123...",
    "transactionSignature": "5xyz...",
    "explorerUrl": "https://solscan.io/tx/..."
  }
}
```

**Timestamps:**
- `registeredAt` - ISO 8601 UTC timestamp
- `registeredAtCST` - Central Standard Time in ISO format (YYYY-MM-DDTHH:mm:ss-06:00)

All ecosystem operations use CST (America/Chicago) as the primary timezone.

---

## Cross-Product Coordination

When registering a release with dependencies:

```typescript
await client.registerRelease({
  version: '2.0.0',
  releaseType: 'major',
  changelog: 'Requires Orby 1.5+',
  dependencies: {
    'orby': '>=1.5.0',
    'orbit': '>=2.7.0'
  }
});
```

The hub tracks these dependencies and can alert when incompatible versions are detected.

---

## File Locations in ORBIT

| File | Purpose |
|------|---------|
| `RELEASE_MANAGER_SPEC.md` | This specification (root level) |
| `server/versionManager.ts` | ORBIT's own version management |
| `server/releaseManager.ts` | Cross-product release API logic |
| `server/routes.ts` | API endpoint definitions |
| `shared/schema.ts` | Database table definitions |

---

## Contact

- **Hub Owner**: ORBIT Staffing OS
- **Hub URL**: https://orbitstaffing.io
- **Ecosystem API**: https://orbitstaffing.io/api/ecosystem/*
- **Release API**: https://orbitstaffing.io/api/release-manager/*

---

*Last Updated: December 7, 2025*
*Specification Version: 1.0.0*
