"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  hint?: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  prefix?: string;
}

export function TagInput({
  label,
  hint,
  placeholder,
  value,
  onChange,
  maxTags,
  prefix,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^[#r/]+/, "");
    if (!tag) return;
    if (value.includes(tag)) return;
    if (maxTags && value.length >= maxTags) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {maxTags && (
            <span className="ml-2 text-xs text-text-tertiary">
              {value.length}/{maxTags}
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          "flex flex-wrap gap-1.5 min-h-[40px] p-1.5 rounded-lg bg-surface border border-border",
          "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20",
          "transition-all",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary-300 text-xs ring-1 ring-primary/30"
          >
            {prefix}
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent outline-none px-2 text-sm text-text-primary placeholder:text-text-tertiary"
          placeholder={value.length === 0 ? placeholder : ""}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input && addTag(input)}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
}
