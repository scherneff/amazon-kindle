# Amazon Kindle Landing Page Migration to AEM Edge Delivery

## Overview
Migrate the source page **`https://www.amazon.com/b?node=121179473011`** into this AEM Edge Delivery / DA-authored site, covering **both content structure and visual design** to match the original.

## Notes & Considerations
- This is an Amazon storefront/browse page, which is typically **bot-protected** — scraping will rely on the automatic Bright Data fallback.
- Amazon pages are content-dense with carousels, product grids, and promotional banners; block mapping and variant naming will be the key modeling effort.
- Target content path within the site will be confirmed during setup (derived from the page node / a sensible slug).

## Checklist

### 1. Project & Setup
- [ ] Confirm project type (doc / da / xwalk) and the project-specific block library endpoint
- [ ] Determine the target content path/slug for the migrated page

### 2. Scrape & Analyze
- [ ] Scrape the source page (content, metadata, images), using the bot-protection fallback as needed
- [ ] Analyze page structure — identify sections, content sequences, and candidate blocks
- [ ] Survey the available block palette (local blocks + Block Collection) to map content to blocks
- [ ] Name/define any block variants needed (hero banners, product carousels, feature grids, etc.)

### 3. Content Import
- [ ] Generate import infrastructure (block parsers, page transformers)
- [ ] Build/bundle the import script and run it to produce the page HTML (never hand-author content HTML)
- [ ] Verify the imported content structure

### 4. Design Migration
- [ ] Extract design tokens and per-block computed styles from the original
- [ ] Apply site-level design and style each migrated block to match the source
- [ ] Visually verify blocks against the original and iterate

### 5. Preview & Validate
- [ ] Preview the migrated page and compare against the original
- [ ] Run a visual critique / validation pass and fix divergences
- [ ] Confirm content completeness (source vs. output)

### 6. Wrap-up
- [ ] Summarize what was migrated and flag any manual follow-ups

> **Note:** This plan is drafted in Plan mode. Approve it to switch to Execute mode, at which point I'll begin with project setup and scraping the source page.
