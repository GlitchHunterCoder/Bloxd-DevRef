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
        max-width: 100%;
        overflow-x: auto;
      }
      #doc pre code {
        font-family: Consolas, Monaco, monospace;
        font-size: 0.95em;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
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

      /* Syntax highlighting */
      #doc .kw  { color: ${darkMode ? "#569cd6" : "#0000cc"}; } /* keywords */
      #doc .str { color: ${darkMode ? "#ce9178" : "#a31515"}; } /* strings */
      #doc .num { color: ${darkMode ? "#b5cea8" : "#098658"}; } /* numbers */
      #doc .lit { color: ${darkMode ? "#4ec9b0" : "#0451a5"}; } /* literals */
      #doc .pun { color: ${darkMode ? "#d4d4d4" : "#555"}; }   /* punctuation / brackets */
      #doc .id { color: ${darkMode ? "#9cdcfe" : "#001080"}; } /* identifiers / function names */
      #doc .cmt { color: ${darkMode ? "#6a9955" : "#008000"}; font-style: italic; }

      /* Tables */
      #doc table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;
      }
      #doc table th, #doc table td {
        border: 1px solid ${darkMode ? "#555" : "#ccc"};
        padding: 6px 12px;
        text-align: left;
      }
      #doc table th {
        background: ${darkMode ? "#222" : "#eee"};
      }

      /* Blockquotes */
      #doc blockquote {
        border-left: 3px solid ${darkMode ? "#666" : "#ccc"};
        padding-left: 10px;
        margin-left: 0;
        color: ${darkMode ? "#aaa" : "#555"};
        font-style: italic;
        background: ${darkMode ? "#1a1a1a" : "#f9f9f9"};
      }

      /* Sidebar file tree */
      #doc-nav {
        position: fixed;
        left: 0;
        top: 0;
        width: 220px;
        height: 100vh;
        overflow-y: auto;
        padding: 10px;
        border-right: 1px solid #333;
        background: #0f1115;
        color: #ccc;
        font-family: sans-serif;
      }
      #doc-nav .folder, #doc-nav .file {
        cursor: pointer;
        padding: 2px 5px;
      }
      #doc-nav .folder {
        font-weight: bold;
      }
      #doc-nav .children {
        margin-left: 15px;
        display: none;
      }
    `;
    document.head.appendChild(style);

    document.body.innerHTML = "";
    document.body.appendChild(container);
    container.style.marginLeft = "240px"; // space for sidebar
  }
  // =========================
  //  MARKDOWN
  // =========================
  async function fetchMarkdown(path) {
    const url = ROOT + path;
    const res = await fetch(url + "?v=" + Date.now());
    if (!res.ok) throw new Error(`Document not found: ${path}`);
    return res.text();
  }
  // =========================
  // FETCH FILE TREE
  // =========================
  async function fetchFileTree(path = "") {
    const apiURL = `https://api.github.com/repos/${USER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    const res = {} //await fetch(apiURL + "?v=" + Date.now()); //change back when it uses tree.json instead of fetch api
    if (!res.ok) return [];
    return res.json();
  }
  // =========================
  // OPEN DOCUMENT
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
      buildSidebarTree();
    } catch (err) {
      renderError(err.message);
    }
  }

  function goBack() {
    if (historyStack.length > 1) {
      historyStack.pop();
      const prev = historyStack.pop();
      openDoc(prev);
    }
  }

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
      code.innerHTML = "";

      const regex = /((?:\/\*[\s\S]*?\*\/)|(?:\/\/[^\n]*))|(["'`][\s\S]*?["'`])|(\b(?:const|let|var|function|return|if|else|for|while|class|new|await|async|throw|try|catch|switch|case|break|default)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|([{}()\[\];.,:+\-*/%=<>!&|^~?])/g;

      let lastIndex = 0;
      let match;
      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIndex) code.appendChild(document.createTextNode(raw.slice(lastIndex, match.index)));
        let span = document.createElement("span");
        if (match[1]) span.className = "cmt";
        else if (match[2]) span.className = "str";
        else if (match[3]) span.className = "kw";
        else if (match[4]) span.className = "lit";
        else if (match[5]) span.className = "num";
        else if (match[7]) span.className = "id";
        else if (match[8]) span.className = "pun";
        span.textContent = match[0];
        code.appendChild(span);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < raw.length) code.appendChild(document.createTextNode(raw.slice(lastIndex)));

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

    md = md.replace(/^### (.*)$/gm, "<h3>$1</h3>")
           .replace(/^## (.*)$/gm, "<h2>$1</h2>")
           .replace(/^# (.*)$/gm, "<h1>$1</h1>");

    md = md.replace(/`([^`]+)`/g, `<code class="inline">$1</code>`)
           .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
           .replace(/\*(.*?)\*/g, "<em>$1</em>")
           .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2">$1</a>`);

    md = md.replace(/^\s*> (.*)$/gm, `<blockquote>$1</blockquote>`);

    md = md.replace(/^\|(.+)\|\n\|([ -:|]+)\|\n((?:\|.*\|\n?)*)/gm, (_, headers, sep, rows) => {
      const ths = headers.split("|").map(h => `<th>${h.trim()}</th>`).join("");
      const trs = rows.trim().split("\n").map(r => {
        const tds = r.split("|").map(c => `<td>${c.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    });

    // Nested lists
    function parseList(lines, start = 0, indent = 0) {
      let html = "";
      let i = start;
      let listType = null;
    
      while (i < lines.length) {
        const line = lines[i];
        const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
        if (!match) break;
    
        const [, space, bullet, text] = match;
        const level = Math.floor(space.replace(/\t/g, "  ").length / 2);
        if (level < indent) break;
    
        const currentType = /\d+\./.test(bullet) ? "ol" : "ul";
        if (!listType) listType = currentType;
    
        if (level > indent) {
          const inner = parseList(lines, i, level);
          html = html.replace(/<\/li>$/, "") + inner.html + "</li>";
          i = inner.next;
          continue;
        }
    
        html += `<li>${text}</li>`;
        i++;
      }
    
      return {
        html: listType ? `<${listType}>${html}</${listType}>` : "",
        next: i
      };
    }
    
    const lines = md.split("\n");
    const finalLines = [];
    let idx = 0;
    while (idx < lines.length) {
      const line = lines[idx];
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        const listBlock = parseList(lines, idx);
        finalLines.push(listBlock.html);
        idx = listBlock.next;
      } else {
        finalLines.push(line);
        idx++;
      }
    }
    md = finalLines.join("\n");

    md = md.split(/\n{2,}/)
           .map(block => {
             if (/^\s*<(h\d|ul|ol|li|pre|blockquote|table)/i.test(block)) return block;
             return `<p>${block.trim()}</p>`;
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
  // FILE TREE SIDEBAR
  // =========================
  async function buildSidebarTree(path = "") {
    const sidebar = document.getElementById("doc-nav") || document.createElement("div");
    sidebar.id = "doc-nav";
    document.body.appendChild(sidebar);

    sidebar.innerHTML = "<strong>Files</strong><hr>";

    const items = await fetchFileTree(path);

    function createNode(item) {
      const node = document.createElement("div");
      if (item.type === "dir") {
        node.className = "folder";
        node.textContent = item.name;
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "children";
        node.onclick = () => {
          childrenContainer.style.display = childrenContainer.style.display === "none" ? "block" : "none";
        };
        node.appendChild(childrenContainer);
        // lazy load subfolders
        node._path = item.path;
        node._childrenContainer = childrenContainer;
        node.addEventListener("click", async e => {
          e.stopPropagation();
          if (!childrenContainer.hasChildNodes()) {
            const subitems = await fetchFileTree(item.path);
            subitems.forEach(sub => childrenContainer.appendChild(createNode(sub)));
          }
          childrenContainer.style.display = childrenContainer.style.display === "none" ? "block" : "none";
        });
      } else if (item.type === "file" && item.name === "index.md") {
        node.className = "file";
        node.textContent = item.name;
        node.onclick = e => {
          e.stopPropagation();
          openDoc(item.path);
        };
      }
      return node;
    }

    items.forEach(item => sidebar.appendChild(createNode(item)));
  }
  // =========================
  // EXPOSE
  // =========================
  window.openDoc = openDoc;
  window.goBack = goBack;

  console.log("Opening index.md ...");
  openDoc("index");
})();
      
