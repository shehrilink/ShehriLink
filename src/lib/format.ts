import { formatDistanceToNow, differenceInHours, format } from "date-fns";

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  const hours = differenceInHours(new Date(), date);
  if (hours < 48) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "d MMM yyyy, h:mm a");
}

export function formatDateOnly(iso: string): string {
  return format(new Date(iso), "d MMM yyyy");
}
