import { describe, expect, it } from 'vitest'
import {
  APPAREL_CATEGORIES,
  GENDERS,
  TECH_CATEGORIES,
  leafCategories,
  type CategoryNode,
} from '@/config/taxonomy'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function allNodes(tree: readonly CategoryNode[]): CategoryNode[] {
  return tree.flatMap((node) => [node, ...allNodes(node.children ?? [])])
}

describe('taxonomy', () => {
  it('uses lowercase ASCII kebab-case slugs', () => {
    for (const node of [...allNodes(APPAREL_CATEGORIES), ...allNodes(TECH_CATEGORIES)]) {
      expect(node.slug, node.name).toMatch(SLUG)
    }
  })

  it('has unique slugs among siblings', () => {
    const check = (siblings: readonly CategoryNode[]) => {
      const slugs = siblings.map((node) => node.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
      siblings.forEach((node) => check(node.children ?? []))
    }
    check(APPAREL_CATEGORIES)
    check(TECH_CATEGORIES)
  })

  it('lists every leaf category of section 5.3', () => {
    expect(leafCategories(APPAREL_CATEGORIES)).toHaveLength(21)
    expect(leafCategories(TECH_CATEGORIES).map((node) => node.slug)).toEqual([
      'celulares',
      'tablets',
      'audifonos',
      'cargadores-y-cables',
      'fundas-y-protectores',
      'smartwatches',
    ])
  })

  it('keeps gender values aligned with the database enum', () => {
    expect(GENDERS.map((gender) => gender.value)).toEqual(['men', 'women', 'unisex', 'kids'])
  })
})
