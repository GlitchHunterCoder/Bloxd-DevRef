(() => {
  // =========================
  // CONFIG
  // =========================
  const USER = "GlitchHunterCoder";       // GitHub username
  const REPO = "Bloxd-DevRef";       // GitHub repository
  const BRANCH = "main";       // branch
  const ROOT = `https://raw.githubusercontent.com/${USER}/${REPO}/refs/heads/${BRANCH}/`;
  const DOC_CONTAINER_ID = "doc";

  // =========================
  // STATE
  // =========================
  let currentPath = null;
  const historyStack = [];

  // =========================
  // ENSURE DOC CONTAINER
  // =========================
  let container = document.getElementById(DOC_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = DOC_CONTAINER_ID;
    container.style.padding = "10px";
    container.style.fontFamily = "sans-serif";
    container.style.minHeight = "100vh";
    container.style.boxSizing = "border-box";
    
    // Detect system theme
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    container.style.backgroundColor = darkMode ? "#111" : "#fff";
    container.style.color = darkMode ? "#eee" : "#111";
  
    document.body.innerHTML = ""; // initialize body with just the container
    document.body.appendChild(container);
  }

  // =========================
  // PUBLIC API
  // =========================
  async function openDoc(path) {
    const resolved = resolvePath(path);
    currentPath = resolved;
    historyStack.push(resolved);

    try {
      const md = await fetchMarkdown(resolved);
      renderMarkdown(md, resolved);
    } catch (err) {
      renderError(err.message);
    }
  }

  function goBack() {
    if (historyStack.length > 1) {
      historyStack.pop(); // remove current
      const prev = historyStack.pop(); // previous
      openDoc(prev);
    }
  }

  // =========================
  // PATH RESOLUTION
  // =========================
  function resolvePath(path) {
    path = path.trim();
    if (path.endsWith("/")) return path + "index.md"; // folder
    if (path.endsWith(".md")) return path;           // file
    return path + ".md";                              // bare filename
  }

  function resolveRelative(from, to) {
    if (to.startsWith("/")) return to.slice(1); // absolute path in repo
    const base = from.split("/").slice(0, -1).join("/");
    let target = base ? `${base}/${to}` : to;
    target = resolvePath(target); // make sure .md or index.md
    return target;
  }

  // =========================
  // FETCHING
  // =========================
  async function fetchMarkdown(path) {
    const url = ROOT + path;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Document not found: ${path}`);
    return res.text();
  }

  // =========================
  // RENDERING
  // =========================
  function renderMarkdown(md, basePath) {
    container.innerHTML = markdownToHTML(md);
    rewriteLinks(container, basePath);
  }

  function renderError(message) {
    container.innerHTML = `<h2>Documentation Error</h2><pre>${message}</pre>`;
  }

  // =========================
  // LINK REWRITING
  // =========================
  function rewriteLinks(root, basePath) {
    root.querySelectorAll("a[href]").forEach(anchor => {
      const href = anchor.getAttribute("href");
      if (/^https?:\/\//.test(href)) return; // external

      const target = resolveRelative(basePath, href);

      const button = document.createElement("button");
      button.textContent = anchor.textContent || target;
      button.style.cursor = "pointer";
      button.style.border = "1px solid #ccc";
      button.style.margin = "2px";
      button.style.padding = "2px 6px";
      button.onclick = () => openDoc(target);

      anchor.replaceWith(button);
    });
  }

  // =========================
  // MINIMAL MARKDOWN
  // =========================
  function markdownToHTML(md) {
    return md
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href=\"$2\">$1</a>")
      .replace(/\n/gim, "<br />");
  }

  // =========================
  // EXPOSE FUNCTIONS
  // =========================
  window.openDoc = openDoc;
  window.goBack = goBack;

  console.log("Bloxd-DevRef Navigator ready. Call openDoc('index') to start.");
})();

