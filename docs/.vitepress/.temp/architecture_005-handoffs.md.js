import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 005: Handoff model","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/005-handoffs.md","filePath":"architecture/005-handoffs.md"}');
const _sfc_main = { name: "architecture/005-handoffs.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-005-handoff-model" tabindex="-1">ADR 005: Handoff model <a class="header-anchor" href="#adr-005-handoff-model" aria-label="Permalink to &quot;ADR 005: Handoff model&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Arbitrary agent transfers can leak instructions and create cycles.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Implement declared, schema-validated transfer mode with relevant context, counters, trace events, and visited-agent cycle detection.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>Delegation/sub-agent returns were deferred until parent-child semantics are fully tested.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Transfers are predictable; richer orchestration requires a later ADR.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/005-handoffs.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _005Handoffs = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _005Handoffs as default
};
