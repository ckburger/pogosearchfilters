import { useRef } from 'react';

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
}

export function ImportExport({ onExport, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
      >
        Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
      >
        Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
