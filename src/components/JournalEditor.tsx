import { useState, useEffect } from 'react';
import type { JournalEntry } from '../data/mockInsights';
import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  entry: JournalEntry | null;
  onUpdateContent: (content: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function JournalEditor({ entry, onUpdateContent, onAnalyze, isAnalyzing }: Props) {
  const [localContent, setLocalContent] = useState('');

  // Sync local state when a new entry is selected
  useEffect(() => {
    setLocalContent(entry?.content || '');
  }, [entry?.id]); // Only re-run when the selected ID changes

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onUpdateContent(e.target.value);
  };

  if (!entry) {
    return (
      <div className="editor-empty">
        <p>在左侧选择一篇日记，或点击下方新建草稿。</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2 className="editor-title">{entry.title || '无标题'}</h2>
        <div className="editor-meta">{entry.date}</div>
      </div>

      <textarea
        className="editor-textarea"
        placeholder="写下你此刻真实的感受..."
        value={localContent}
        onChange={handleTextChange}
      />

      <div className="editor-actions">
        <button 
          className="btn-analyze" 
          onClick={onAnalyze}
          disabled={isAnalyzing || !localContent.trim()}
        >
          {isAnalyzing ? (
            <><Loader2 size={16} className="spin" /> 炼金中...</>
          ) : (
            <><Sparkles size={16} /> 情绪炼金</>
          )}
        </button>
      </div>
    </div>
  );
}
