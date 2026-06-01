import { Fragment } from "react";

// Renderizador markdown mínimo (sin dependencias) para guías técnicas:
// soporta ## / ### encabezados, listas con "- ", numeradas "1." y **negritas**.
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

export function Markdown({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flush = () => {
    if (!list.length) return;
    const items = list.map((t, i) => <li key={i}>{inline(t)}</li>);
    blocks.push(
      ordered ? (
        <ol key={blocks.length} className="my-2 list-decimal space-y-1 pl-5 text-ink-700">
          {items}
        </ol>
      ) : (
        <ul key={blocks.length} className="my-2 list-disc space-y-1 pl-5 text-ink-700">
          {items}
        </ul>
      ),
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push(
        <h3 key={blocks.length} className="mt-4 text-base font-semibold text-ink-900">
          {inline(line.slice(4))}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2 key={blocks.length} className="mt-6 text-lg font-bold text-ink-900">
          {inline(line.slice(3))}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      if (ordered) flush();
      ordered = false;
      list.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      if (!ordered) flush();
      ordered = true;
      list.push(line.replace(/^\d+\.\s/, ""));
    } else {
      flush();
      blocks.push(
        <p key={blocks.length} className="my-2 text-sm leading-relaxed text-ink-700">
          {inline(line)}
        </p>,
      );
    }
  }
  flush();

  return <div className="space-y-1">{blocks}</div>;
}
