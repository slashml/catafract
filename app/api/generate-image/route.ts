import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { images, prompt } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured. Please add GEMINI_API_KEY to your .env.local file' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare the contents array with images and prompt
    const contents: any[] = [];

    // Add all input images
    for (const imageData of images) {
      // Remove data URL prefix if present to get pure base64
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

      // Detect mime type from data URL
      const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    // Add the text prompt
    contents.push({ text: prompt });

    // Generate image using Gemini 2.5 Flash Image model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

    // Extract the generated image from the response
    let generatedImageBase64 = null;
    let generatedText = null;

    const partResponse = response?.candidates?.[0]?.content?.parts;

    if (!partResponse) {
      return NextResponse.json(
        { error: 'No image or text generated' },
        { status: 500 }
      );
    }

    for (const part of partResponse) {
      if (part.text) {
        generatedText = part.text;
      } else if (part.inlineData) {
        // Get the base64 image data
        generatedImageBase64 = part.inlineData.data;

        // Detect the mime type from the response
        const mimeType = part.inlineData.mimeType || 'image/png';

        // Create a proper data URL for the browser
        generatedImageBase64 = `data:${mimeType};base64,${generatedImageBase64}`;
        break; // Use the first image
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        {
          error: 'No image was generated',
          text: generatedText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: generatedImageBase64,
      text: generatedText,
    });

  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
