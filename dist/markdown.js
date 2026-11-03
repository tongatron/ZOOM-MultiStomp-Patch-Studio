// A small Markdown renderer for the site's own documents (technical-notes.md): headings, paragraphs, lists,
// tables, fenced code, inline code, bold, italics and links. All text is escaped first; only these tags are produced.

const MARKDOWN = (() => {
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const slug = text => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Inline code first, so its content is never read as bold or links
  function inline(text) {
    const codes = [];
    let s = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|[\w./#-]+)\)/g, (_, label, href) =>
      `<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  }
  const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  function render(source) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (line.startsWith('```')) {
        const code = [];
        for (i++; i < lines.length && !lines[i].startsWith('```'); i++) code.push(lines[i]);
        i++;
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length, html = inline(heading[2]);
        out.push(`<h${level} id="${slug(html)}">${html}</h${level}>`);
        i++;
        continue;
      }
      if (line.trim().startsWith('|') && /^\s*\|?\s*:?-+/.test(lines[i + 1] || '')) {
        const head = cells(line);
        const rows = [];
        for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) rows.push(cells(lines[i]));
        out.push(`<div class="md-table"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>`
          + `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      const list = line.match(/^(\d+\.|[-*])\s+/);
      if (list) {
        const ordered = /\d/.test(list[1]);
        const items = [];
        for (; i < lines.length && /^(\d+\.|[-*])\s+/.test(lines[i]); i++) items.push(lines[i].replace(/^(\d+\.|[-*])\s+/, ''));
        const tag = ordered ? 'ol' : 'ul';
        out.push(`<${tag}>${items.map(item => `<li>${inline(item)}</li>`).join('')}</${tag}>`);
        continue;
      }
      const para = [];
      for (; i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\||(\d+\.|[-*])\s)/.test(lines[i]); i++) para.push(lines[i].trim());
      out.push(`<p>${inline(para.join(' '))}</p>`);
    }
    return out.join('\n');
  }

  return { render };
})();
