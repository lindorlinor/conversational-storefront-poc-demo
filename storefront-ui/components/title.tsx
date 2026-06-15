import { useEffect, useState } from "react";

interface TitleProps {
  apiBase?: string;
  shop?: string;
}

export default function Title({ apiBase = "", shop = "" }: TitleProps) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    // const params = shop ? `?shop=${encodeURIComponent(shop)}` : "";
    // fetch(`${apiBase}/title${params}`)
    //   .then((res) => res.json())
    //   .then((data: { title: string }) => setTitle(data.title))
    //   .catch(() => setTitle("Chiedimi qualcosa"));
    setTitle("Scopri le novità o lasciati conquistare dalle nostre proposte");
  }, [apiBase, shop]);

  return (
    <h1 className={`tw:text-4xl tw:text-widget-text tw:transition-opacity tw:duration-700 tw:ease-in-out ${title ? "tw:opacity-100" : "tw:opacity-0"}`}>
      {title ?? ""}
    </h1>
  );
}
