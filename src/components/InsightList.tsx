import type { JournalEntry } from '../data/mockInsights';
import { Plus } from 'lucide-react';

interface Props {
  insights: JournalEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function InsightList({ insights, activeId, onSelect, onNew }: Props) {
  return (
    <div className="insight-list">
      <div className="list-header">
        <h2 className="list-title">过往日记</h2>
      </div>
      
      <div className="list-items">
        {insights.map(insight => (
          <div 
            key={insight.id} 
            className={`list-item ${activeId === insight.id ? 'active' : ''}`}
            onClick={() => onSelect(insight.id)}
          >
            <div className="item-date">{insight.date}</div>
            <div className="item-title">{insight.title || '无标题草稿'}</div>
            {insight.insight && <div className="item-badge">已炼金</div>}
          </div>
        ))}
      </div>

      <button className="btn-new" onClick={onNew}>
        <Plus size={18} /> 新建空白页
      </button>
    </div>
  );
}
