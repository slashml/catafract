# Image Generation Canvas - Implementation Documentation

## Overview

This is a node-based visual canvas application for AI-powered image generation and editing. Built with React Flow and Gemini's image generation API, it allows users to create complex image generation workflows by connecting nodes together.

## What Was Built

### Core Features

1. **Visual Node-Based Interface**
   - Drag-and-drop canvas powered by React Flow
   - Two types of nodes: Upload and Generation
   - Visual connections between nodes to pass images
   - Real-time updates when images are generated

2. **Upload Nodes**
   - File upload functionality for initial images
   - Display uploaded images within the node
   - Output handle to pass images to other nodes

3. **Generation Nodes**
   - Text prompt input field
   - Generate button to trigger API calls
   - Support for multiple image inputs from connected nodes
   - Display generated images within the node
   - Loading states during generation

4. **Gemini API Integration**
   - Uses `gemini-2.5-flash-image` model
   - Supports text-to-image generation
   - Supports image + text editing
   - Handles multiple input images for composition and style transfer

## Architecture

### File Structure

```
app/canvas/
├── page.tsx                      # Main canvas component
├── types.ts                      # TypeScript type definitions
└── components/
    ├── UploadNode.tsx           # Upload node component
    └── GenerationNode.tsx       # Generation node component

app/api/
└── generate-image/
    └── route.ts                 # API endpoint for image generation
```

### Component Hierarchy

```
Canvas Page (page.tsx)
├── Toolbar
│   ├── Upload Node Button
│   └── Generation Node Button
└── React Flow Canvas
    ├── Upload Nodes
    │   ├── File Input
    │   ├── Image Display
    │   └── Output Handle
    └── Generation Nodes
        ├── Prompt Input
        ├── Generate Button
        ├── Image Display
        ├── Input Handle (left)
        └── Output Handle (right)
```

## Technical Implementation

### 1. Upload Node Component (`UploadNode.tsx`)

**Key Features:**
- Accepts file uploads via HTML input element
- Converts uploaded files to base64 using FileReader API
- Emits custom events to update parent state
- Displays uploaded image preview
- Only has an output handle (source)

**Data Flow:**
```
User selects file → FileReader converts to base64 →
Custom event dispatched → Parent updates node data →
Image stored in node state → Available for connected nodes
```

### 2. Generation Node Component (`GenerationNode.tsx`)

**Key Features:**
- Text area for prompt input
- Generate button with loading state
- Displays generated images
- Has both input (left) and output (right) handles
- Supports receiving images from multiple connected nodes

**Data Flow:**
```
User enters prompt → Clicks Generate →
Custom event dispatched → Parent collects connected images →
API call with images + prompt → Generated image returned →
Node state updated with new image
```

### 3. Main Canvas Page (`page.tsx`)

**Responsibilities:**
- Manages all nodes and edges state
- Provides toolbar for adding new nodes
- Handles custom events from child nodes
- Orchestrates API calls for image generation
- Manages node connections and data flow

**Key Implementation Details:**

#### Node Creation
```typescript
const addUploadNode = useCallback(() => {
  const id = `upload-${nodeId}`;
  const newNode: Node<ImageNodeData> = {
    id,
    type: 'upload',
    position: { x: 100, y: 100 + nodeId * 50 },
    data: { type: 'upload' },
  };
  setNodes((nds) => [...nds, newNode]);
  setNodeId((prev) => prev + 1);
}, [nodeId]);
```

#### Image Generation Flow
1. Listen for `generateImage` custom event from Generation Node
2. Find all edges connected to the requesting node
3. Collect images from all source nodes
4. Make API call with collected images and prompt
5. Update node with generated image

```typescript
const connectedEdges = edges.filter((edge) => edge.target === nodeId);
const inputImages: string[] = [];

connectedEdges.forEach((edge) => {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  if (sourceNode?.data.image) {
    inputImages.push(sourceNode.data.image);
  }
});
```

### 4. API Route (`/api/generate-image/route.ts`)

**Endpoint:** `POST /api/generate-image`

**Request Format:**
```json
{
  "images": ["data:image/png;base64,...", "data:image/jpeg;base64,..."],
  "prompt": "Your prompt here"
}
```

**Response Format:**
```json
{
  "image": "data:image/png;base64,...",
  "text": "Optional text response from Gemini"
}
```

**Implementation Details:**

1. **Input Processing:**
   - Accepts array of base64-encoded images
   - Extracts MIME type from data URL
   - Removes data URL prefix for API call

2. **Gemini API Call:**
   - Uses `@google/genai` package
   - Model: `gemini-2.5-flash-image`
   - Sends images as `inlineData` objects
   - Sends prompt as text part

3. **Response Handling:**
   - Extracts generated image from response parts
   - Converts back to data URL for browser
   - Returns both image and any generated text

```typescript
const contents: any[] = [];

// Add images
for (const imageData of images) {
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  contents.push({
    inlineData: { mimeType, data: base64Data }
  });
}

// Add prompt
contents.push({ text: prompt });

// Generate
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: contents,
});
```

## How to Use

### Setup

1. **Install dependencies** (already done if you ran npm install):
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Copy `.env.local.example` to `.env.local`
   - Get your API key from https://aistudio.google.com/app/apikey
   - Add to `.env.local`:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Navigate to `/canvas`**

### Creating a Workflow

#### Basic Text-to-Image Generation
1. Click "+ Generation Node"
2. Enter a prompt (no image input needed)
3. Click "Generate"
4. Generated image appears in the node

