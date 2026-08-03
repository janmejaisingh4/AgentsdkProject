import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ADR 001: Iterative agent loop","description":"","frontmatter":{},"headers":[],"relativePath":"architecture/001-iterative-agent-loop.md","filePath":"architecture/001-iterative-agent-loop.md"}');
const _sfc_main = { name: "architecture/001-iterative-agent-loop.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-001-iterative-agent-loop" tabindex="-1">ADR 001: Iterative agent loop <a class="header-anchor" href="#adr-001-iterative-agent-loop" aria-label="Permalink to &quot;ADR 001: Iterative agent loop&quot;">​</a></h1><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>Agent work branches across model calls, tools, approval, repair, and handoffs. Uncontrolled recursion hides limits.</p><h2 id="decision" tabindex="-1">Decision <a class="header-anchor" href="#decision" aria-label="Permalink to &quot;Decision&quot;">​</a></h2><p>Use one explicit iterative loop with phases and counters, a composed abort signal, and one terminal result.</p><h2 id="alternatives-considered" tabindex="-1">Alternatives considered <a class="header-anchor" href="#alternatives-considered" aria-label="Permalink to &quot;Alternatives considered&quot;">​</a></h2><p>Recursive calls and a graph engine were rejected as harder to audit or prohibited framework behavior.</p><h2 id="consequences" tabindex="-1">Consequences <a class="header-anchor" href="#consequences" aria-label="Permalink to &quot;Consequences&quot;">​</a></h2><p>Limits are exact and the control flow is readable; new phases require deliberate runtime changes.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/001-iterative-agent-loop.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _001IterativeAgentLoop = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _001IterativeAgentLoop as default
};
