import React from "react";

export type TPressCategory = {
  eyebrow: string;
  headline: string;
  body: string;
};

export interface TPressCategoriesProps extends React.ComponentProps<"section"> {
  leftCard?: TPressCategory;
  rightCard?: TPressCategory;
}
