import React from "react";
import { cn } from "@/lib/utils";
import type { TPressCategoriesProps, TPressCategory } from "@/types/components/PressCategories";

const DEFAULT_LEFT_CARD: TPressCategory = {
  eyebrow: "WE'VE GOT NEWS",
  headline: "Official announcements",
  body: "All the press releases and product news from SuperOps, straight from the source.",
};

const DEFAULT_RIGHT_CARD: TPressCategory = {
  eyebrow: "MAKING HEADLINES",
  headline: "In the media",
  body: "The kind of coverage you can't buy or fake. Stories from journalists who don't pull punches.",
};

export default function PressCategories({
  leftCard = DEFAULT_LEFT_CARD,
  rightCard = DEFAULT_RIGHT_CARD,
  className,
  ...props
}: TPressCategoriesProps) {
  return (
    <section
      className={cn("w-full flex flex-col md:flex-row", className)}
      {...props}
    >
      {/* Left Card */}
      <div
        className={cn(
          "flex-1 flex flex-col gap-[10px]",
          "pt-[89px] px-12 pb-8",
          "border-r border-light-grey"
        )}
      >
        <div className="flex flex-col gap-4 max-w-[606px]">
          <div className="flex flex-col gap-4">
            <span
              className={cn(
                "font-archia text-base font-medium leading-6 tracking-normal",
                "text-medium-grey uppercase"
              )}
            >
              {leftCard.eyebrow}
            </span>
            <h2
              className={cn(
                "font-zodiak text-[32px] font-bold leading-[36px] tracking-normal",
                "text-black"
              )}
            >
              {leftCard.headline}
            </h2>
          </div>
          <p
            className={cn(
              "font-archia text-lg font-normal leading-8 tracking-normal",
              "text-deep-purple"
            )}
          >
            {leftCard.body}
          </p>
        </div>
      </div>

      {/* Right Card */}
      <div
        className={cn(
          "flex-1 flex flex-col gap-[10px] relative overflow-hidden",
          "pt-[89px] px-12 pb-8",
          "bg-white"
        )}
      >
        {/* Decorative pink radial gradient blob */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none",
            "bg-super-pink opacity-20 blur-3xl translate-x-1/4 translate-y-1/4"
          )}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4 max-w-[606px] relative z-10">
          <div className="flex flex-col gap-4">
            <span
              className={cn(
                "font-archia text-base font-medium leading-6 tracking-normal",
                "text-medium-grey uppercase"
              )}
            >
              {rightCard.eyebrow}
            </span>
            <h2
              className={cn(
                "font-zodiak text-[32px] font-bold leading-[36px] tracking-normal",
                "text-black"
              )}
            >
              {rightCard.headline}
            </h2>
          </div>
          <p
            className={cn(
              "font-archia text-lg font-normal leading-8 tracking-normal",
              "text-deep-purple"
            )}
          >
            {rightCard.body}
          </p>
        </div>
      </div>
    </section>
  );
}
