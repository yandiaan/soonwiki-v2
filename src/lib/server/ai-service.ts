import { SOON_GENERATIONS } from '@/lib/shared/generations';

export interface ExtractedJourney {
  activity: string;
  placeName?: string | undefined;
  startYear?: number | undefined;
  endYear?: number | undefined;
  story?: string | undefined;
}

export interface ExtractedProfileData {
  name?: string | undefined;
  generationKey?: string | undefined;
  bio?: string | undefined;
  location?: string | undefined;
  currentActivity?: string | undefined;
  currentPlaceName?: string | undefined;
  sinceSoonStory?: string | undefined;
  turningPointStory?: string | undefined;
  currentDirectionStory?: string | undefined;
  linkedinUrl?: string | undefined;
  instagramUrl?: string | undefined;
  websiteUrl?: string | undefined;
  journeys: ExtractedJourney[];
  fieldIds: string[];
}

export type AiExtractResult =
  | { ok: true; data: ExtractedProfileData; modelUsed: string }
  | { ok: false; error: string; message: string };

function parseJsonFromText(rawText: string): Record<string, unknown> | null {
  try {
    return JSON.parse(rawText);
  } catch {
    // Attempt markdown JSON codeblock extraction
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Fall through
      }
    }

    // Attempt substring from first '{' to last '}'
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch {
        // Fall through
      }
    }
  }
  return null;
}

