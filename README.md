# Egypt Services Platform

An automated data aggregation platform for Egypt's public services — banks, pharmacies, hospitals, government offices, transport, and emergency contacts.

## Architecture

- **Monorepo** with Nx workspace
- **6 domain collectors** with automated data ingestion
- **NestJS REST APIs** for every domain
- **Next.js 15** web frontend + admin panel
- **PostgreSQL** with PostGIS for geospatial queries
- **SCD Type 2** version history for full audit trail
- **Priority source chain** — auto-fallback when primary source is down
- **Crawlee** for web scraping when no API exists

## Project Structure

```
packages/
  shared-types/     # TypeScript interfaces
  shared-schemas/   # Zod validation schemas
  shared-utils/     # Phone normalizer, hash, coordinate helpers
services/
  collector-framework/  # Base collectors, pipeline, scheduler
  banks-service/        # NestJS REST API
  scheduler-service/    # Central scheduler
apps/
  web/                  # Next.js public website
  admin/                # Next.js admin panel
```

## Quick Start

```bash
npm install
npm run dev
```

## Domains

- Banks & ATMs (38 banks, 4000+ branches)
- Pharmacies (4200+ pharmacies)
- Hospitals (850+ hospitals, clinics)
- Government Offices (120+ offices)
- Transport Stations (200+ metro/train stations)
- Emergency Contacts (45+ national+local contacts)
