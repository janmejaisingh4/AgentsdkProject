import { defineConfig } from "vitepress";

const sections = [
  "Introduction",
  "Why VasuAgent exists",
  "Installation",
  "Five-minute quick start",
  "Core concepts",
  "Agents",
  "Runner and agent loop",
  "Model providers",
  "Custom tools",
  "Tool safety",
  "Handoffs",
  "Guardrails",
  "Human approval",
  "Memory and sessions",
  "Structured output",
  "Streaming and events",
  "Reliability and fallback",
  "Tracing",
  "Error handling",
  "Security",
  "API reference",
  "Examples",
  "Provider adapter guide",
  "Session-store adapter guide",
  "Deployment",
  "Troubleshooting",
  "Limitations",
  "Roadmap",
];
const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export default defineConfig({
  title: "VasuAgent SDK",
  description: "Build reliable, provider-independent AI agents.",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide" },
      { text: "ADRs", link: "/architecture/README" },
      { text: "Product", link: "/product/pitch" },
    ],
    sidebar: [
      {
        text: "Documentation",
        items: sections.map((text) => ({ text, link: `/guide#${slug(text)}` })),
      },
    ],
  },
});
