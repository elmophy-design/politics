"use client";

import { Plus, Trash2 } from "lucide-react";

/**
 * Editor for a repeatable two-field list (manifesto pillars, biography
 * milestones, political roles) — all share the same "short label + long
 * text" shape, so one component covers all three instead of three bespoke ones.
 */
export function JsonListEditor<T extends Record<string, string>>({
  items,
  onChange,
  fieldA,
  fieldB,
  fieldALabel,
  fieldBLabel,
  fieldBMultiline = true,
  emptyItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fieldA: keyof T;
  fieldB: keyof T;
  fieldALabel: string;
  fieldBLabel: string;
  fieldBMultiline?: boolean;
  emptyItem: T;
}) {
  function updateItem(index: number, key: keyof T, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-sm border border-ink-900/10 bg-parchment-100 p-4">
          <div className="flex-1 space-y-2">
            <input
              value={item[fieldA] as string}
              onChange={(e) => updateItem(i, fieldA, e.target.value)}
              placeholder={fieldALabel}
              className="w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            {fieldBMultiline ? (
              <textarea
                value={item[fieldB] as string}
                onChange={(e) => updateItem(i, fieldB, e.target.value)}
                placeholder={fieldBLabel}
                rows={2}
                className="w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            ) : (
              <input
                value={item[fieldB] as string}
                onChange={(e) => updateItem(i, fieldB, e.target.value)}
                placeholder={fieldBLabel}
                className="w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="self-start text-graphite-500 hover:text-clay-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, emptyItem])}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}
