import { cn } from "@/lib/utils";

export default function AchievementPlacementBadge({
  placement,
  awardBadge,
}: {
  placement: string;
  awardBadge: boolean;
}) {
  return (
    <span
      className={cn(
        "block w-full max-w-full text-left text-xs font-mono px-2.5 py-1.5 rounded-md border leading-snug whitespace-normal [text-wrap:balance]",
        awardBadge
          ? "border-primary/40 text-primary bg-primary/5"
          : "border-border text-muted bg-background",
      )}
    >
      {placement}
    </span>
  );
}
