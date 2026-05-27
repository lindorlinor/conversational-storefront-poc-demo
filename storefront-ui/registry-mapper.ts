import { ProductList } from "./components/ProductList";
import { CollectionWidget } from "./components/CollectionWidget";
import { ProductHero } from "./components/ProductHero";
import type { ComponentType } from "react";

import type { ComponentName } from "../app/components-schema/registry";


// per togliere un errore statico
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentMap: Record<ComponentName, ComponentType<any>> = {
    ProductList,
    CollectionWidget,
    ProductHero,
}