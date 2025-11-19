'use client';

import { memo, useCallback, ChangeEvent } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ImageNode } from '../types';

function UploadNode({ data, id }: NodeProps<ImageNode>) {
  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Update node data with the uploaded image
        data.image = result;
        // Force re-render by triggering a state update in parent
        window.dispatchEvent(new CustomEvent('nodeDataUpdate', {
          detail: { nodeId: id, data: { ...data, image: result } }
        }));
      };
      reader.readAsDataURL(file);
    }
  }, [data, id]);

  return (
    <div style={{
      padding: '10px',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      background: 'white',
      minWidth: '200px',
    }}>
      <div style={{
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#3b82f6',
      }}>
        Upload Image
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{
          marginBottom: '10px',
          fontSize: '12px',
        }}
      />

      {data.image && (
        <div style={{ marginTop: '10px' }}>
          <img
            src={data.image}
            alt="Uploaded"
            style={{
              width: '100%',
              maxWidth: '200px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            }}
          />
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#3b82f6',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
}

export default memo(UploadNode);
