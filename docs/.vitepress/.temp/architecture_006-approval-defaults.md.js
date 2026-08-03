import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 006: Approval-safe defaults","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/006-approval-defaults.md","filePath":"architecture/006-approval-defaults.md"}');
const _sfc_main = { name: "architecture/006-approval-defaults.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-006-approval-safe-defaults" tabindex="-1">ADR 006: Approval-safe defaults <a class="header-anchor" href="#adr-006-approval-safe-defaults" aria-label="Permalink to &quot;ADR 006: Approval-safe defaults&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Risky model-proposed actions must not execute merely because no UI is configured.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>High-risk tools require approval and the default handler rejects. Modified arguments are revalidated.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>Automatic approval was rejected as unsafe; throwing at configuration time prevents useful dry flows.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Applications must deliberately wire approval.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/006-approval-defaults.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _006ApprovalDefaults = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _006ApprovalDefaults as default
};
