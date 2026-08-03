import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 004: Session storage","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/004-session-storage.md","filePath":"architecture/004-session-storage.md"}');
const _sfc_main = { name: "architecture/004-session-storage.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-004-session-storage" tabindex="-1">ADR 004: Session storage <a class="header-anchor" href="#adr-004-session-storage" aria-label="Permalink to &quot;ADR 004: Session storage&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Conversation history outlives a run but must not mutate agent definitions.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Use an async store contract with isolated records, timestamps, versions, optional TTL, and a separate context selector. Ship memory and atomic JSON-file stores first.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>SQLite was deferred because native driver installation is environment-sensitive.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>The first persistent store favors portability over query performance.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/004-session-storage.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _004SessionStorage = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _004SessionStorage as default
};
