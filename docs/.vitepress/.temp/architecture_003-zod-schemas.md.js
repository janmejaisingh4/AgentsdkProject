import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 003: Zod schemas","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/003-zod-schemas.md","filePath":"architecture/003-zod-schemas.md"}');
const _sfc_main = { name: "architecture/003-zod-schemas.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-003-zod-schemas" tabindex="-1">ADR 003: Zod schemas <a class="header-anchor" href="#adr-003-zod-schemas" aria-label="Permalink to &quot;ADR 003: Zod schemas&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Model arguments and structured output are untrusted at runtime.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Use Zod as the source for TypeScript inference, validation, field errors, and JSON Schema conversion.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>JSON Schema alone loses first-class inference; handwritten validation is error-prone.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Core carries Zod; developers get one schema definition.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/003-zod-schemas.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _003ZodSchemas = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _003ZodSchemas as default
};
