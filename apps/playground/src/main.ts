import "./style.css";

const prompt = document.querySelector<HTMLTextAreaElement>("#prompt");
const output = document.querySelector<HTMLElement>("#output");
const events = document.querySelector<HTMLOListElement>("#events");
const runButton = document.querySelector<HTMLButtonElement>("#run");
const cancelButton = document.querySelector<HTMLButtonElement>("#cancel");
if (!prompt || !output || !events || !runButton || !cancelButton) {
  throw new Error("Playground markup is incomplete");
}
let cancelled = false;
const addEvent = (sequence: number, type: string) => {
  const item = document.createElement("li");
  const title = document.createElement("b");
  title.textContent = `${sequence}. ${type}`;
  const time = document.createElement("small");
  time.textContent = new Date().toLocaleTimeString();
  item.append(title, time);
  events.append(item);
};
runButton.addEventListener("click", async () => {
  cancelled = false;
  events.replaceChildren();
  output.textContent = "Running…";
  const phases = ["run_started", "session_loaded", "model_call_started"];
  for (const [index, phase] of phases.entries()) {
    if (cancelled) return;
    addEvent(index + 1, phase);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  if (cancelled) return;
  output.textContent = `Observable execution makes each model call, tool action, limit, and failure visible for: ${prompt.value}`;
  addEvent(4, "model_call_completed");
  addEvent(5, "run_completed");
});
cancelButton.addEventListener("click", () => {
  cancelled = true;
  output.textContent = "Cancelled.";
  addEvent(events.children.length + 1, "run_cancelled");
});
