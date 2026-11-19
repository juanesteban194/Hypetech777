/**
 * Initial taxonomy (docs/PROMPT_MAESTRO.md §5.3). The database is the source of truth once it
 * exists (phase 2 seeds `categories` from this file); the admin can edit it afterwards.
 */

export type Section = 'second_hand' | 'new' | 'tech'

export interface CategoryNode {
  slug: string
  name: string
  /** Clarification shown next to the name, e.g. "sweaters y cárdigans". */
  note?: string
  children?: readonly CategoryNode[]
}

/** Shared tree for "Ropa de segunda" and "Ropa nueva": the product decides the section. */
export const APPAREL_CATEGORIES: readonly CategoryNode[] = [
  {
    slug: 'calzado',
    name: 'Calzado',
    children: [
      { slug: 'tenis', name: 'Tenis' },
      { slug: 'botas', name: 'Botas' },
      { slug: 'zapatos-formales', name: 'Zapatos formales' },
      { slug: 'sandalias', name: 'Sandalias' },
    ],
  },
  {
    slug: 'parte-superior',
    name: 'Parte superior',
    children: [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'camisas', name: 'Camisas' },
      { slug: 'polos', name: 'Polos' },
      { slug: 'buzos-de-lana', name: 'Buzos de lana', note: 'sweaters y cárdigans' },
      { slug: 'buzos', name: 'Buzos', note: 'hoodies y cuello redondo' },
      { slug: 'chaquetas-y-abrigos', name: 'Chaquetas y abrigos' },
      { slug: 'chalecos', name: 'Chalecos' },
    ],
  },
  {
    slug: 'parte-inferior',
    name: 'Parte inferior',
    children: [
      { slug: 'jeans', name: 'Jeans' },
      { slug: 'pantalones', name: 'Pantalones' },
      { slug: 'sudaderas', name: 'Sudaderas' },
      { slug: 'shorts', name: 'Shorts' },
      { slug: 'faldas-y-vestidos', name: 'Faldas y vestidos' },
    ],
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    children: [
      { slug: 'gorras-y-sombreros', name: 'Gorras y sombreros' },
      { slug: 'bolsos-y-morrales', name: 'Bolsos y morrales' },
      { slug: 'cinturones', name: 'Cinturones' },
      { slug: 'gafas', name: 'Gafas' },
      { slug: 'relojes', name: 'Relojes' },
    ],
  },
]

export const TECH_CATEGORIES: readonly CategoryNode[] = [
  { slug: 'celulares', name: 'Celulares' },
  { slug: 'tablets', name: 'Tablets' },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    children: [
      { slug: 'audifonos', name: 'Audífonos' },
      { slug: 'cargadores-y-cables', name: 'Cargadores y cables' },
      { slug: 'fundas-y-protectores', name: 'Fundas y protectores' },
      { slug: 'smartwatches', name: 'Smartwatches' },
    ],
  },
]

/** Gender is a filter, not primary navigation (§5.3). Values match the `gender` enum. */
export const GENDERS = [
  { value: 'men', slug: 'hombre', label: 'Hombre' },
  { value: 'women', slug: 'mujer', label: 'Mujer' },
  { value: 'unisex', slug: 'unisex', label: 'Unisex' },
  { value: 'kids', slug: 'ninos', label: 'Niños' },
] as const

export type Gender = (typeof GENDERS)[number]['value']

export const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

/** Numeric sizes 26-44 (§5.7). */
export const NUMERIC_SIZES: readonly number[] = Array.from({ length: 19 }, (_, i) => 26 + i) // TODO(owner): confirm the step (every 1 vs every 2)

/** Shoe sizes (US and EU) are defined with the owner before the catalog phase. */
export const SHOE_SIZES_US: readonly string[] = [] // TODO(owner)
export const SHOE_SIZES_EU: readonly string[] = [] // TODO(owner)

/** Normalized colors and price ranges depend on the real catalog. */
export const COLORS: readonly { slug: string; name: string; hex: string }[] = [] // TODO(owner)
export const PRICE_RANGES: readonly {
  slug: string
  label: string
  min: number
  max: number | null
}[] = [] // TODO(owner)

/** Flattens a tree into its leaf categories (those that hold products). */
export function leafCategories(tree: readonly CategoryNode[]): CategoryNode[] {
  return tree.flatMap((node) => (node.children?.length ? leafCategories(node.children) : [node]))
}
