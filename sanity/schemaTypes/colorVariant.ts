import { defineField, defineType } from 'sanity'

export const colorVariant = defineType({
  name: 'colorVariant',
  title: 'Color variant',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Key',
      type: 'string',
      description: 'Stable id used in the URL as ?color=<key> (lowercase, hyphens).',
      validation: (rule) => rule.required().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hex',
      title: 'Hex color',
      type: 'string',
      description: 'e.g. #C98B8B',
      validation: (rule) => rule.required().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: { list: ['IDR', 'USD', 'EUR'], layout: 'radio' },
      initialValue: 'IDR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'inStock',
      title: 'In stock',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'sku', title: 'SKU', type: 'string' }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] }),
  ],
})
