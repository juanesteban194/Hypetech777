import { Archivo, Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

// All OFL, self-hosted by next/font, latin subset (docs/PROMPT_MAESTRO.md §4.3).
// Only Geist Sans and Archivo are preloaded (§10.1: at most two preloaded fonts).

/** Display: variable Archivo; `wdth` axis (62-125) gives the expanded cut. */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
})

/** UI and body text. */
export const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
})

/** Codes, specs and labels. Not preloaded. */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-geist-mono',
})

/** Editorial headlines and quotes only. Not preloaded. */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--font-instrument-serif',
})

/** Class names that define the four font CSS variables on <html>. */
export const fontVariables = [
  archivo.variable,
  geistSans.variable,
  geistMono.variable,
  instrumentSerif.variable,
].join(' ')
