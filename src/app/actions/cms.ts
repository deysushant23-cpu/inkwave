'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cmsSectionSchema } from '@/lib/validations/cms.schema';
import { verifyAdmin } from '@/lib/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveCmsSectionAction(sectionKey: string, jsonContent: any) {
  try {
    const parseResult = cmsSectionSchema.safeParse({ sectionKey, jsonContent });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid CMS data' };
    }
    const { sectionKey: vSectionKey, jsonContent: vJsonContent } = parseResult.data;
    await verifyAdmin();
    // 1. Create the admin client for service-role bypass
    const adminClient = await createAdminClient();

    // 4. Check if section already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (adminClient.from('cms_sections') as any)
      .select('id')
      .eq('section_key', vSectionKey)
      .single();

    let res;
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res = await (adminClient.from('cms_sections') as any)
        .update({ 
          json_content: vJsonContent, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res = await (adminClient.from('cms_sections') as any)
        .insert([{ 
          section_key: vSectionKey, 
          json_content: vJsonContent, 
          is_published: true 
        }]);
    }

    if (res.error) throw new Error(res.error.message);
    
    revalidatePath('/', 'layout');
    
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { success: false, error: err.message || 'An unknown error occurred while saving.' };
  }
}
