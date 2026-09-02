import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ success: false, error: 'No audio provided' }, { status: 400 });
    }

    // If external AI Whisper/Groq API key is present in environment, call it
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append('file', audioFile, 'audio.webm');
        groqFormData.append('model', 'whisper-large-v3');
        groqFormData.append('language', 'en');

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
          },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          return NextResponse.json({ success: true, text: data.text || '' });
        }
      } catch (e) {
        console.error('Groq transcription error:', e);
      }
    }

    if (openaiKey) {
      try {
        const oaiFormData = new FormData();
        oaiFormData.append('file', audioFile, 'audio.webm');
        oaiFormData.append('model', 'whisper-1');

        const oaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiKey}`,
          },
          body: oaiFormData,
        });

        if (oaiRes.ok) {
          const data = await oaiRes.json();
          return NextResponse.json({ success: true, text: data.text || '' });
        }
      } catch (e) {
        console.error('OpenAI Whisper transcription error:', e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      text: '', 
      message: 'Audio received successfully' 
    });
  } catch (error: any) {
    console.error('Transcribe API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
