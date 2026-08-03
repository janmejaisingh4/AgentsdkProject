import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 007: Events and tracing","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/007-events-tracing.md","filePath":"architecture/007-events-tracing.md"}');
const _sfc_main = { name: "architecture/007-events-tracing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-007-events-and-tracing" tabindex="-1">ADR 007: Events and tracing <a class="header-anchor" href="#adr-007-events-and-tracing" aria-label="Permalink to &quot;ADR 007: Events and tracing&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Interfaces need live state while operators need post-run evidence.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Emit one ordered discriminated event stream and build dependency-free span-like traces with pluggable exporters and payload capture off by default.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>Mandatory OpenTelemetry adds weight; logs alone lack lifecycle structure.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Core stays small; an OpenTelemetry bridge can remain optional.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/007-events-tracing.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _007EventsTracing = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _007EventsTracing as default
};
