import { useState } from 'react';
import { InsightList } from './components/InsightList';
import { InsightDetailPanel } from './components/InsightDetailPanel';
import { JournalEditor } from './components/JournalEditor';
import { mockInsights, type JournalEntry } from './data/mockInsights';
import './index.css';

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockInsights);
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeEntry = entries.find(e => e.id === activeId) || null;

  // Create a new blank draft
  const handleNewDraft = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: '无标题草稿',
      content: ''
    };
    setEntries([newEntry, ...entries]);
    setActiveId(newEntry.id);
  };

  // Keep local editor changes synced to the main state
  const handleUpdateContent = (content: string) => {
    if (!activeId) return;
    setEntries(prev => prev.map(e => {
      if (e.id === activeId) {
        // Simple auto-title based on first few words
        const title = content ? content.slice(0, 15) + (content.length > 15 ? '...' : '') : '无标题草稿';
        return { ...e, content, title };
      }
      return e;
    }));
  };

  // Call the Netlify Serverless Function
  const handleAnalyze = async () => {
    if (!activeEntry || !activeEntry.content.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: activeEntry.content }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const insightData = await response.json();

      setEntries(prev => prev.map(e => 
        e.id === activeId ? { ...e, insight: insightData } : e
      ));

    } catch (error) {
      console.error(error);
      alert("大模型提炼失败，请稍后重试");
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="app-container">
      <InsightList 
        insights={entries} 
        activeId={activeId} 
        onSelect={setActiveId}
        onNew={handleNewDraft}
      />
      
      <div className="editor-wrapper">
         <JournalEditor 
           entry={activeEntry}
           onUpdateContent={handleUpdateContent}
           onAnalyze={handleAnalyze}
           isAnalyzing={isAnalyzing}
         />
      </div>

      <div className="detail-wrapper">
        <InsightDetailPanel 
          entry={activeEntry} 
          isAnalyzing={isAnalyzing} 
        />
      </div>
    </div>
  );
}

export default App;
