import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId || !dataset) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET — copy .env.example to .env.local.',
  )
}

export default defineConfig({
  name: 'blabla-hijab',
  title: 'blabla hijab',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