export async function extractProfileFromText(
  rawText: string,
  availableFields: { id: string; name: string; slug: string }[],
): Promise<AiExtractResult> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY || '';

  if (!apiKey || apiKey.trim() === '') {
    return {
      ok: false,
      error: 'API_KEY_MISSING',
      message:
        'Kunci API OpenRouter belum dikonfigurasi di file environment (.env). Silakan isi OPENROUTER_API_KEY di file .env project kamu terlebih dahulu.',
    };
  }

  const primaryModel = import.meta.env.OPENROUTER_MODEL || 'z-ai/glm-5.2:free';
  const fallbackModel = import.meta.env.OPENROUTER_FALLBACK_MODEL || 'minimax/minimax-m3:free';

  const generationsContext = SOON_GENERATIONS.map((g) => `${g.key} (${g.name})`).join(', ');
  const fieldsContext = availableFields.map((f) => `ID: "${f.id}" -> Nama: "${f.name}"`).join('\n');

  const systemPrompt = `Kamu adalah asisten kurasi data profil profesional dan arsiparis SoonWiki (wiki alumni SOON).
Tugasmu adalah membaca teks deskripsi bebas, resume/CV, atau ringkasan profil alumni yang diberikan pengguna, lalu mengekstrak data profil ke dalam format JSON terstruktur yang valid.

KONTEKS ANGKATAN SOON (pilih generationKey yang paling sesuai jika disebutkan):
${generationsContext}

DAFTAR BIDANG KEAHLIAN / TAXONOMY YANG TERSEDIA (Pilih fieldIds yang sesuai):
${fieldsContext}

ATURAN EKSTRAKSI:
1. Ekstrak data dalam Bahasa Indonesia yang lugas, hangat, dan profesional.
2. Format JSON output HARUS berupa objek dengan skema berikut:
{
  "name": "Nama Lengkap (atau null jika tidak ada)",
  "generationKey": "key angkatan dari daftar di atas (atau null jika tidak yakin)",
  "bio": "Ringkasan bio singkat 1-2 kalimat (maks 300 karakter)",
  "location": "Kota / Wilayah domisili saat ini (contoh: 'Jakarta Selatan' atau 'Kotabaru, Kalsel')",
  "currentActivity": "Profesi / Peran / Jabatan saat ini (contoh: 'Senior Frontend Engineer')",
  "currentPlaceName": "Nama Perusahaan / Kampus / Tempat berkarya saat ini (contoh: 'Tokopedia')",
  "sinceSoonStory": "Cerita ringkas mengenai perjalanan setelah masa-masa di SOON (2-4 paragraf yang mengalir rapi)",
  "turningPointStory": "Momen titik balik atau keputusan penting dalam karier/hidup jika ada diceritakan",
  "currentDirectionStory": "Fokus, cita-cita, atau apa yang sedang ditekuni saat ini",
  "linkedinUrl": "https://linkedin.com/in/... (hanya jika ada format URL valid)",
  "instagramUrl": "https://instagram.com/... (hanya jika ada format URL valid)",
  "websiteUrl": "https://... (hanya jika ada format URL valid)",
  "journeys": [
    {
      "activity": "Nama Peran / Posisi / Pendidikan",
      "placeName": "Nama Perusahaan / Organisasi / Institusi",
      "startYear": 2020,
      "endYear": 2022,
      "story": "Ringkasan kontribusi atau pengalaman singkat"
    }
  ],
  "fieldIds": ["id_bidang_1", "id_bidang_2"]
}

3. JANGAN mengarang data (hallucinate) jika tidak ada di teks pengguna; gunakan null atau array kosong.
4. Output HANYA JSON murni tanpa pembuka kata apapun di luar JSON.`;

  const modelsToTry = [primaryModel, fallbackModel].filter(Boolean);

  let lastErrorMessage = '';

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.soonwiki.com',
          'X-Title': 'SoonWiki AI Quick Fill',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Berikut teks profil/resume yang ingin diekstrak ke dalam SoonWiki:\n\n${rawText}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`OpenRouter model ${model} failed (${response.status}):`, errorText);
        lastErrorMessage = `Model ${model} gagal (${response.status}): ${errorText}`;
        continue;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const rawContent = data.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        lastErrorMessage = `Model ${model} mengembalikan respons kosong.`;
        continue;
      }

      const parsed = parseJsonFromText(rawContent);
      if (!parsed) {
        lastErrorMessage = `Gagal mengurai respons JSON dari model ${model}.`;
        continue;
      }

      // Sanitize and structure output data
      const extracted: ExtractedProfileData = {
        name: typeof parsed.name === 'string' && parsed.name ? parsed.name : undefined,
        generationKey:
          typeof parsed.generationKey === 'string' &&
          SOON_GENERATIONS.some((g) => g.key === parsed.generationKey)
            ? parsed.generationKey
            : undefined,
        bio: typeof parsed.bio === 'string' && parsed.bio ? parsed.bio.slice(0, 500) : undefined,
        location:
          typeof parsed.location === 'string' && parsed.location
            ? parsed.location.slice(0, 120)
            : undefined,
        currentActivity:
          typeof parsed.currentActivity === 'string' && parsed.currentActivity
            ? parsed.currentActivity.slice(0, 200)
            : undefined,
        currentPlaceName:
          typeof parsed.currentPlaceName === 'string' && parsed.currentPlaceName
            ? parsed.currentPlaceName.slice(0, 160)
            : undefined,
        sinceSoonStory:
          typeof parsed.sinceSoonStory === 'string' && parsed.sinceSoonStory
            ? parsed.sinceSoonStory.slice(0, 1200)
            : undefined,
        turningPointStory:
          typeof parsed.turningPointStory === 'string' && parsed.turningPointStory
            ? parsed.turningPointStory.slice(0, 1200)
            : undefined,
        currentDirectionStory:
          typeof parsed.currentDirectionStory === 'string' && parsed.currentDirectionStory
            ? parsed.currentDirectionStory.slice(0, 1200)
            : undefined,
        linkedinUrl:
          typeof parsed.linkedinUrl === 'string' && parsed.linkedinUrl.startsWith('https://')
            ? parsed.linkedinUrl
            : undefined,
        instagramUrl:
          typeof parsed.instagramUrl === 'string' && parsed.instagramUrl.startsWith('https://')
            ? parsed.instagramUrl
            : undefined,
        websiteUrl:
          typeof parsed.websiteUrl === 'string' && parsed.websiteUrl.startsWith('https://')
            ? parsed.websiteUrl
            : undefined,
        journeys: Array.isArray(parsed.journeys)
          ? parsed.journeys
              .filter(
                (j): j is Record<string, unknown> =>
                  typeof j === 'object' && j !== null && typeof j.activity === 'string',
              )
              .map((j) => ({
                activity: String(j.activity).slice(0, 200),
                placeName: typeof j.placeName === 'string' ? j.placeName.slice(0, 160) : '',
                startYear: typeof j.startYear === 'number' ? j.startYear : undefined,
                endYear: typeof j.endYear === 'number' ? j.endYear : undefined,
                story: typeof j.story === 'string' ? j.story.slice(0, 1200) : '',
              }))
          : [],
        fieldIds: Array.isArray(parsed.fieldIds)
          ? (
              parsed.fieldIds.filter((id): id is string => typeof id === 'string') as string[]
            ).filter((id) => availableFields.some((f) => f.id === id))
          : [],
      };

      return {
        ok: true,
        data: extracted,
        modelUsed: model,
      };
    } catch (err) {
      console.warn(`Error querying OpenRouter model ${model}:`, err);
      lastErrorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    ok: false,
    error: 'AI_EXTRACTION_FAILED',
    message: `Gagal memproses ekstraksi dengan AI. ${lastErrorMessage || 'Silakan periksa koneksi atau coba sesaat lagi.'}`,
  };
}
