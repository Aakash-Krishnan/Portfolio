# JSON-LD Structured Data — Design Spec

**Date:** 2026-05-24  
**Status:** Approved

---

## Goal

Add a single `@graph`-based JSON-LD block to the portfolio so Google can surface rich results (Person knowledge panel, ProfilePage, project and work history signals) from CMS data — with zero runtime cost and no impact on the rendered site.

---

## Approach

Option B: inject from `page.tsx`. The page already fetches all CMS data via `fetchPortfolio`. A new `<JsonLd>` server component receives `PortfolioData` and renders one `<script type="application/ld+json">` tag. The graph builder is a pure function in `src/lib/json-ld.ts`.

---

## Files

| File | Role |
|---|---|
| `src/lib/json-ld.ts` | Pure `buildPortfolioGraph(data)` function — no React, fully testable |
| `src/components/meta/JsonLd.tsx` | Server component — calls builder, renders `<script>` tag |
| `src/app/page.tsx` | Add `<JsonLd data={portfolio} />` next to existing sections |

**New dependency:** `schema-dts` (devDependency) — TypeScript types for schema.org, zero runtime impact.

---

## `@graph` Nodes

All `@id` URIs are anchored to `site.siteUrl`.

### 1. `WebSite`
```json
{
  "@type": "WebSite",
  "@id": "{siteUrl}/#website",
  "url": "{siteUrl}",
  "name": "{site.metaTitle}"
}
```
Enables sitelinks search box eligibility.

### 2. `Person`
```json
{
  "@type": "Person",
  "@id": "{siteUrl}/#person",
  "name": "{site.fullName}",
  "email": "{site.email}",
  "jobTitle": "{site.packageRole}",
  "url": "{siteUrl}",
  "image": "{site.aboutPhoto.url}",
  "sameAs": [ ...contactLinks where href.startsWith("https://") ]
}
```
`sameAs` is populated from `site.contactLinks[].href`, filtered to `https://` only (excludes `mailto:` and `tel:`).

### 3. `ProfilePage`
```json
{
  "@type": "ProfilePage",
  "@id": "{siteUrl}/#profilepage",
  "url": "{siteUrl}",
  "name": "{site.metaTitle}",
  "description": "{site.metaDescription}",
  "mainEntity": { "@id": "{siteUrl}/#person" },
  "image": "{site.aboutPhoto.url}"
}
```
Cross-references `Person` via `@id`. Google uses this as the primary person-focused rich result.

### 4. `ItemList` — Projects
```json
{
  "@type": "ItemList",
  "@id": "{siteUrl}/#projects",
  "name": "Projects",
  "itemListElement": projects.map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "CreativeWork",
      "name": p.name,
      "description": p.description,
      "url": p.liveUrl ?? p.githubUrl ?? siteUrl
    }
  }))
}
```
Only non-internal projects are included (`p.isInternal === false`).

### 5. `ItemList` — Work Experience
```json
{
  "@type": "ItemList",
  "@id": "{siteUrl}/#experience",
  "name": "Work Experience",
  "itemListElement": experiences.map((e, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "Role",
      "roleName": e.role,
      "worksFor": { "@type": "Organization", "name": e.company },
      "description": e.period
    }
  }))
}
```
`e.period` is a CMS string (e.g. "Jan 2022 – Present") used as a human-readable description since it's not a parseable ISO date range.

---

## `sameAs` Filtering Logic

```ts
const sameAs = site.contactLinks
  .map(l => l.href)
  .filter(href => href.startsWith("https://"));
```

Omits `mailto:` and `tel:` links since schema.org `sameAs` expects resolvable web URLs.

---

## `<JsonLd>` Component

```tsx
// src/components/meta/JsonLd.tsx
import type { PortfolioData } from "@/types/portfolio";
import { buildPortfolioGraph } from "@/lib/json-ld";

export default function JsonLd({ data }: { data: PortfolioData }) {
  const graph = buildPortfolioGraph(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
```

Rendered as a server component — no client JS. `dangerouslySetInnerHTML` is the standard Next.js pattern for JSON-LD injection; the content is fully controlled from CMS data, not user input.

---

## Integration in `page.tsx`

```tsx
<JsonLd data={portfolio} />
```

Added inside the `return` of `Home()`, before or after `<TerminalWrapper>` — position in the DOM doesn't affect structured data parsing.

---

## What Changes / What Doesn't

**Changes:**
- New file `src/lib/json-ld.ts`
- New file `src/components/meta/JsonLd.tsx`
- One import + one JSX line added to `src/app/page.tsx`
- `schema-dts` added to `devDependencies`

**Unchanged:**
- All existing components, styles, animations
- `layout.tsx`, `globals.css`, Hygraph queries
- No new runtime dependencies
- No changes to the visual site

---

## Validation

After deployment, validate using:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
