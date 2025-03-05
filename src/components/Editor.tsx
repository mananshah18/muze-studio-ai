import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, onChange }) => {
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: true,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
    minimap: {
      enabled: false
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gray-900">
      <div className="h-full w-full">
        <MonacoEditor
          width="100%"
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          options={editorOptions}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Editor; 