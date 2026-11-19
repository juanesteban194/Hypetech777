import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Wordmark } from '@/components/ui/wordmark'
import { siteConfig } from '@/config/site'

describe('Wordmark', () => {
  it('renders the store name as a typographic logo', () => {
    render(<Wordmark />)
    expect(screen.getByText(siteConfig.name)).toBeTruthy()
  })

  it('appends extra classes to the base style', () => {
    render(<Wordmark className="text-small" />)
    const classes = screen.getByText(siteConfig.name).className
    expect(classes).toContain('font-display')
    expect(classes).toContain('text-small')
  })
})
