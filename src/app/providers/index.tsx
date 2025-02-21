import React from "react";
import { QueryProvider } from "./QueryProvider";
import { RecoilProvider } from "./RecoilProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilProvider>
      <QueryProvider>{children}</QueryProvider>
    </RecoilProvider>
  );
};
