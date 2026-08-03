import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 008: Package architecture","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/008-package-architecture.md","filePath":"architecture/008-package-architecture.md"}');
const _sfc_main = { name: "architecture/008-package-architecture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-008-package-architecture" tabindex="-1">ADR 008: Package architecture <a class="header-anchor" href="#adr-008-package-architecture" aria-label="Permalink to &quot;ADR 008: Package architecture&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Core should stay lightweight while adapters have separate release cycles.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Use pnpm workspaces with <code>@vasuagent/core</code> and a separate OpenAI adapter. Defer Anthropic/Gemini packages until maintainable tests exist.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>Embedding adapters in core reduces folders but couples release and dependencies.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Imports are explicit and future providers can evolve independently.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/008-package-architecture.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _008PackageArchitecture = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _008PackageArchitecture as default
};
