import { useEffect, useState } from "react";

interface TitleProps {
  apiBase?: string;
  shop?: string;
}

export default function Title({ apiBase = "", shop = "" }: TitleProps) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Scopri le novità o lasciati conquistare dalle nostre proposte");
  }, [apiBase, shop]);

  return (
    <h1 className={`tw:text-4xl tw:font-widget-primary tw:text-widget-text tw:transition-opacity tw:duration-700 tw:ease-in-out ${title ? "tw:opacity-100" : "tw:opacity-0"}`}>
      {title ?? ""}
    </h1>
  );
}
