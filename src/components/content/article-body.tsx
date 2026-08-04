type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] };

function parseArticleContent(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      i++;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith("- ") || l.startsWith("• ")) {
          items.push(l.slice(2).trim());
          i++;
        } else break;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (/^\d+\.\s/.test(l)) {
          items.push(l.replace(/^\d+\.\s/, "").trim());
          i++;
        } else break;
      }
      blocks.push({ type: "ordered", items });
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || l.startsWith("## ") || l.startsWith("- ") || l.startsWith("• ") || /^\d+\.\s/.test(l)) break;
      paraLines.push(l);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

export function ArticleBody({ content }: { content: string }) {
  const blocks = parseArticleContent(content);

  return (
    <div className="space-y-6 text-lg leading-8 text-ink-soft">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h2 key={idx} className="pt-2 font-display text-2xl font-semibold text-brand">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={idx} className="space-y-2 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered") {
          return (
            <ol key={idx} className="space-y-2 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 font-display font-semibold text-gold">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        return <p key={idx}>{block.text}</p>;
      })}
    </div>
  );
}
