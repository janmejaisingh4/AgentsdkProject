import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"VasuAgent SDK product pitch","description":"","frontmatter":{},"headers":[],"relativePath":"product/pitch.md","filePath":"product/pitch.md"}');
const _sfc_main = { name: "product/pitch.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vasuagent-sdk-product-pitch" tabindex="-1">VasuAgent SDK product pitch <a class="header-anchor" href="#vasuagent-sdk-product-pitch" aria-label="Permalink to &quot;VasuAgent SDK product pitch&quot;">​</a></h1><h2 id="who-it-is-for" tabindex="-1">Who it is for <a class="header-anchor" href="#who-it-is-for" aria-label="Permalink to &quot;Who it is for&quot;">​</a></h2><p>TypeScript developers and small product teams building agents that interact with tools and business systems.</p><h2 id="problem" tabindex="-1">Problem <a class="header-anchor" href="#problem" aria-label="Permalink to &quot;Problem&quot;">​</a></h2><p>Current choices are often low-level model wrappers or complex agent frameworks. Reliability and observability are added only after a prototype breaks.</p><h2 id="solution" tabindex="-1">Solution <a class="header-anchor" href="#solution" aria-label="Permalink to &quot;Solution&quot;">​</a></h2><p>A compact, provider-neutral runtime that makes safety controls, typed tools, memory, handoffs, ordered events, and traces first-class.</p><h2 id="why-now" tabindex="-1">Why now <a class="header-anchor" href="#why-now" aria-label="Permalink to &quot;Why now&quot;">​</a></h2><p>Tool calling is common across model providers, while dependable orchestration remains application work. Teams need infrastructure that can evolve across providers.</p><h2 id="differentiation" tabindex="-1">Differentiation <a class="header-anchor" href="#differentiation" aria-label="Permalink to &quot;Differentiation&quot;">​</a></h2><ul><li>Transparent iterative loop</li><li>TypeScript-first schemas and inference</li><li>Safe approval defaults</li><li>Observable actions</li><li>Adapter-based model and storage boundaries</li><li>Small core with optional integrations</li></ul><h2 id="adoption-strategy" tabindex="-1">Adoption strategy <a class="header-anchor" href="#adoption-strategy" aria-label="Permalink to &quot;Adoption strategy&quot;">​</a></h2><p>Excellent documentation, zero-cost mock examples, npm packages, GitHub templates, adapter contributions, and educational technical content.</p><h2 id="business-direction" tabindex="-1">Business direction <a class="header-anchor" href="#business-direction" aria-label="Permalink to &quot;Business direction&quot;">​</a></h2><p>Keep the SDK open source. Potential future products include managed traces, team evaluation dashboards, hosted approvals, a secure tool gateway, policy management, and managed session storage. These are directions, not shipped offerings.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("product/pitch.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const pitch = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  pitch as default
};
