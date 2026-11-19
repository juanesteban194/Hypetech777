const config = {
  '*.{ts,tsx,mts,js,mjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
}

export default config
