"use client";
import React from "react";
import RadioSm from "../../form/input/RadioSm";

type ListWithRadioProps = {
  name: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
};

export default function ListWithRadio({
  name,
  options,
  value,
  onChange,
}: ListWithRadioProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:w-fit">
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
  );
}
