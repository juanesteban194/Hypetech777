import { siteConfig } from '@/config/site'

interface WordmarkProps {
  className?: string
}

/** Typographic placeholder logo (Archivo expanded) until the owner provides a real logo. */
export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-display uppercase font-stretch-expanded ${className}`.trim()}
    >
      {siteConfig.name}
    </span>
  )
}
