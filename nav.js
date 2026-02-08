(() => {
  // =========================
  // CONFIG
  // =========================
  const USER = "GlitchHunterCoder";
  const REPO = "Bloxd-DevRef";
  const BRANCH = "main";
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

    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    container.style.backgroundColor = darkMode ? "#111" : "#fff";
    container.style.color = darkMode ? "#eee" : "#111";

    const style = document.createElement("style");
    style.textContent = `
      /* Code blocks */
      #doc pre {
        background: ${darkMode ? "#1e1e1e" : "#f5f5f5"};
        color: ${darkMode ? "#e6e6e6" : "#111"};
        padding: 12px;
        border-radius: 8px;
        border: 1px solid ${darkMode ? "#333" : "#ccc"};
        margin: 12px 0;
        box-shadow: inset 0 0 5px ${darkMode ? "#222" : "#ddd"};
        overflow-x: auto;
      }
      #doc pre code {
        font-family: Consolas, Monaco, monospace;
        font-size: 0.95em;
        line-height: 1.45;
        white-space: pre;
        display: block;
      }

      /* Inline code */
      #doc code.inline {
        background: ${darkMode ? "#222" : "#eee"};
        padding: 2px 5px;
        border-radius: 4px;
        font-family: Consolas, Monaco, monospace;
        font-size: 0.9em;
      }

      #doc pre code {
        font-family: Consolas, Monaco, monospace;
        font-size: 0.95em;
        line-height: 1.45;
        white-space: pre;
        display: block;
      }

      /* Syntax highlighting */
      #doc .kw  { color: ${darkMode ? "#569cd6" : "#0000cc"}; } /* keywords */
      #doc .str { color: ${darkMode ? "#ce9178" : "#a31515"}; } /* strings */
      #doc .num { color: ${darkMode ? "#b5cea8" : "#098658"}; } /* numbers */
      #doc .lit { color: ${darkMode ? "#4ec9b0" : "#0451a5"}; } /* literals */
      #doc .pun { color: ${darkMode ? "#d4d4d4" : "#555"}; }   /* punctuation / brackets */
      #doc .id { color: ${darkMode ? "#9cdcfe" : "#001080"}; } /* identifiers / function names */
      #doc .cmt { color: ${darkMode ? "#6a9955" : "#008000"}; font-style: italic; }
    `;
    document.head.appendChild(style);

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  // =========================
  // FETCH MARKDOWN
  // =========================
  async function fetchMarkdown(path) {
    const url = ROOT + path;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Document not found: ${path}`);
    return res.text();
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
      container.innerHTML = markdownToHTML(md);
      highlightCodeBlocks(container);
      rewriteLinks(container, resolved);
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
    if (path.endsWith("/")) return path + "index.md";
    if (path.endsWith(".md")) return path;
    return path + ".md";
  }

  function resolveRelative(from, to) {
    if (/^https?:\/\//.test(to)) return to; 
    const base = from.split("/").slice(0, -1).join("/");
    let target = base ? `${base}/${to}` : to;
    return resolvePath(target);
  }

  // =========================
  // RENDERING
  // =========================
  function renderError(message) {
    container.innerHTML = `<h2>Documentation Error</h2><pre>${message}</pre>`;
  }

  function rewriteLinks(root, basePath) {
    root.querySelectorAll("a[href]").forEach(anchor => {
      const href = anchor.getAttribute("href");
      if (/^https?:\/\//.test(href)) return;

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
  
  function highlightCodeBlocks(root) {
    root.querySelectorAll("pre").forEach(pre => {
      const code = pre.querySelector("code");
      const raw = code.textContent;
      code.innerHTML = ""; // clear old content
  
      // Regex order matters: comments first!
      const regex = /((?:\/\*[\s\S]*?\*\/)|(?:\/\/[^\n]*))|(["'`][\s\S]*?["'`])|(\b(?:const|let|var|function|return|if|else|for|while|class|new|await|async|throw|try|catch|switch|case|break|default)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|([{}()\[\];.,:+\-*/%=<>!&|^~?])/g;
  
      let lastIndex = 0;
      let match;
  
      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
          code.appendChild(document.createTextNode(raw.slice(lastIndex, match.index)));
        }
  
        let span = document.createElement("span");
        if (match[1]) span.className = "cmt"; // comment
        else if (match[2]) span.className = "str"; // string
        else if (match[3]) span.className = "kw";  // keyword
        else if (match[4]) span.className = "lit"; // literal
        else if (match[5]) span.className = "num"; // number
        else if (match[7]) span.className = "id";  // identifier
        else if (match[8]) span.className = "pun"; // punctuation
        span.textContent = match[0];
        code.appendChild(span);
  
        lastIndex = match.index + match[0].length;
      }
  
      if (lastIndex < raw.length) {
        code.appendChild(document.createTextNode(raw.slice(lastIndex)));
      }
  
      // --- Add copy button ---
      let copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.style.position = "absolute";
      copyBtn.style.top = "5px";
      copyBtn.style.right = "5px";
      copyBtn.style.padding = "2px 6px";
      copyBtn.style.fontSize = "0.8em";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.border = "1px solid #888";
      copyBtn.style.background = "#eee";
      copyBtn.style.borderRadius = "4px";
      copyBtn.onmouseover = () => copyBtn.style.background = "#ddd";
      copyBtn.onmouseout = () => copyBtn.style.background = "#eee";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(raw).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = "Copy", 1000);
        });
      };
  
      // make <pre> relative so button positions correctly
      pre.style.position = "relative";
      pre.appendChild(copyBtn);
    });
  }


  function markdownToHTML(md) {
    const codeBlocks = [];
    md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const id = codeBlocks.length;
      codeBlocks.push({ lang, code });
      return `@@CODEBLOCK_${id}@@`;
    });

    md = md.replace(/\r\n/g, "\n");
    md = md
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/`([^`]+)`/gim, "<code class=\"inline\">$1</code>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href=\"$2\">$1</a>");

    md = md
      .split(/\n{2,}/)
      .map(block => {
        if (/^\s*<(h\d|pre|ul|ol|li|hr|blockquote)/i.test(block)) return block;
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");

    md = md.replace(/@@CODEBLOCK_(\d+)@@/g, (_, i) => {
      const { lang, code } = codeBlocks[i];
      return `<pre data-lang="${lang || ""}"><code>${escapeHTML(code)}</code></pre>`;
    });

    return md;
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // =========================
  // EXPOSE
  // =========================
  window.openDoc = openDoc;
  window.goBack = goBack;

  console.log("Opening index.md ...");
  openDoc("index");
})();
