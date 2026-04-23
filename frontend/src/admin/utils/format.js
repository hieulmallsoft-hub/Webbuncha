export const formatCurrency = (value, currency = "VND") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(value));
};

const PRICE_UNIT_TO_VND = 10000;

export const normalizePriceToVnd = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.abs(numericValue) < 1000 ? numericValue * PRICE_UNIT_TO_VND : numericValue;
};

export const formatPriceVnd = (value, currency = "VND") => {
  const normalizedValue = normalizePriceToVnd(value);
  if (normalizedValue === null) {
    return "-";
  }

  return formatCurrency(normalizedValue, currency);
};

export const toPriceUnits = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 0;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.abs(numericValue) >= 1000 ? numericValue / PRICE_UNIT_TO_VND : numericValue;
};

export const toAdminPriceInput = (value) => {
  const normalizedValue = normalizePriceToVnd(value);
  return normalizedValue === null ? "" : normalizedValue;
};

export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return new Intl.NumberFormat("vi-VN").format(Number(value));
};
