export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'tags' | 'select' | 'image';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: string[];
  rows?: number;
};

/**
 * The shape of every editable collection in the dashboard.
 *
 * One definition drives both the form and the payload, so a field can never
 * exist in the UI but be missing from the database row.
 */
/** The collections the dashboard can edit. */
export type EditableTable = 'projects' | 'services' | 'testimonials' | 'site_stats';

export const RECORD_FIELDS: Record<EditableTable, FieldDef[]> = {
  projects: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Astra Store' },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'astra-store',
      help: 'Used in the URL and as the unique key. Lowercase, dashes instead of spaces.',
    },
    {
      name: 'tagline',
      label: 'Tagline',
      type: 'text',
      placeholder: 'A storefront that converts',
    },
    {
      name: 'url',
      label: 'Live URL',
      type: 'text',
      placeholder: 'https://example.com',
      help: 'Leave empty if the project is not public yet.',
    },
    {
      name: 'accent',
      label: 'Accent colour',
      type: 'text',
      placeholder: '#35e4a3',
      help: 'Any CSS colour — it tints the card and the progress bar.',
    },
    { name: 'image_path', label: 'Cover image', type: 'image' },
    {
      name: 'tech',
      label: 'Tech stack',
      type: 'tags',
      placeholder: 'Next.js, Supabase, Stripe',
      help: 'One tag per line.',
    },
    { name: 'sort_order', label: 'Order', type: 'number', help: 'Lower comes first.' },
    { name: 'published', label: 'Published', type: 'boolean' },
  ],
  services: [
    { name: 'id', label: 'ID', type: 'text', placeholder: 'web-apps', help: 'Stable key — cannot be changed later.' },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Web apps' },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 4,
      placeholder: 'What you build and who it is for.',
    },
    { name: 'tags', label: 'Tags', type: 'tags', help: 'One tag per line.' },
    { name: 'sort_order', label: 'Order', type: 'number' },
    { name: 'published', label: 'Published', type: 'boolean' },
  ],
  testimonials: [
    { name: 'id', label: 'ID', type: 'text', placeholder: 'sara-m' },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Sara M.' },
    { name: 'role', label: 'Role / company', type: 'text', placeholder: 'Founder, Astra Store' },
    { name: 'message', label: 'Testimonial', type: 'textarea', rows: 5 },
    { name: 'sort_order', label: 'Order', type: 'number' },
    { name: 'published', label: 'Published', type: 'boolean' },
  ],
  site_stats: [
    { name: 'id', label: 'ID', type: 'text', placeholder: 'projects' },
    { name: 'label', label: 'Label', type: 'text', placeholder: 'Projects shipped' },
    { name: 'value', label: 'Value', type: 'number', help: 'The number the counter animates to.' },
    { name: 'suffix', label: 'Suffix', type: 'text', placeholder: '+' },
    { name: 'sort_order', label: 'Order', type: 'number' },
    { name: 'published', label: 'Published', type: 'boolean' },
  ],
};

export const TABLE_TITLES: Record<EditableTable, { singular: string; plural: string }> = {
  projects: { singular: 'Project', plural: 'Projects' },
  services: { singular: 'Service', plural: 'Services' },
  testimonials: { singular: 'Testimonial', plural: 'Testimonials' },
  site_stats: { singular: 'Stat', plural: 'Stats' },
};
