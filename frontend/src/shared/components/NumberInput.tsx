"use client";

import React, { useState } from "react";
import { TextField, InputAdornment, IconButton, TextFieldProps } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export interface NumberInputProps
  extends Omit<TextFieldProps, "onChange" | "value" | "type"> {
  value: number | string | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  disabled = false,
  label,
  placeholder = "0",
  ...props
}: NumberInputProps) {
  const [prevValue, setPrevValue] = useState<number | string | null | undefined>(value);
  const [inputValue, setInputValue] = useState<string>(
    value !== null && value !== undefined && value !== "" ? String(value) : ""
  );

  // Sync state during render when value prop changes from parent
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value !== null && value !== undefined && value !== "" ? String(value) : "");
  }

  const roundValue = (val: number) => {
    return Math.round(val * 100) / 100;
  };

  const getNumericValue = (): number | null => {
    if (inputValue === "" || isNaN(Number(inputValue))) return null;
    return parseFloat(inputValue);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const current = getNumericValue() ?? min ?? 0;
    const next = roundValue(current + step);
    if (max !== undefined && next > max) return;
    setInputValue(String(next));
    onChange(next);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = getNumericValue() ?? min ?? 0;
    const next = roundValue(current - step);
    if (min !== undefined && next < min) return;
    setInputValue(String(next));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, "");
    const isFloat = step % 1 !== 0;
    const allowsNegative = min !== undefined && min < 0;

    // Sanitize string: allow leading '-' only if allowsNegative, digits, and one '.' if isFloat
    let cleanVal = "";
    let hasDot = false;

    for (let i = 0; i < rawVal.length; i++) {
      const char = rawVal[i];
      if (char === "-" && i === 0 && allowsNegative) {
        cleanVal += char;
      } else if (char === "." && isFloat && !hasDot) {
        cleanVal += char;
        hasDot = true;
      } else if (/[0-9]/.test(char)) {
        cleanVal += char;
      }
    }

    setInputValue(cleanVal);

    if (cleanVal === "" || cleanVal === "-") {
      onChange(null);
      return;
    }

    const parsed = parseFloat(cleanVal);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        onChange(min);
      } else if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control and navigation keys
    if (
      e.key === "Backspace" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Escape" ||
      e.key === "Delete" ||
      e.key.startsWith("Arrow") ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    const isFloat = step % 1 !== 0;
    const allowsNegative = min !== undefined && min < 0;

    // Block '-' if min >= 0 or if minus is not at the start
    if (e.key === "-") {
      if (!allowsNegative || inputValue.includes("-")) {
        e.preventDefault();
      }
      return;
    }

    // Allow '.' only if step is float and input doesn't already contain '.'
    if (e.key === ".") {
      if (!isFloat || inputValue.includes(".")) {
        e.preventDefault();
      }
      return;
    }

    // Block any non-digit key (letters, symbols, punctuation)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const currentNum = getNumericValue();

  return (
    <TextField
      {...props}
      label={label}
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      slotProps={{
        htmlInput: {
          min,
          max,
          step,
          inputMode: step % 1 !== 0 ? "decimal" : "numeric",
          style: { textAlign: "center", paddingLeft: "2px", paddingRight: "2px" },
        },
        input: {
          sx: { px: 0.5 },
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0 }}>
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={disabled || (currentNum !== null && currentNum <= min)}
                edge="start"
                tabIndex={-1}
                sx={{ p: 0.5 }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 0 }}>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={disabled || (currentNum !== null && max !== undefined && currentNum >= max)}
                edge="end"
                tabIndex={-1}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
