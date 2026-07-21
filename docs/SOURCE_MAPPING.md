# Egypt Services Platform — Source Mapping Document

> **Version:** 1.0  
> **Date:** 2026-07-18  
> **Status:** Approved — All collectors implemented  
> **Author:** Platform Engineering Team  

---

## Table of Contents

1. [Overview](#1-overview)
2. [General Architecture](#2-general-architecture)
3. [Module: Banks](#3-module-banks)
4. [Module: Pharmacies](#4-module-pharmacies)
5. [Module: Hospitals](#5-module-hospitals)
6. [Module: Government Offices](#6-module-government-offices)
7. [Module: Transport](#7-module-transport)
8. [Module: Emergency Services](#8-module-emergency-services)
9. [Module: Telecom Companies](#9-module-telecom-companies)
10. [Module: Supermarkets](#10-module-supermarkets)
11. [Module: Geographic Reference Data](#11-module-geographic-reference-data)
12. [Module: Reviews](#12-module-reviews)
13. [Priority Matrix](#13-priority-matrix)
14. [Synchronization Strategy](#14-synchronization-strategy)
15. [Cross-Cutting Concerns](#15-cross-cutting-concerns)

---

## 1. Overview

### 1.1 Purpose

This document provides a complete mapping of every data source for every module in the Egypt Services Platform. It identifies official data sources, availability of APIs, scraping requirements, update cadences, expected data fields, and recommended synchronization strategies. This mapping **must** be reviewed and approved before any data collector is implemented.

### 1.2 Scope

Eight core service domains are covered:

| # | Domain | Primary Models | Collector Status |
|---|--------|---------------|------------------|
| 1 | Banks | Bank, BankBranch, AtmLocation, BankWorkingHours, BankBranchService | Implemented (scrape + fallback) |
| 2 | Pharmacies | Pharmacy, PharmacyWorkingHours | Implemented (scrape + fallback) |
| 3 | Hospitals | Hospital, HospitalDepartment, Doctor | Implemented (scrape + fallback) |
| 4 | Government | GovernmentOffice, GovernmentService | Implemented (scrape + fallback) |
| 5 | Transport | TransportStation, TransportRoute | Implemented (scrape + fallback) |
| 6 | Emergency | EmergencyContact, EmergencyAlert | Implemented (scrape + fallback) |
| 7 | Telecom | TelecomCompany, TelecomBranch | Implemented (programmatic branches) |
| 8 | Supermarkets | Supermarket | Implemented (scrape + fallback) |

Supporting modules: Governorate, City, Area, Review, Notification, User.

### 1.3 Collector Framework Capabilities

The platform's collector framework (at `services/collector-framework/`) supports:

- **API collectors** (`base/api-collector.ts`) — for REST/SOAP endpoints
- **Web scraper collectors** (`base/scraper-collector.ts`) — with Cheerio/puppeteer
- **Web crawler collectors** (`base/web-crawler.ts`) — multi-page traversal
- **File importer collectors** (`base/file-importer.ts`) — CSV/JSON/XML ingestion
- **Pipeline**: Validator → Normalizer → Deduplicator → Differ → UpsertExecutor
- **Stores**: Current-store, Version-store, Audit-store, Import-log-store
- **Scheduler**: Cron-based with retry queue, exponential backoff, and alerting

---

## 2. General Architecture

### 2.1 Data Flow

```
┌────────────┐    ┌──────────────┐    ┌──────────┐    ┌───────────┐    ┌──────────────┐
│  External  │───▶│   Collector   │───▶│ Pipeline │───▶│ Database  │───▶│   Search     │
│   Source   │    │  (Adapter)    │    │  (5 stages)   │ (PostgreSQL│   │ (Elasticsearch)
└────────────┘    └──────────────┘    └──────────┘    └───────────┘    └──────────────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │   APIs   │
                                                  │(NestJS)  │
                                                  └──────────┘
```

### 2.2 Source Priority Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | **Official Government API** | Direct API from a government ministry or authority |
| 2 | **Official Company API** | Direct API from a private-sector entity |
| 3 | **Official Website** | Structured data scraped from an official .gov.eg or company site |
| 4 | **Open Data Portal** | Data from open data initiatives (e.g., Egypt Open Data) |
| 5 | **Structured Data** | Pre-processed data from trusted syndicates or professional bodies |
| 6 | **Trusted Public** | Community-verified data through the platform itself |

**Conflict resolution:** When multiple sources provide data for the same entity, the source with the **lowest priority number** wins. Partial merges are permitted (e.g., address from priority 1, phone from priority 2).

### 2.3 Source Type Definitions

| Type | Required Auth | Suitable For |
|------|--------------|--------------|
| `api` | API key / OAuth | Structured, paginated data |
| `website` | None | HTML scraping with cheerio |
| `open_data` | None | CKAN, Socrata, or similar portals |
| `structured_file` | None | Periodic CSV/JSON/XML dumps |
| `trusted_public` | None | Crowdsourced via platform |

---

## 3. Module: Banks

### 3.1 Data Model

```
Bank
├── id (UUID)
├── nameAr / nameEn
├── code (unique, e.g., "CIBE", "NBE")
├── logoUrl
├── website / phone / email
├── isActive
├── sourceName / sourceUrl / lastSyncAt / dataVersion / validationStatus
│
├── BankBranch (1..*)
│   ├── nameAr / nameEn / branchCode
│   ├── governorateId / cityId / areaId / street
│   ├── latitude / longitude
│   ├── phone / hasAtm
│   ├── isActive
│   ├── sourceMetadata
│   │
│   ├── BankWorkingHours (0..7)
│   │   └── dayOfWeek / opensAt / closesAt / isClosed
│   │
│   └── BankBranchService (0..*)
│       └── serviceNameAr / serviceNameEn / description / isAvailable
│
└── AtmLocation (0..*)
    ├── nameAr / nameEn / type
    ├── governorateId / cityId / areaId / street
    ├── latitude / longitude
    ├── is24h / hasDeposit
    └── sourceMetadata
```

### 3.2 Source Mapping

#### Primary Sources

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Central Bank of Egypt** | cbe.org.eg | website | 2 | none | Weekly | Bank registry (names, codes) |
| **Egyptian Banking Institute** | ebi.gov.eg | website | 3 | none | Weekly | Bank directory, training info |
| **National Bank of Egypt** | nbe.com.eg | website | 3 | none | Weekly | Branch list with coordinates |
| **Banque Misr** | banquemisr.com | website | 3 | none | Weekly | Branch locator data |
| **Commercial International Bank** | cibeg.com | website | 3 | none | Weekly | Branch/ATM locations |

#### Secondary / Supplemental Sources

| Source | URL | Type | Priority | Auth | Frequency | Purpose |
|--------|-----|------|----------|------|-----------|---------|
| Egypt Open Data Portal | data.gov.eg | open_data | 4 | none | Monthly | Potential bulk CSV dumps |

### 3.3 API Assessment

| Source | Has Official API? | API Type | Documentation | Key Endpoints |
|--------|-------------------|----------|---------------|---------------|
| CBE | **No** | — | — | — |
| EBI | **No** | — | — | — |
| NBE | Branch locator page | — | — | — |
| Banque Misr | Branch locator page | — | — | — |
| CIB | Branch/ATM locator | — | — | — |

> **Assessment:** No official API exists for any banking data source. All bank data must be obtained through **web scraping** of bank branch locator pages and/or the CBE registry.

### 3.4 Expected Data Fields per Source

| Field | CBE | Bank Sites | Priority |
|-------|-----|------------|----------|
| nameAr | ✓ | ✓ | CBE > Bank Site |
| nameEn | ✓ | ✓ | CBE > Bank Site |
| code | ✓ | ✗ | CBE (unique) |
| logoUrl | ✗ | ✓ | Bank Site |
| website | ✓ | ✓ | CBE > Bank Site |
| phone | ✓ | ✓ | Bank Site > CBE |
| branch.nameAr | ✗ | ✓ | Bank Site |
| branch.latitude | ✗ | ✓ | Bank Site |
| branch.longitude | ✗ | ✓ | Bank Site |
| branch.street | ✗ | ✓ | Bank Site |
| branch.phone | ✗ | ✓ | Bank Site |
| branch.hasAtm | ✗ | ✓ | Bank Site |
| branch.workingHours | ✗ | ✓ (some) | Bank Site |
| atm.location | ✗ | ✓ | Bank Site |

### 3.5 Recommended Sync Strategy

```
Strategy: Scrape + Merge
1. Crawl the CBE website for the master list of all licensed banks (weekly).
2. For each bank, crawl its branch locator page for branch/ATM data (weekly).
3. Use the deduplicator on (bank_code, branch_code) tuple.
4. Merge ATM data from bank sites onto branch records (hasAtm flag).
5. Validate coordinates via reverse geocoding against OSM.
6. Priority: CBE for bank metadata, individual bank sites for branch geodata.
```

---

## 4. Module: Pharmacies

### 4.1 Data Model

```
Pharmacy
├── id (UUID)
├── nameAr / nameEn
├── licenseNumber (unique)
├── governorateId / cityId / areaId / street
├── latitude / longitude
├── phone / whatsapp
├── is24h / hasDelivery
├── isActive
├── sourceMetadata
│
└── PharmacyWorkingHours (0..7)
    ├── dayOfWeek / opensAt / closesAt / isClosed / is24h
```

### 4.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Ministry of Health** | mohp.gov.eg | website | 1 | none | Monthly | Licensed pharmacy registry |
| **Egyptian Drug Authority (EDA)** | eda.mohp.gov.eg | website | 2 | none | Monthly | Pharmacy licensing data |
| **Pharmacists Syndicate** | eps.com.eg | website | 3 | none | Monthly | Member directory |
| **19011 (El Ezaby)** | 19011.com | website | 2 | none | Weekly | Branch locations, 24h status, delivery |
| **Seif Pharmacy** | seifpharmacy.com | website | 3 | none | Weekly | Branch locations |

### 4.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| MoHP | **No** | — | — |
| EDA | **No** | — | — |
| EPS | **No** | — | — |
| 19011 | **No** (branch finder only) | — | — |

> **Assessment:** No official APIs. Primary scraping target: MoHP pharmacy registry for the master license list. Secondary: individual chain pharmacy sites for geolocation and service flags.

### 4.4 Expected Data Fields per Source

| Field | MoHP | EDA | Chain Sites | Priority |
|-------|------|-----|-------------|----------|
| nameAr | ✓ | ✓ | ✓ | MoHP > Chain |
| nameEn | ✗ | ✗ | ✓ | Chain |
| licenseNumber | ✓ | ✓ | ✗ | MoHP > EDA |
| governorate | ✓ | ✓ | ✓ | MoHP > Chain |
| street | ✓ | ✓ | ✓ | MoHP > Chain |
| latitude | ✗ | ✗ | ✓ | Chain |
| longitude | ✗ | ✗ | ✓ | Chain |
| phone | ✓ | ✓ | ✓ | MoHP > Chain |
| is24h | ✗ | ✗ | ✓ | Chain |
| hasDelivery | ✗ | ✗ | ✓ | Chain |
| workingHours | ✗ | ✗ | ✓ (some) | Chain |

### 4.5 Recommended Sync Strategy

```
Strategy: License Registry + Chain Scraping
1. Scrape MoHP/EDA for master list of all licensed pharmacies (monthly).
2. For known chain pharmacies, scrape individual branch finders (weekly).
3. Match chain branches to license records via (name + governorate).
4. Merge geolocation from chain sites onto license records.
5. Set is24h and hasDelivery from chain data (chain is authoritative).
6. Flag unmatched license records (need community contribution for geodata).
```

---

## 5. Module: Hospitals

### 5.1 Data Model

```
Hospital
├── id (UUID)
├── nameAr / nameEn
├── type (hospital | clinic | medical_center)
├── ownership (public | private | university)
├── governorateId / cityId / areaId / street
├── latitude / longitude
├── phone / email / website
├── hasEmergency / bedCount
├── isActive
├── sourceMetadata
│
├── HospitalDepartment (0..*)
│   └── nameAr / nameEn / description / floor / phone
│
└── Doctor (0..*)
    ├── nameAr / nameEn
    ├── specialtyAr / specialtyEn / title
    ├── departmentId
    ├── phone / email / consultationFee
    └── isActive
```

### 5.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Ministry of Health — Hospitals** | mohp.gov.eg/hospitals | website | 1 | none | Monthly | Hospital registry, public/private |
| **GAH (General Authority for Healthcare Accreditation)** | gahealthcare.eg | website | 2 | none | Monthly | Accredited facilities, bed counts |
| **Dar El Fouad Hospital** | darelfouad.com | website | 3 | none | Monthly | Departments, doctors |
| **Cleopatra Hospital** | cleopatra-hospital.com | website | 3 | none | Monthly | Departments, doctors |

### 5.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| MoHP | **No** — listings are HTML pages | — | — |
| GAH | **No** | — | — |
| Private hospitals | **No** — directory pages | — | — |

> **Assessment:** No official API exists for hospital data. MoHP website is the primary source for the master hospital registry. Private hospital sites are supplementary for department/doctor data.

### 5.4 Expected Data Fields per Source

| Field | MoHP | GAH | Hospital Sites | Priority |
|-------|------|-----|----------------|----------|
| nameAr | ✓ | ✓ | ✓ | MoHP > GAH > Site |
| nameEn | ✗ | ✗ | ✓ | Site |
| type | ✓ (basic) | ✗ | ✓ | MoHP + Site |
| ownership | ✓ | ✗ | ✓ | MoHP |
| governorate | ✓ | ✓ | ✓ | MoHP |
| street | ✓ | ✗ | ✓ | MoHP > Site |
| latitude | ✗ | ✗ | ✓ | Site |
| longitude | ✗ | ✗ | ✓ | Site |
| phone | ✓ | ✓ | ✓ | MoHP > Site |
| hasEmergency | ✓ | ✗ | ✓ | MoHP > Site |
| bedCount | ✓ | ✓ | ✗ | GAH > MoHP |
| departments | ✗ | ✗ | ✓ | Site |
| doctors | ✗ | ✗ | ✓ | Site |

### 5.5 Recommended Sync Strategy

```
Strategy: Registry + Individual Hospital Scraping
1. Scrape MoHP registry for the master list of all hospitals (monthly).
2. Scrape GAHA for bed count and accreditation data (monthly).
3. For major hospitals, scrape individual websites for departments/doctors (monthly).
4. Match by hospital name (fuzzy matching with governorate as secondary key).
5. Merge geolocation from individual site scraping; geocode addresses if missing.
```

---

## 6. Module: Government Offices

### 6.1 Data Model

```
GovernmentOffice
├── id (UUID)
├── type (civil_id | passport | traffic | post_office | license | other)
├── nameAr / nameEn
├── officeCode
├── governorateId / cityId / areaId / street
├── latitude / longitude
├── phone / email
├── isActive
├── sourceMetadata
│
└── GovernmentService (0..*)
    ├── serviceNameAr / serviceNameEn
    ├── description / fee / processingTime / requiredDocs
    ├── isOnline / isActive
```

### 6.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Egyptian Government Services Portal** | gov.eg | website | 1 | none | Weekly | Office directory, services, online availability |
| **Cabinet Information Center (IDSC)** | idsc.gov.eg | website | 2 | none | Monthly | Government service inventory |
| **Egypt Post** | posta.eg | website | 3 | none | Monthly | Post office locations |
| **Traffic Department** | interior.gov.eg | website | 3 | none | Monthly | Traffic office locations |

### 6.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| gov.eg | **No** (portal content is HTML) | — | — |
| IDSC | **No** | — | — |
| Egypt Post | Branch finder page | — | — |
| Traffic | Office directory page | — | — |

> **Assessment:** No official API. The gov.eg portal is the most comprehensive source for government office information. The IDSC provides additional detail on specific services.

### 6.4 Expected Data Fields per Source

| Field | gov.eg | IDSC | Individual | Priority |
|-------|--------|------|------------|----------|
| type | ✓ | ✓ | ✓ | gov.eg + IDSC |
| nameAr | ✓ | ✓ | ✓ | gov.eg |
| nameEn | ✓ | ✓ | ✗ | gov.eg > IDSC |
| officeCode | ✓ | ✓ | ✗ | IDSC > gov.eg |
| governorate | ✓ | ✓ | ✓ | gov.eg |
| street | ✓ | ✓ | ✓ | gov.eg |
| latitude | ✗ | ✗ | ✓ (some) | Individual |
| longitude | ✗ | ✗ | ✓ (some) | Individual |
| phone | ✓ | ✓ | ✓ | gov.eg |
| services | ✓ | ✓ | ✗ | gov.eg + IDSC |
| isOnline | ✓ | ✗ | ✗ | gov.eg |
| fee | ✗ | ✓ | ✗ | IDSC |
| processingTime | ✗ | ✓ | ✗ | IDSC |

### 6.5 Recommended Sync Strategy

```
Strategy: gov.eg Portal Scraping + IDSC Enrichment
1. Crawl the gov.eg portal for the complete government office directory (weekly).
2. Scrape IDSC for detailed service info (fees, processing time, documents) (monthly).
3. For Egypt Post offices, scrape posta.eg (monthly).
4. Geocode addresses using OSM Nominatim (since coordinates are rarely available).
5. Merge service data from IDSC onto office records from gov.eg.
6. Key dedup key: (type, governorate, officeCode).
```

---

## 7. Module: Transport

### 7.1 Data Model

```
TransportStation
├── id (UUID)
├── type (metro | train | bus)
├── nameAr / nameEn
├── code / lineName
├── governorateId / cityId
├── latitude / longitude
├── hasParking / hasAccessibility
├── isActive
├── sourceMetadata
│
└── TransportRoute (0..*)
    ├── type (metro | train | bus)
    ├── nameAr / nameEn
    ├── fromStationId / toStationId
    ├── distanceKm / durationMin / fare
    └── isActive
```

### 7.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Ministry of Transport** | mot.gov.eg | website | 1 | none | Monthly | Transport authority links, general info |
| **National Authority for Tunnels (NAT)** | nat.gov.eg | website | 2 | none | Monthly | Metro stations, lines |
| **Egyptian National Railways (ENR)** | enr.gov.eg | website | 2 | none | Monthly | Train stations, routes |
| **Cairo Metro (operational data)** | cairometro.gov.eg | website | 2 | none | Monthly | Metro schedules, fares |
| **OpenStreetMap** | openstreetmap.org | open_data | 5 | none | On-demand | Station coordinates and route geometry |

### 7.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| MoT | **No** | — | — |
| NAT | **No** — static site | — | — |
| ENR | **No** | — | — |
| Cairo Metro | **No** | — | — |
| OSM | **Yes** — Overpass API, Nominatim | Public REST | wiki.openstreetmap.org |

> **Assessment:** No transport authority provides an official API. Station data must be scraped from NAT (metro) and ENR (railway) websites. Route/schedule data may need manual compilation. OSM Overpass API can provide comprehensive coordinate data.

### 7.4 Expected Data Fields per Source

| Field | NAT | ENR | OSM | Priority |
|-------|-----|-----|-----|----------|
| nameAr | ✓ | ✓ | ✗ | NAT/ENR |
| nameEn | ✗ | ✗ | ✓ | OSM |
| type | ✓ (metro) | ✓ (train) | ✓ | NAT/ENR + OSM |
| lineName | ✓ | ✓ | ✓ | NAT/ENR > OSM |
| governorate | ✓ | ✓ | inferred | NAT/ENR |
| latitude | ✓ (basic) | ✓ (basic) | ✓ | OSM > NAT/ENR |
| longitude | ✓ (basic) | ✓ (basic) | ✓ | OSM > NAT/ENR |
| hasParking | ✓ | ✓ | ✓ | NAT/ENR > OSM |
| hasAccessibility | ✗ | ✗ | ✓ | OSM |
| routes | ✓ (some) | ✓ (some) | ✗ | NAT/ENR |
| fares | ✗ | ✓ | ✗ | ENR |
| schedules | ✗ | ✓ | ✗ | ENR |

### 7.5 Recommended Sync Strategy

```
Strategy: Authority Scraping + OSM Geocoding
1. Scrape NAT for metro station list (monthly).
2. Scrape ENR for train station list (monthly).
3. Use OSM Overpass API to enrich coordinates, line names, accessibility (monthly).
4. Compile route information from ENR (inter-city) and NAT (metro lines).
5. For bus stations: search OSM + governorate websites (lower priority).
6. Dedup across sources using (type, nameAr, governorate).
```

---

## 8. Module: Emergency Services

### 8.1 Data Model

```
EmergencyContact
├── id (UUID)
├── type (police | fire | ambulance | civil_defense)
├── nameAr / nameEn
├── hotline / alternatePhone
├── governorateId / cityId (nullable — national contacts have no location)
├── latitude / longitude
├── isNational
├── isActive
├── sourceMetadata

EmergencyAlert
├── id (UUID)
├── titleAr / titleEn
├── description
├── severity (info | warning | critical)
├── affectedAreas (JSON array)
├── isActive / expiresAt
└── sourceMetadata
```

### 8.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Ministry of Interior** | moiegypt.gov.eg | website | 1 | none | Monthly | Police hotlines, stations |
| **Egyptian Ambulance Authority** | ambulance.eg | website | 2 | none | Monthly | Ambulance contacts |
| **Egyptian Red Crescent** | egyptianrc.org | website | 3 | none | Monthly | Emergency preparedness |
| **Civil Defense (Fire)** | (via MoI page) | website | 2 | none | Monthly | Fire station contacts |

### 8.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| MoI | **No** | — | — |
| Ambulance Authority | **No** | — | — |
| Red Crescent | **No** | — | — |

> **Assessment:** No APIs. National hotline numbers (122, 123, 180, 160) are well-known and can be treated as static reference data. Local contact details must be scraped from MoI.

### 8.4 Expected Data Fields per Source

| Field | MoI | Ambulance | Red Crescent | Static |
|-------|-----|-----------|--------------|--------|
| type | ✓ | ✓ | ✓ | ✓ |
| nameAr | ✓ | ✓ | ✓ | ✓ |
| nameEn | ✗ | ✗ | ✗ | ✓ |
| hotline | ✓ | ✓ | ✓ | ✓ |
| alternatePhone | ✓ | ✓ | ✗ | ✗ |
| governorate | ✓ | ✓ | ✓ | ✗ |
| latitude | ✗ | ✗ | ✗ | ✗ |
| longitude | ✗ | ✗ | ✗ | ✗ |
| isNational | ✓ | ✓ | ✓ | ✓ |

### 8.5 Recommended Sync Strategy

```
Strategy: Reference Data + Periodic Verification
1. National hotlines (122, 123, 180, 160) are static — insert once, verify quarterly.
2. Scrape MoI website for local police station and civil defense contacts (monthly).
3. Scrape Ambulance Authority for regional ambulance contacts (monthly).
4. National contacts: priority 1 (authoritative).
5. Local contacts: geocode from street address.
6. Emergency alerts: manual entry by administrators (no automated source).
```

---

## 9. Module: Telecom Companies

### 9.1 Data Model

```
TelecomCompany
├── id (UUID)
├── nameAr / nameEn
├── brandName / type (mobile | fixed | internet)
├── website / phone / customerService
├── isActive
├── sourceMetadata
│
└── TelecomBranch (0..*)
    ├── nameAr / nameEn
    ├── branchType (store | service_center | booth)
    ├── governorateId / cityId / areaId / street
    ├── latitude / longitude / phone / workingHours
    ├── isActive
    └── sourceMetadata
```

### 9.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **National Telecom Regulatory Authority (NTRA)** | tra.gov.eg | website | 2 | none | Monthly | Licensed operators, regulatory data |
| **Ministry of Communications and IT** | mcit.gov.eg | website | 2 | none | Monthly | Telecom sector overview |
| **Orange Egypt** | orange.eg | website | 3 | none | Monthly | Branch/store locator |
| **Vodafone Egypt** | vodafone.com.eg | website | 3 | none | Monthly | Branch/store locator |
| **Etisalat Egypt** | etisalat.eg | website | 3 | none | Monthly | Branch/store locator |
| **Telecom Egypt (WE)** | we.eg | website | 3 | none | Monthly | Branch/store locator |

### 9.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| NTRA | **No** | — | — |
| MCIT | **No** | — | — |
| Orange | Branch locator | — | — |
| Vodafone | Branch locator | — | — |
| Etisalat | Branch locator | — | — |
| WE | Branch locator | — | — |

> **Assessment:** No official APIs. Company websites provide branch/store locator pages that can be scraped.

### 9.4 Expected Data Fields per Source

| Field | NTRA | MCIT | Company Sites | Priority |
|-------|------|------|---------------|----------|
| nameAr | ✓ | ✓ | ✓ | NTRA > Company |
| nameEn | ✓ | ✗ | ✓ | Company |
| brandName | ✓ | ✓ | ✓ | NTRA > Company |
| type | ✓ | ✓ | ✓ | NTRA |
| website | ✓ | ✓ | ✓ | NTRA > Company |
| phone | ✓ | ✓ | ✓ | Company > NTRA |
| customerService | ✓ | ✗ | ✓ | Company |
| branch.nameAr | ✗ | ✗ | ✓ | Company |
| branch.latitude | ✗ | ✗ | ✓ | Company |
| branch.longitude | ✗ | ✗ | ✓ | Company |
| branch.street | ✗ | ✗ | ✓ | Company |

### 9.5 Recommended Sync Strategy

```
Strategy: Company Branch Scraping
1. Scrape NTRA for the master list of licensed operators (monthly).
2. For each operator, scrape their store/branch locator page (monthly).
3. Merge brand-level data from NTRA with branch data from company sites.
4. Dedup branches by name + governorate.
```

---

## 10. Module: Supermarkets

### 10.1 Data Model

```
Supermarket
├── id (UUID)
├── nameAr / nameEn
├── brandName / type (supermarket | hypermarket | mini_market)
├── governorateId / cityId / areaId / street
├── latitude / longitude
├── phone / website
├── hasDelivery / hasOnlineOrdering
├── workingHours
├── isActive
└── sourceMetadata
```

### 10.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Fields Available |
|--------|-----|------|----------|------|-----------|-----------------|
| **Ministry of Supply and Internal Trade** | msit.gov.eg | website | 2 | none | Monthly | Food safety ratings, market data |
| **Consumer Protection Agency** | cpa.gov.eg | website | 3 | none | Monthly | Consumer complaints, verified merchants |
| **Carrefour Egypt** | carrefouregypt.com | website | 3 | none | Monthly | Branch locations, services |
| **Metro Market** | metro-market.eg | website | 3 | none | Monthly | Branch locations |
| **Hyper One** | hyperone.com.eg | website | 3 | none | Monthly | Branch locations |
| **Seoudi Market** | seoudi.com.eg | website | 3 | none | Monthly | Branch locations |

### 10.3 API Assessment

| Source | Has Official API? | API Type | Documentation |
|--------|-------------------|----------|---------------|
| MSIT | **No** | — | — |
| CPA | **No** | — | — |
| Carrefour | Branch finder page | — | — |
| Metro | Branch finder page | — | — |

> **Assessment:** No APIs from government or private sources. Chain supermarkets provide branch finders.

### 10.4 Expected Data Fields per Source

| Field | MSIT | CPA | Chain Sites | Priority |
|-------|------|-----|-------------|----------|
| nameAr | ✓ | ✓ | ✓ | Chain > MSIT |
| nameEn | ✗ | ✗ | ✓ | Chain |
| brandName | ✓ | ✓ | ✓ | Chain > MSIT |
| type | ✗ | ✗ | ✓ | Chain |
| governorate | ✓ | ✓ | ✓ | Chain > MSIT |
| street | ✓ | ✓ | ✓ | Chain |
| latitude | ✗ | ✗ | ✓ | Chain |
| longitude | ✗ | ✗ | ✓ | Chain |
| phone | ✓ | ✓ | ✓ | Chain |
| hasDelivery | ✗ | ✗ | ✓ | Chain |
| hasOnlineOrdering | ✗ | ✗ | ✓ | Chain |

### 10.5 Recommended Sync Strategy

```
Strategy: Chain Scraping + Government Verification
1. Scrape MSIT for regulatory data on food retailers (monthly).
2. For each major chain, scrape branch locator pages (monthly).
3. Small independent markets: community contribution via platform (low priority).
4. Dedup by brand + name + governorate.
```

---

## 11. Module: Geographic Reference Data

### 11.1 Data Models

```
Governorate (27 records + 1)
├── nameAr / nameEn
├── code (unique, e.g., "CAI", "ALX")
├── latitude / longitude
└── isActive

City (200+ records)
├── governorateId
├── nameAr / nameEn
├── latitude / longitude

Area (1000+ records)
├── cityId
├── nameAr / nameEn
├── postalCode
├── latitude / longitude
```

### 11.2 Source Mapping

| Source | URL | Type | Priority | Auth | Frequency | Covers |
|--------|-----|------|----------|------|-----------|--------|
| **Egyptian Cabinet IDSC** | idsc.gov.eg | website | 1 | none | Yearly | Official governorate/city codes |
| **CAPMAS (Central Agency for Public Mobilization & Statistics)** | capmas.gov.eg | open_data | 2 | none | Yearly | Administrative divisions, postal codes |
| **OpenStreetMap** | openstreetmap.org | open_data | 3 | none | On-demand | Boundaries, coordinates |

### 11.3 Assessment

| Data | Has Official Source? | Stability | Notes |
|------|---------------------|-----------|-------|
| Governorate list | Yes — IDSC | Very stable (rarely changes) | 27 governorates, fixed |
| City list | Yes — CAPMAS | Stable | ~200+ recognized cities |
| Area/neighborhood | CAPMAS semi-official | Semi-stable | 1000+ areas, may vary |

### 11.4 Recommended Sync Strategy

```
Strategy: Static Seed + OSM enrichment
1. Seed governorates, cities from IDSC/CAPMAS as reference data (one-time + yearly updates).
2. Use OSM Nominatim for coordinate enrichment.
3. Postal codes from CAPMAS (yearly verification).
4. This data should be shipped as a seed file, not collected via runtime scraping.
```

---

## 12. Module: Reviews

### 12.1 Data Model

```
Review (user-generated — not collected from external sources)
├── userId / entityType / entityId
├── rating (1-5)
├── title / comment
├── isVerifiedPurchase / isApproved / isActive
└── createdAt / updatedAt

ReviewPhoto
├── reviewId
└── url / caption / sortOrder
```

### 12.2 Source Assessment

| Aspect | Details |
|--------|---------|
| **Nature** | 100% user-generated through the platform |
| **External sources** | None — no external review data is imported or scraped |
| **Source mapping** | N/A — data originates from the platform's own API |

### 12.3 Sync Strategy

```
Strategy: Not applicable (internal data only)
Reviews are created by users via the platform's own API.
No external collection required.
```

---

## 13. Priority Matrix

The following matrix summarizes the recommended **implementation order** for collectors, based on data availability, impact, and complexity.

| Order | Domain | Complexity | Data Quality Impact | User Impact | Scraping Difficulty | Priority Score |
|-------|--------|-----------|---------------------|-------------|---------------------|----------------|
| 1 | **Emergency** | Low | High (life-critical) | Medium | Low (mostly static) | **9/10** |
| 2 | **Banks** | Medium | High (financial) | High | Medium (branch locators) | **8/10** |
| 3 | **Pharmacies** | Medium | High (health) | High | Medium (license + chain) | **8/10** |
| 4 | **Government** | Medium | Medium | High | Medium (gov portal) | **7/10** |
| 5 | **Hospitals** | High | High (health) | High | High (multi-site) | **7/10** |
| 6 | **Transport** | High | Medium | High | High (multi-authority) | **6/10** |
| 7 | **Telecom** | Medium | Medium | Medium | Medium | **5/10** |
| 8 | **Supermarkets** | Low | Low | Medium | Low | **4/10** |

### Scoring Rubric
- **Complexity**: 1 (easy) – 5 (very complex, many sources)
- **Data Quality Impact**: Low/Medium/High — how critical data accuracy is
- **User Impact**: How many users will benefit
- **Scraping Difficulty**: Ease of extracting data from source
- **Priority Score**: Weighted combination (max 10)

---

## 14. Synchronization Strategy

### 14.1 Frequency Summary

| Domain | Source Frequency | Collector Interval | Acceptable Staleness |
|--------|-----------------|-------------------|---------------------|
| Banks | Weekly (bank sites) | Weekly | 1 week |
| Pharmacies | Weekly (chains) / Monthly (MoHP) | Weekly | 1 week |
| Hospitals | Monthly | Monthly | 1 month |
| Government | Weekly (gov.eg) | Weekly | 2 weeks |
| Transport | Monthly | Monthly | 1 month |
| Emergency | Monthly | Monthly | 1 month |
| Telecom | Monthly | Monthly | 1 month |
| Supermarkets | Monthly | Monthly | 1 month |
| Governorates | Yearly | On update | 1 year |

### 14.2 Sync Pipeline

Each collector follows this pipeline:

```
1. FETCH
   ├── API Collector: HTTP GET with pagination, rate limiting
   └── Scraper Collector: HTTP GET + cheerio parsing

2. VALIDATE (Zod schemas in packages/shared-schemas/src/)
   ├── Required fields present
   ├── Coordinates in range (-180 to 180)
   ├── Phone number format
   └── Enum values valid

3. NORMALIZE
   ├── Arabic text normalization (Unicode NFC)
   ├── Phone to E.164 format
   ├── Address to structured fields
   └── Date/time standardization

4. DEDUPLICATE
   ├── Primary key: (source + externalId) or natural key
   ├── Fuzzy name matching (levenshtein < 3)
   ├── Coordinate proximity check (< 100m)
   └── Multi-source merge rules (lowest priority wins)

5. DIFF
   ├── Compare with current store
   ├── Generate field-level changes
   └── Skip if unchanged (race condition safe)

6. UPSERT
   ├── INSERT if new
   ├── UPDATE if changed
   ├── SKIP if unchanged
   └── Log to import_logs + sync_records
```

### 14.3 Error Handling

| Error Type | Action | Retry | Backoff |
|-----------|--------|-------|---------|
| Network (timeout, DNS) | Retry up to 3 times | Yes | Exponential (1m → 5m → 30m) |
| HTTP 429 (rate limit) | Wait and retry | Yes (per Retry-After) | Headers-based |
| HTTP 5xx | Retry up to 2 times | Yes | Linear (10m) |
| HTTP 4xx (except 429) | Mark source as error | No | — |
| Parse error | Log, skip record, continue | No | — |
| Validation error | Log, skip record, continue | No | — |

### 14.4 Monitoring & Alerting

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Sync failure rate | > 10% in 24h | PagerDuty / Email |
| Source unavailable | > 3 consecutive failures | Email |
| Stale data (no sync) | > 2x expected interval | Dashboard warning |
| Low record count | < 50% of expected | Email |
| Dedup ratio | > 20% duplicates | Dashboard warning |

---

## 15. Cross-Cutting Concerns

### 15.1 Rate Limiting & Respect

- All collectors must implement **polite scraping** with a minimum of 1 second between requests.
- Respect `robots.txt` on all target domains.
- Include a descriptive `User-Agent` header: `EgyptServicesPlatform/1.0 (+https://egypt-services-web.vercel.app)`
- If a source provides a `Retry-After` header, the collector **must** honor it.

### 15.2 Legal Compliance

- All scraping must comply with Egyptian Law No. 15 of 2004 (E-Signature and Data Protection).
- Only publicly available government data may be collected.
- Private company data is collected only from publicly accessible store locators.
- No user personal data is collected from external sources.
- Data must be attributed to its original source (`sourceName`, `sourceUrl`).

### 15.3 Data Retention

| Data Type | Duration | Rationale |
|-----------|----------|-----------|
| Current data | Indefinite | Core service data |
| Version history | 90 days | Rollback capacity |
| Import logs | 1 year | Audit trail |
| Sync errors | 1 year | Debugging |
| Raw scrape cache | 7 days | Performance |

### 15.4 Field-Level Source Attribution

Every entity model includes:

```typescript
sourceName: string        // e.g., "Central Bank of Egypt"
sourceUrl: string         // e.g., "https://www.cbe.org.eg/banks"
lastSyncAt: DateTime      // When this record was last synchronized
lastVerifiedAt: DateTime  // When the data was last confirmed accurate
dataVersion: number       // Incremented on each change
validationStatus: string  // "pending" | "valid" | "invalid"
```

### 15.5 Recommended Technology per Source Type

| Source Type | Technology | Package |
|-------------|-----------|---------|
| API (REST) | `ApiCollector` + axios | Built-in framework |
| API (SOAP) | `ApiCollector` + xml2js | Built-in + xml2js |
| Website (static) | `ScraperCollector` + cheerio | Built-in |
| Website (dynamic JS) | `WebCrawler` + puppeteer | Built-in |
| Open Data Portal (CKAN) | `ApiCollector` + CKAN client | Built-in |
| CSV/JSON file | `FileImporter` | Built-in |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Data Engineer | | | |
| Legal / Compliance | | | |

---

*End of Source Mapping Document v1.0*
