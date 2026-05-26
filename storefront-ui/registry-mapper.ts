import ProductCard from "./components/ProductCard";
import {ProductList} from "./components/ProductList";
import type { ComponentType } from "react";

import type { ComponentName } from "../app/components-schema/registry";


// per togliere un errore statico
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentMap: Record<ComponentName, ComponentType<any>> = {
    ProductCard,
    ProductList
}