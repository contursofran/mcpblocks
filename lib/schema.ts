import { GITHUB_URL } from "@/components/site/chrome"
import { components, type ComponentDoc } from "@/lib/docs"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site"

export const homeFaqs = [
  {
    question: "What is MCP Blocks UI?",
    answer:
      "MCP Blocks UI (mcpblocks.dev) is a free, open-source shadcn component registry built specifically for MCP Apps — interactive React UI widgets served by Model Context Protocol servers inside Claude, ChatGPT, VS Code, Goose, and Vercel AI SDK hosts.",
  },
  {
    question: "How do I install a component in my MCP App?",
    answer:
      "Run `npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json` (or any component slug) inside a React + Tailwind CSS v4 project. The shadcn CLI copies the component source and Claude host CSS token fallbacks directly into your repo with no locked runtime dependency.",
  },
  {
    question: "How do components automatically match Claude's light and dark themes?",
    answer:
      "Every component uses Tailwind `host-*` utilities mapped to the standard MCP Apps CSS variables (such as `--color-background-primary` and `--color-text-primary`). Inside Claude, `useHostStyles` applies the host's variables; outside Claude, `host-tokens` supplies matching light and dark fallbacks toggled by `applyHostContext`.",
  },
  {
    question: "Do these components work in ChatGPT, VS Code, and Vercel AI SDK hosts?",
    answer:
      "Yes. Components are presentational React code built on the standard MCP Apps protocol (`@modelcontextprotocol/ext-apps`). They are designed Claude-first for strict inline guidelines and degrade cleanly in ChatGPT, VS Code, Goose, and custom Next.js hosts built with Vercel AI SDK's `@ai-sdk/mcp` and `MCPAppRenderer`.",
  },
  {
    question: "Why doesn't MCP Blocks UI include dropdowns or popovers?",
    answer:
      "Claude's MCP Apps design guidelines forbid floating layers like dropdown menus, popovers, and context menus because they clip at sandboxed iframe boundaries and conflict with the host's z-index. MCP Blocks UI enforces this with ESLint and automated conformance checks.",
  },
  {
    question: "Can AI coding agents read and install MCP Blocks UI automatically?",
    answer:
      "Yes. Machine-readable docs are served at `https://mcpblocks.dev/llms.txt`, `https://mcpblocks.dev/llms-full.txt`, and `https://mcpblocks.dev/agents.md`, alongside the shadcn JSON manifest at `https://mcpblocks.dev/r/registry.json` and a live demo MCP server at `https://mcpblocks.dev/mcp`.",
  },
] as const

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: "mcpblocks",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: "mcpblocks",
        description: `${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
        url: SITE_URL,
        codeRepository: GITHUB_URL,
        programmingLanguage: ["TypeScript", "React", "CSS"],
        runtimePlatform: "React 18+, Tailwind CSS v4, Model Context Protocol (MCP Apps)",
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        keywords: [
          "MCP Apps",
          "Claude MCP Apps",
          "MCP UI components",
          "shadcn registry",
          "Model Context Protocol",
          "ext-apps",
          "React widgets for Claude",
          "AI SDK MCP Apps",
        ],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "ItemList",
        name: "MCP Blocks UI Components",
        numberOfItems: components.length,
        itemListElement: components.map((c, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: c.title,
          description: c.description,
          url: `${SITE_URL}/components/${c.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: homeFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  }
}

export function componentJsonLd(doc: ComponentDoc) {
  const url = `${SITE_URL}/components/${doc.slug}`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_URL}/#components`,
          },
          { "@type": "ListItem", position: 3, name: doc.title, item: url },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: `${doc.title} — ${SITE_NAME}`,
        description: doc.description,
        url,
        codeRepository: `${GITHUB_URL}/blob/master/registry/mcpblocks/components/${doc.slug}.tsx`,
        programmingLanguage: ["TypeScript", "React"],
        runtimePlatform: "MCP Apps (Claude, ChatGPT, VS Code, Vercel AI SDK)",
        isAccessibleForFree: true,
        keywords: [
          doc.title,
          `${doc.title} MCP App component`,
          "Claude MCP Apps",
          "shadcn registry",
          doc.category,
        ],
      },
    ],
  }
}

export function guideJsonLd({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  const url = `${SITE_URL}${path}`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
      {
        "@type": "TechArticle",
        headline: title,
        description,
        url,
        inLanguage: "en",
        about: ["Model Context Protocol", "MCP Apps", "Claude", "React", "shadcn"],
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    ],
  }
}
