import { CATEGORIES, CONDITIONS, type ToolInput } from "./types";

type Props = { value: ToolInput; onChange: (value: ToolInput) => void };

export function ToolFields({ value, onChange }: Props) {
  const set = <K extends keyof ToolInput>(key: K, v: ToolInput[K]) => onChange({ ...value, [key]: v });
  return (
    <div className="fields">
      <label>Name
        <input required minLength={2} maxLength={60} value={value.name} onChange={(e) => set("name", e.target.value)} />
      </label>
      <label>Category
        <select value={value.category} onChange={(e) => set("category", e.target.value as ToolInput["category"])}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Condition
        <select value={value.condition} onChange={(e) => set("condition", e.target.value as ToolInput["condition"])}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="wide">Short description
        <textarea maxLength={280} rows={2} value={value.description} onChange={(e) => set("description", e.target.value)} />
      </label>
    </div>
  );
}
