//MapControls.js
import React from 'react';

export default function MapControls({
  isEditMode,
  onToggleEditMode,
  onSave,
  onAddMode,
  onDeleteMode,
  isAddMode,
  isDeleteMode,
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <button onClick={onToggleEditMode}>
        {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      </button>
      {isEditMode && (
        <>
          <button onClick={onSave}>Save</button>
          <button onClick={onAddMode} disabled={isAddMode}>
            {isAddMode ? 'Add Mode Active' : 'Add Mode'}
          </button>
          <button onClick={onDeleteMode} disabled={isDeleteMode}>
            {isDeleteMode ? 'Delete Mode Active' : 'Delete Mode'}
          </button>
        </>
      )}
    </div>
  );
}


