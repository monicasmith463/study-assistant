"use client";
import React from "react";
import RadioSm from "../../form/input/RadioSm";

type ListWithRadioProps = {
  name: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function ListWithRadio({
  name,
  options,
  value,
  onChange,
  error,
}: ListWithRadioProps) {
  return (
    <div>
      <div
        className={`rounded-lg border ${
          error
            ? "border-error-500"
            : "border-gray-200 dark:border-gray-800"
        } bg-white dark:bg-white/[0.03] sm:w-fit`}
      >
        <ul className="flex flex-col">
          {options.map((option, idx) => (
            <li
              key={option}
              className="border-b border-gray-200 px-3 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <RadioSm
                id={`${name}-${idx}`}
                name={name}
                value={option}
                checked={value === option}
                label={option}
                onChange={() => onChange(option)}
              />
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error-500">
          {error}
        </p>
      )}
    </div>
  );
}