> **Note:** You still need to connect at least one Upload Node or another Generation Node as input. For pure text-to-image, you'll need to modify the validation in `page.tsx`.

#### Image Editing (Image + Text → Image)
1. Click "+ Upload Node"
2. Upload an image
3. Click "+ Generation Node"
4. Connect Upload Node (right handle) to Generation Node (left handle)
5. Enter editing prompt (e.g., "Add a wizard hat to this image")
6. Click "Generate"
7. Edited image appears in Generation Node

#### Multi-Image Composition
1. Add multiple Upload Nodes
2. Upload different images
3. Add a Generation Node
4. Connect all Upload Nodes to the Generation Node
5. Enter composition prompt (e.g., "Combine these images in an artistic collage")
6. Click "Generate"

#### Iterative Refinement
1. Create an initial image (Upload or Generation Node)
2. Add a new Generation Node
3. Connect the first node to the new one
4. Enter refinement prompt (e.g., "Make the colors warmer")
5. Click "Generate"
6. Continue chaining nodes for progressive refinement

## Use Cases

### 1. Image Editing Pipeline
```
Upload Cat Photo → Add Hat → Change Background → Apply Style
```

### 2. Style Transfer
```
Upload Photo → Upload Style Reference → Generation Node → Stylized Output
```

### 3. Product Mockups
```
Upload Product → Upload Model → Generation Node → Product on Model
```

### 4. Iterative Design
```
Text Prompt → Generation → Refine Details → Adjust Colors → Final Image
```

## Technical Details

### Custom Events

The app uses browser custom events for child-to-parent communication:

**nodeDataUpdate Event:**
- Emitted when: Upload Node gets a new image
- Payload: `{ nodeId: string, data: ImageNodeData }`
- Purpose: Update parent state with new image data

**generateImage Event:**
- Emitted when: User clicks Generate button
- Payload: `{ nodeId: string, prompt: string }`
- Purpose: Trigger image generation flow

### State Management

- **Nodes State:** Array of all nodes with their data
- **Edges State:** Array of connections between nodes
- **Node ID Counter:** Incremental ID for new nodes

### Image Format

Images are stored and passed as data URLs:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
```

This format is used throughout:
- File upload → base64 conversion
- Node data storage
- API request/response
- Image display in nodes

### TypeScript Types

```typescript
export interface ImageNodeData {
  type: 'upload' | 'generation';
  image?: string;           // base64 data URL
  prompt?: string;          // text prompt for generation
  isGenerating?: boolean;   // loading state
}
```

## Limitations & Future Enhancements

### Current Limitations
1. Generation Nodes require at least one input image (can be modified to support pure text-to-image)
2. No error handling UI (errors shown in alerts)
3. No image download functionality
4. No workflow save/load
5. No undo/redo

### Potential Enhancements
1. **Pure Text-to-Image Support:** Remove the requirement for input images on Generation Nodes
2. **History Panel:** Show generation history with thumbnails
3. **Export Workflow:** Save/load canvas configurations as JSON
4. **Batch Processing:** Generate multiple variations at once
5. **Advanced Controls:** Aspect ratio, style presets, negative prompts
6. **Image Download:** Export individual or all images
7. **Better Error Handling:** Toast notifications instead of alerts
8. **Node Templates:** Pre-configured node setups for common tasks
9. **Collaborative Features:** Share workflows with others
10. **Generation Settings:** Expose Gemini's optional configs (aspect ratio, response modalities)

## Gemini API Features Used

### Image Generation Capabilities
- **Text-to-Image:** Generate from descriptions
- **Image + Text-to-Image:** Edit existing images
- **Multi-Image Composition:** Combine multiple images
- **Style Transfer:** Apply artistic styles
- **Iterative Refinement:** Progressive improvements

### Model: gemini-2.5-flash-image
- Fast generation times
- Supports multiple image inputs (works best with up to 3)
- Built-in SynthID watermarking
- High-fidelity text rendering
- Conversational, context-aware generation

## API Reference

### POST /api/generate-image

**Request Body:**
```typescript
{
  images: string[];    // Array of base64 data URLs
  prompt: string;      // Text prompt for generation
}
```

**Success Response (200):**
```typescript
{
  image: string;       // Generated image as base64 data URL
  text?: string;       // Optional text response from model
}
```

**Error Responses:**
- `400`: Missing images or prompt
- `500`: API key not configured or generation failed

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional (will try NEXT_PUBLIC_GEMINI_API_KEY if set)
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## Dependencies

### Production
- `@google/genai` - Gemini API client
- `@xyflow/react` - React Flow for node-based UI
- `react` & `react-dom` - React framework
- `next` - Next.js framework

### Development
- `typescript` - Type safety
- `@types/*` - Type definitions

## Troubleshooting

### "GEMINI_API_KEY not configured"
- Make sure you created `.env.local` file
- Verify the API key is correct
- Restart the dev server after adding the key

### "No images provided" error
- Ensure Upload Nodes have images uploaded
- Verify connections are properly established
- Check that source nodes are before target nodes in the flow

### Images not displaying
- Check browser console for errors
- Verify image format is valid base64
- Ensure MIME type is supported (png, jpeg, jpg)

### Generation fails silently
- Open browser console for detailed errors
- Check API key validity
- Verify internet connection
- Check Gemini API status

## Credits

- Built with React Flow: https://reactflow.dev/
- Powered by Google Gemini API: https://ai.google.dev/
- Image generation model: gemini-2.5-flash-image

---

**Created:** 2025-11-18
**Framework:** Next.js 16.0.1
**React:** 19.2.0
**TypeScript:** 5.x
