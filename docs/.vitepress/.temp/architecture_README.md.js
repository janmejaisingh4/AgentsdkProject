import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Architecture decision records","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/README.md","filePath":"architecture/README.md"}');
const _sfc_main = { name: "architecture/README.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="architecture-decision-records" tabindex="-1">Architecture decision records <a class="header-anchor" href="#architecture-decision-records" aria-label="Permalink to &quot;Architecture decision records&quot;">​</a></h1><ul><li><a href="./001-iterative-agent-loop.html">ADR 001: Iterative agent loop</a></li><li><a href="./002-provider-abstraction.html">ADR 002: Provider abstraction</a></li><li><a href="./003-zod-schemas.html">ADR 003: Zod schemas</a></li><li><a href="./004-session-storage.html">ADR 004: Session storage</a></li><li><a href="./005-handoffs.html">ADR 005: Handoff model</a></li><li><a href="./006-approval-defaults.html">ADR 006: Approval defaults</a></li><li><a href="./007-events-tracing.html">ADR 007: Events and tracing</a></li><li><a href="./008-package-architecture.html">ADR 008: Package architecture</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/README.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const README = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  README as default
};
