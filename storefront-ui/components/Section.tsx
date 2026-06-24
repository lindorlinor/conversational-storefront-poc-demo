import type { ReactNode } from "react";

interface SectionProps {
  children?: ReactNode;
}

// una singola <section>: chi la usa deve renderne una per part
function Section({ children }: SectionProps) {
  return (
    <section className="section tw:pt-3 tw:rounded-widget-base">
      <div className="tw:w-[80%] tw:mx-auto tw:pb-4">{children}</div>
    </section>
  );
}

export default Section;
