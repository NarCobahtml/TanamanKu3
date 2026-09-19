const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chxnfvwdldhpickamcpm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'tanamanku-uploads';

/**
 * Upload binary buffer to Supabase Storage and return its public URL
 */
export async function uploadToStorage({
  fileBuffer,
  filePath,
  contentType,
}: {
  fileBuffer: Buffer;
  filePath: string;
  contentType: string;
}): Promise<string> {
  if (!SUPABASE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env');
  }

  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'x-upsert': 'true',
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Storage upload error:', errText);
    throw new Error(`Gagal mengunggah gambar ke storage: ${res.statusText}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
}

/**
 * Delete a file from Supabase Storage by its public URL or relative path
 */
export async function deleteFromStorage(publicUrlOrPath: string): Promise<boolean> {
  if (!publicUrlOrPath || !SUPABASE_KEY) return false;

  try {
    let relativePath = publicUrlOrPath;

    const publicPrefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
    if (publicUrlOrPath.includes(publicPrefix)) {
      relativePath = publicUrlOrPath.split(publicPrefix)[1];
    } else if (publicUrlOrPath.startsWith('http')) {
      // Not stored in this Supabase bucket, skip
      return false;
    }

    if (!relativePath) return false;

    const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${relativePath}`;

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    });

    if (!res.ok) {
      console.warn(`Gagal menghapus file lama ${relativePath}:`, res.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete from storage error:', err);
    return false;
  }
}
