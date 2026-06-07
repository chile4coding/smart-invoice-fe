 import { formatRelative, differenceInCalendarDays, format } from "date-fns";

export const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (parts.length > 1 ? first + last : first).toUpperCase();
};


export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return "N/A";
  
  const date = new Date(dateInput);
  const now = new Date();
  const diff = Math.abs(differenceInCalendarDays(now, date));

  if (diff < 7) {
    const result = formatRelative(date, now);
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  return format(date, "dd-MM-yyyy HH:mm:ss");
};
export const getCurrencySymbol = (currency = "NGN") => {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? currency;
};


export const fmtAmount = (val, currency = "NGN") => {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "₦";
  return `${symbol}${(val ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
};

export const getFullName = (user) => {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "N/A";
};

