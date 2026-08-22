import { z } from 'zod';

export const cmsSectionSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  jsonContent: z.union([
    z.record(z.string(), z.any()),
    z.array(z.any())
  ]),
});
