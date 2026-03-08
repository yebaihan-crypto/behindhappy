import { useState, useEffect, useRef } from 'react';
import { InsightList } from './components/InsightList';
import { InsightDetailPanel } from './components/InsightDetailPanel';
import { JournalEditor } from './components/JournalEditor';
import type { JournalEntry } from './data/mockInsights';
import { supabase } from './lib/supabase';
import './index.css';

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounce saving timer
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
      return;
    }

    if (data && data.length > 0) {
      // Map back from Supabase JSON structure to our JournalEntry interface
      const loadedEntries: JournalEntry[] = data.map((row: any) => row.entry_data);
      setEntries(loadedEntries);
      setActiveId(loadedEntries[0].id);
    }
    
    setIsInitialized(true);
  };

  const saveToSupabase = async (entryToSave: JournalEntry) => {
    const { error } = await supabase
      .from('journal_entries')
      .upsert({
        id: entryToSave.id,               // Primary Key matching exactly what we built in V1
        date: entryToSave.date,           // Required unique date/identifier
        entry_data: entryToSave           // Store the full nested object in the JSONB column
      });

    if (error) {
      console.error('Failed to save to Supabase:', error);
    }
  };

  const activeEntry = entries.find(e => e.id === activeId) || null;

  // Create a new blank draft
  const handleNewDraft = async () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(), // Or uuid() if strictly matching
      date: new Date().toISOString(),
      title: '无标题草稿',
      content: ''
    };
    
    // Update local state instantly
    setEntries([newEntry, ...entries]);
    setActiveId(newEntry.id);
    
    // Push the blank placeholder to Supabase immediately
    await saveToSupabase(newEntry);
  };

  // Keep local editor changes synced and debounced to Supabase
  const handleUpdateContent = (content: string) => {
    if (!activeId) return;
    
    setEntries(prev => prev.map(e => {
      if (e.id === activeId) {
        const title = content ? content.slice(0, 15) + (content.length > 15 ? '...' : '') : '无标题草稿';
        const updatedEntry = { ...e, content, title };
        
        // Debounce the save to prevent hitting DB on every keystroke
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => {
           saveToSupabase(updatedEntry);
        }, 1000); // Save 1 second after user stops typing
        
        return updatedEntry;
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

      const updatedInsight = { ...activeEntry, insight: insightData };

      // Update Local State
      setEntries(prev => prev.map(e => 
        e.id === activeId ? updatedInsight : e
      ));

      // Persist the new golden insight box to Supabase
      await saveToSupabase(updatedInsight);

    } catch (error) {
      console.error(error);
      alert("大模型提炼失败，请稍后重试");
    } finally {
      setIsAnalyzing(false);
    }
  };


  if (!isInitialized) {
     return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color: '#888681'}}>连接云端记忆中...</div>;
  }

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
