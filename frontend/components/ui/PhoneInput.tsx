"use client";

import React from "react";
import PhoneInputLib, { type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "+971 50 123 4567",
  required = false,
}: PhoneInputProps) {
  return (
    <div className="phone-input-wrapper">
      <PhoneInputLib
        international
        defaultCountry={"AE" as Country}
        countries={["AE", "US", "BD"]}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        placeholder={placeholder}
        inputComponent={CustomInput}
        countrySelectComponent={CustomCountrySelect}
      />

      {/* Scoped CSS — overrides react-phone-number-input defaults */}
      <style>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          gap: 0;
          background-color: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 2px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .phone-input-wrapper .PhoneInput:focus-within {
          border-color: #d4af37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.12);
        }
        .phone-input-wrapper .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 14px;
          width: 100%;
          padding: 10px 0 10px 10px;
          caret-color: #d4af37;
        }
        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #3f3f46;
        }
      `}</style>
    </div>
  );
}

// ─── Custom Input ─────────────────────────────────────────────────────────────
const CustomInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="bg-transparent border-none outline-none text-white text-sm w-full py-2.5 pl-2 caret-amber-400 placeholder:text-zinc-700"
  />
));
CustomInput.displayName = "CustomInput";

// ─── Custom Country Select ────────────────────────────────────────────────────
interface CountrySelectOption {
  value?: Country;
  label: string;
}

interface CustomCountrySelectProps {
  value?: Country;
  onChange: (value: Country) => void;
  options: CountrySelectOption[];
  iconComponent: React.ComponentType<{ country?: Country; label?: string }>;
}

function CustomCountrySelect({
  value,
  onChange,
  options,
  iconComponent: Flag,
}: CustomCountrySelectProps) {
  return (
    <div className="relative flex items-center gap-1.5 pr-3 border-r border-white/10 flex-shrink-0 cursor-pointer group">
      {/* Country flag */}
      <div className="w-6 h-[15px] rounded-[2px] overflow-hidden shadow">
        <Flag country={value} label={value ?? ""} />
      </div>

      {/* Gold chevron arrow */}
      <span className="text-amber-500 text-[9px] leading-none group-hover:text-amber-400 transition-colors select-none">
        ▾
      </span>

      {/* Invisible native <select> overlaid for browser accessibility */}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as Country)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        aria-label="Select country code"
      >
        {options
          .filter((opt) => opt.value)
          .map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    </div>
  );
}
