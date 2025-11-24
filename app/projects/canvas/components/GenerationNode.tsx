'use client';

import { memo, useCallback, useState, ChangeEvent } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ImageNode } from '../types';
import { Image as ImageIcon } from 'lucide-react';

function GenerationNode({ data, id }: NodeProps<ImageNode>) {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    data.prompt = event.target.value;
  }, [data]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const event = new CustomEvent('generateImage', {
        detail: { nodeId: id, prompt }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, id]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating Header */}
      <div
        style={{
          position: 'absolute',
          top: '-24px',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <ImageIcon className="w-3 h-3 text-gray-500" />
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Image Generator
        </span>
      </div>

      {/* Main Container */}
      <div
        style={{
          padding: '0',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          background: 'white',
          minWidth: '280px',
          minHeight: '280px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Image Display */}
        {data.image && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={data.image}
              alt="Generated"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              pointerEvents: 'none',
            }} />
          </div>
        )}

        {/* Content Area */}
        <div style={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: data.image ? 'flex-end' : 'flex-start',
          zIndex: 1,
          position: 'relative',
          height: '100%',
        }}>
          {/* Prompt Input / Overlay */}
          <div style={{ marginBottom: data.image ? '0' : '12px' }}>
            {!data.image && (
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: '#6b7280',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Prompt
              </label>
            )}

            {data.image ? (
              <p style={{
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}>
                {prompt}
              </p>
            ) : (
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Describe your image..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  resize: 'vertical',
                  background: '#f9fafb',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            )}
          </div>

          {/* Generate Button - Only show if no image or generating */}
          {(!data.image || isGenerating) && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isGenerating ? '#9ca3af' : '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'background-color 0.2s',
                marginTop: 'auto',
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
          )}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '24px',
          height: '24px',
          background: '#1f2937',
          border: '2px solid white',
          borderRadius: '50%',
          left: '-12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <ImageIcon className="w-3 h-3 text-white" />
      </Handle>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '24px',
          height: '24px',
          background: '#1f2937',
          border: '2px solid white',
          borderRadius: '50%',
          right: '-12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <ImageIcon className="w-3 h-3 text-white" />
      </Handle>
    </div>
  );
}

export default memo(GenerationNode);
