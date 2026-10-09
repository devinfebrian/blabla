import { defineArrayMember, defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'fabric', title: 'Fabric', type: 'string' }),
    defineField({ name: 'care', title: 'Care', type: 'text', rows: 2 }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Shown on the catalogue grid.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'model',
      title: '3D model',
      type: 'object',
      fields: [
        defineField({
          name: 'glbUrl',
          title: 'GLB URL',
          type: 'string',
          description: 'Absolute URL or root-relative path, e.g. /models/hijab.glb',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'fabricMaterialName',
          title: 'Fabric material name',
          type: 'string',
          initialValue: 'Fabric',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'colors',
      title: 'Colors',
      type: 'array',
      of: [defineArrayMember({ type: 'colorVariant' })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})
