import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['node_modules/**', 'out/**', '.next/**', '.turbo/**', 'build/**'],
  },
]
