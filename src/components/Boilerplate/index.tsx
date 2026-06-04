import React from "react";
import { cn } from "@/lib/utils";
import type { TBoilerplateProps } from "@/types/components/Boilerplate";

const DEFAULT_PARAGRAPHS = [
  "SuperOps builds AI-native products for modern IT teams. The ITSuite is a unified endpoint management platform that enables internal IT teams to manage endpoints, deliver support, and drive smooth operations at scale.",
  "The MSPSuite unifies endpoint management, ticketing, PSA, and RMM, helping MSPs turn everyday operations into predictable profit and grow without the chaos.",
  "At the heart of the platform is Monica, a purpose-built agentic AI that gives IT teams the edge they need by taking work from automation to autonomy, reducing costs, and improving efficiency.",
  "SuperOps was founded in 2020 by Arvind Parthiban and Jayakumar Karumbasalam with one goal: to rebuild IT management for the AI era. Backed by Addition, March Capital, Z47, Elevation Capital, and Tanglin Venture Partners, our team brings deep experience in ITSM, ITOM, and building high-performance technology platforms.",
  "To learn more or request a demo, visit superops.com.",
];

const DEFAULT_FACTS = [
  { label: "FOUNDED", value: "2020" },
  { label: "HEADCOUNT", value: "100+" },
  { label: "HEADQUATERS", value: "Chennai, India · EMEA · US" },
  {
    label: "PLATFORM",
    value:
      "AI-native ITSuite for internal IT teams; MSPSuite for MSPs — unified endpoint management, ticketing, PSA, and RMM with agentic AI",
  },
  {
    label: "KEY INVESTORS",
    value: "Addition, March Capital, Z47, Elevation Capital, Tanglin Venture Partners",
  },
];

export default function Boilerplate({
  aboutLabel = "ABOUT SUPEROPS",
  heading = "The boilerplate",
  bodyParagraphs = DEFAULT_PARAGRAPHS,
  factSheetLabel = "COMPANY FACT SHEET",
  facts = DEFAULT_FACTS,
  className,
  ...props
}: TBoilerplateProps) {
  return (
    <section
      className={cn(
        "w-full bg-ghost-white px-16 pt-16 pb-[42px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-row gap-[95px] w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-8 w-[674px] shrink-0">
          {/* Header block */}
          <div className="flex flex-col gap-4 w-[606px]">
            <span
              className="font-archia text-base font-medium leading-6 tracking-normal text-muted-gray uppercase"
            >
              {aboutLabel}
            </span>
            <h1
              className="font-zodiak text-5xl font-bold text-deep-purple leading-tight"
            >
              {heading}
            </h1>
          </div>

          {/* Body paragraphs */}
          <div className="flex flex-col gap-0">
            {bodyParagraphs.map((para, idx) => (
              <p
                key={idx}
                className="font-archia text-lg font-normal text-deep-purple leading-8 mb-8 last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8 w-[507px] shrink-0">
          <span
            className="font-archia text-base font-medium leading-6 tracking-normal text-muted-gray uppercase"
          >
            {factSheetLabel}
          </span>

          {/* Fact Sheet Card */}
          <div className="bg-white flex flex-col p-6 gap-[29px] w-[507px]">
            {facts.map((fact, idx) => (
              <div key={idx} className="flex flex-col gap-4 w-full">
                <div className="flex flex-row justify-between items-start w-full gap-4">
                  <span
                    className="font-archia text-base font-medium leading-6 text-muted-gray uppercase shrink-0"
                  >
                    {fact.label}
                  </span>
                  <span
                    className="font-archia text-lg font-normal leading-8 text-deep-purple text-right"
                  >
                    {fact.value}
                  </span>
                </div>
                {idx < facts.length - 1 && (
                  <hr className="border-t border-light-gray w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
