import { useEffect, useState } from 'react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  title?: string;
}

function formatIsoDate(value?: string): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

function formatDigits(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toIsoDate(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    date.getFullYear() === Number(year)
    && date.getMonth() === Number(month) - 1
    && date.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : null;
}

export default function DateTextInput({
  value,
  onChange,
  className,
  placeholder = 'dd/mm/aaaa',
  title,
}: Props) {
  const [displayValue, setDisplayValue] = useState(formatIsoDate(value));

  useEffect(() => {
    setDisplayValue(formatIsoDate(value));
  }, [value]);

  const handleChange = (rawValue: string) => {
    const nextDisplayValue = formatDigits(rawValue);
    setDisplayValue(nextDisplayValue);

    if (!nextDisplayValue) {
      onChange('');
      return;
    }

    const isoDate = toIsoDate(nextDisplayValue);
    if (isoDate) onChange(isoDate);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={10}
      value={displayValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      title={title}
      className={className}
    />
  );
}
