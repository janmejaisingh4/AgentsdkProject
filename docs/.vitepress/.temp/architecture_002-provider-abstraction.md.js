import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 002: Provider abstraction","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/002-provider-abstraction.md","filePath":"architecture/002-provider-abstraction.md"}');
const _sfc_main = { name: "architecture/002-provider-abstraction.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-002-provider-abstraction" tabindex="-1">ADR 002: Provider abstraction <a class="header-anchor" href="#adr-002-provider-abstraction" aria-label="Permalink to &quot;ADR 002: Provider abstraction&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Provider message and tool formats differ.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Normalize requests, messages, responses, stream events, usage, errors, and cancellation in core; translate only in adapter packages.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>A provider-specific core was simpler initially but creates lock-in.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Adapters have translation work; the runtime remains portable.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/002-provider-abstraction.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _002ProviderAbstraction = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _002ProviderAbstraction as default
};
