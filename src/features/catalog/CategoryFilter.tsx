import { CATEGORIES, type Category } from "./types";

type Props = { value: Category | undefined; onChange: (value: Category | undefined) => void };

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filter by category">
      <button className={!value ? "pill active" : "pill"} onClick={() => onChange(undefined)}>All</button>
      {CATEGORIES.map((c) => (
        <button key={c} className={value === c ? "pill active" : "pill"} onClick={() => onChange(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
