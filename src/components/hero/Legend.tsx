import { QUALITIES } from "./qualities";

/** Names the seven colours so the model is readable as a set of qualities. */
export function Legend() {
  return (
    <ul aria-label="Qualities represented by the colours" className="mx-auto flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2">
      {QUALITIES.map((q) => (
        <li key={q.name} className="flex items-center gap-2 text-xs font-medium text-muted">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: q.color }}
          />
          {q.name}
        </li>
      ))}
    </ul>
  );
}
