import { ExpiryStatus } from "../types";
import { colors } from "../constants/theme";

export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft < 0) {
    return "expired";
  } else if (daysLeft <= 1) {
    return "critical";
  } else if (daysLeft <= 7) {
    return "warning";
  } else {
    return "ok";
  }
};

export const getStatusColor = (status: ExpiryStatus): string => {
  switch (status) {
    case "expired":
    case "critical":
      return colors.statusRed;
    case "warning":
      return colors.statusAmber;
    case "ok":
      return colors.statusGreen;
    default:
      return colors.gray;
  }
};

export const getStatusLabel = (expiryDate: string): string => {
  const daysLeft = getDaysUntilExpiry(expiryDate);
  const status = getExpiryStatus(expiryDate);

  if (status === "expired") {
    return "PRZETERMINOWANE";
  } else if (daysLeft === 0) {
    return "DZIŚ";
  } else if (daysLeft === 1) {
    return "JUTRO";
  } else if (daysLeft <= 7) {
    return `${daysLeft} DNI`;
  } else {
    return "OK";
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "Teraz";
  } else if (diffMins < 60) {
    return `${diffMins} min temu`;
  } else if (diffHours < 24) {
    return `${diffHours}:${(date.getMinutes()).toString().padStart(2, "0")}`;
  } else if (diffDays === 1) {
    return "WCZORAJ";
  } else {
    return formatDate(dateString);
  }
};
