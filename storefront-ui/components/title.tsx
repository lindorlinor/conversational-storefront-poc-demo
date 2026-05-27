import { useEffect, useState } from "react";

interface TitleProps {
  apiBase?: string;
  shop?: string;
}

export default function Title({ apiBase = "", shop = "" }: TitleProps) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const params = shop ? `?shop=${encodeURIComponent(shop)}` : "";
    fetch(`${apiBase}/title${params}`)
      .then((res) => res.json())
      .then((data: { title: string }) => setTitle(data.title))
      .catch(() => setTitle("Chiedimi qualcosa"));
  }, [apiBase, shop]);

  return (
    <h1 className={`text-4xl transition-opacity duration-700 ease-in-out ${title ? "opacity-100" : "opacity-0"}`}>
      {title ?? ""}
    </h1>
  );
}
