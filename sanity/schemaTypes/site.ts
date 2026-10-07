import { defineField, defineType } from 'sanity'

export const site = defineType({
  name: 'site',
  title: 'Site',
  type: 'document',
  fields: [
    defineField({
      name: 'brandName',
      title: 'Brand name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      description: 'E.164 digits only, no "+" (e.g. 6281234567890).',
      validation: (rule) => rule.required().regex(/^[0-9]+$/),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: { list: ['IDR', 'USD', 'EUR'], layout: 'radio' },
      initialValue: 'IDR',
      validation: (rule) => rule.required(),
    }),
  ],
})
