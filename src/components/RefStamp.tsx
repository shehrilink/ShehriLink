export function RefStamp({ refNumber, size = "md" }: { refNumber: string; size?: "sm" | "md" }) {
  return (
    <span className={`ref-stamp ${size === "sm" ? "text-xs px-3 py-1.5" : "text-base"}`}>
      {refNumber}
    </span>
  );
}
