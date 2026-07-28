import React from 'react';
import { DocumentProject } from './types';

interface BatchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjects: DocumentProject[];
  onBatchFilterSuccess: (updatedProjects: DocumentProject[]) => void;
}

export const BatchFilterModal: React.FC<BatchFilterModalProps> = ({ isOpen, onClose, selectedProjects, onBatchFilterSuccess }) => {
  if (!isOpen) return null;

  const applyDummyFilter = () => {
    // For now, return projects unchanged as a placeholder
    onBatchFilterSuccess(selectedProjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-lg space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Filter</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Close</button>
        </div>

        <p className="text-xs text-slate-500">Apply a filter to {selectedProjects.length} selected document(s).</p>

        <div className="max-h-40 overflow-auto border border-slate-100 dark:border-slate-800 rounded p-2">
          {selectedProjects.map((p) => (
            <div key={p.id} className="text-xs text-slate-700 dark:text-slate-200 py-1 border-b last:border-b-0">{p.title}</div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={applyDummyFilter} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold">Apply Filter</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BatchFilterModal;
