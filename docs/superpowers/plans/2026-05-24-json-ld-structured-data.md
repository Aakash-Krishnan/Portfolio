# JSON-LD Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single `@graph` JSON-LD block to the portfolio page, built from live CMS data, so Google can surface Person, ProfilePage, WebSite, and ItemList rich results.

**Architecture:** A pure builder function `buildPortfolioGraph` in `src/lib/json-ld.ts` takes `PortfolioData` and returns a typed schema.org `@graph` object. A React server component `JsonLd` in `src/components/meta/JsonLd.tsx` renders it as a `<script type="application/ld+json">` tag. `page.tsx` renders `<JsonLd>` alongside existing sections — one import, one JSX line.

**Tech Stack:** Next.js 16 (App Router), TypeScript, `schema-dts` (devDependency, zero runtime)

---

### Task 1: Install `schema-dts`

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install as devDependency**

```bash
cd /Users/mrsky/mine/my-portfolio && pnpm add -D schema-dts
```

Expected output: `devDependencies` updated, lockfile updated. No `node_modules` change that affects the bundle.

- [ ] **Step 2: Verify the type is importable**

```bash
cd /Users/mrsky/mine/my-portfolio && npx tsc --noEmit 2>&1 | head -5
```

Expected: no new errors (zero output or same errors as before).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add schema-dts devDependency for JSON-LD types"
```

---

### Task 2: Build the graph builder function

**Files:**
- Create: `src/lib/json-ld.ts`

- [ ] **Step 1: Create `src/lib/json-ld.ts` with the full builder**

```ts
import type { Graph, WithContext, Person, WebSite, ProfilePage, ItemList } from "schema-dts";
import type { PortfolioData } from "@/types/portfolio";

export function buildPortfolioGraph(data: PortfolioData): WithContext<Graph> {
  const { site, projects, experiences } = data;
  const base = site.siteUrl.replace(/\/$/, "");

  const sameAs = site.contactLinks
    .map((l) => l.href)
    .filter((href) => href.startsWith("https://"));

  const person: Person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.fullName,
    email: site.email,
    jobTitle: site.packageRole,
    url: base,
    ...(site.aboutPhoto ? { image: site.aboutPhoto.url } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website: WebSite = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: site.metaTitle,
  };

  const profilePage: ProfilePage = {
    "@type": "ProfilePage",
    "@id": `${base}/#profilepage`,
    url: base,
    name: site.metaTitle,
    description: site.metaDescription,
    mainEntity: { "@id": `${base}/#person` },
    ...(site.aboutPhoto ? { image: site.aboutPhoto.url } : {}),
  };

  const publicProjects = projects.filter((p) => !p.isInternal);

  const projectList: ItemList = {
    "@type": "ItemList",
    "@id": `${base}/#projects`,
    name: "Projects",
    itemListElement: publicProjects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.name,
        description: p.description,
        url: p.liveUrl ?? p.githubUrl ?? base,
      },
    })),
  };

  const experienceList: ItemList = {
    "@type": "ItemList",
    "@id": `${base}/#experience`,
    name: "Work Experience",
    itemListElement: experiences.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Role",
        roleName: e.role,
        worksFor: { "@type": "Organization", name: e.company },
        description: e.period,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [website, person, profilePage, projectList, experienceList],
  };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/mrsky/mine/my-portfolio && npx tsc --noEmit 2>&1
```

Expected: no errors from `src/lib/json-ld.ts`. If `schema-dts` complains about `"Role"` (it's a valid schema.org type but sometimes needs casting), wrap the `item` value with `as Thing`:

```ts
item: {
  "@type": "Role",
  roleName: e.role,
  worksFor: { "@type": "Organization", name: e.company },
  description: e.period,
} as import("schema-dts").Thing,
```

Apply the same cast to the `CreativeWork` item if needed.

- [ ] **Step 3: Commit**

```bash
git add src/lib/json-ld.ts
git commit -m "feat: add buildPortfolioGraph JSON-LD builder"
```

---

### Task 3: Create the `<JsonLd>` server component

**Files:**
- Create: `src/components/meta/JsonLd.tsx`

- [ ] **Step 1: Create the component**

```tsx
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

- [ ] **Step 2: Type-check**

```bash
cd /Users/mrsky/mine/my-portfolio && npx tsc --noEmit 2>&1
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/meta/JsonLd.tsx
git commit -m "feat: add JsonLd server component"
```

---

### Task 4: Wire `<JsonLd>` into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add import**

At the top of `src/app/page.tsx`, after the existing imports, add:

```ts
import JsonLd from "@/components/meta/JsonLd";
```

- [ ] **Step 2: Render the component**

Inside the `return`, add `<JsonLd data={portfolio} />` as the first child inside `<TerminalWrapper>`, before `<main>`:

```tsx
return (
  <TerminalWrapper navLinks={portfolio.site.navLinks} resume={resume}>
    <JsonLd data={portfolio} />
    <main id="main-content">
      <Hero site={portfolio.site} resume={resume} />
      <About site={portfolio.site} />
      <Experience experiences={portfolio.experiences} />
      <Achievements achievements={portfolio.achievements} />
      <Skills site={portfolio.site} categories={portfolio.skillCategories} />
      <Projects projects={portfolio.projects} />
      <Contact site={portfolio.site} />
    </main>
  </TerminalWrapper>
);
```

- [ ] **Step 3: Type-check and build**

```bash
cd /Users/mrsky/mine/my-portfolio && npx tsc --noEmit 2>&1 && pnpm build 2>&1 | tail -20
```

Expected: build succeeds, no type errors.

- [ ] **Step 4: Verify the script tag appears in the HTML output**

```bash
cd /Users/mrsky/mine/my-portfolio && pnpm build 2>/dev/null && grep -o 'application/ld+json' .next/server/app/page.js 2>/dev/null || grep -r 'application/ld+json' .next/server/ --include='*.js' -l
```

Expected: at least one file listed containing `application/ld+json`.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: inject JSON-LD @graph structured data into portfolio page"
```

---

### Task 5: Manual validation

**Files:** none (read-only verification)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/mrsky/mine/my-portfolio && pnpm dev 2>&1 &
sleep 4
curl -s http://localhost:3000 | grep -o 'application/ld+json'
```

Expected output: `application/ld+json`

- [ ] **Step 2: Inspect the full graph**

```bash
curl -s http://localhost:3000 | grep -o '"@context":"https://schema.org","@graph":\[.*\]' | python3 -m json.tool 2>/dev/null | head -60
```

Expected: pretty-printed JSON with `@context`, `@graph` array containing `WebSite`, `Person`, `ProfilePage`, `ItemList` nodes.

- [ ] **Step 3: Stop dev server**

```bash
kill %1 2>/dev/null || true
```

- [ ] **Step 4: Final commit if any fixes were made**

If no fixes needed, skip. Otherwise:

```bash
git add -p
git commit -m "fix: correct JSON-LD graph output"
```
