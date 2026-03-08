import { motion, AnimatePresence } from 'framer-motion';
import type { JournalEntry } from '../data/mockInsights';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  entry: JournalEntry | null;
  isAnalyzing: boolean;
}

export function InsightDetailPanel({ entry, isAnalyzing }: Props) {
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    setShowDone(false); // reset state when entry changes
  }, [entry?.id, entry?.insight]); 

  // If currently analyzing, show a loading/thinking state
  if (isAnalyzing) {
    return (
      <div className="empty-state">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Sparkles size={32} className="icon-gold" style={{opacity: 0.5}} />
        </motion.div>
        <p style={{marginTop: '20px'}}>大模型正在读取你的情绪，</p>
        <p>提炼导航行动中...</p>
      </div>
    );
  }

  // If no entry, or entry doesn't have insight generated yet
  if (!entry || !entry.insight) {
    return (
      <div className="empty-state">
        <p>在中间书写你的故事，</p>
        <p>点击「情绪炼金」获取行动导航。</p>
      </div>
    );
  }

  const { insight } = entry;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={entry.id + (insight ? 'done' : 'none')}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="detail-panel"
      >
        {/* Layer 1: Emotional Radar (Now at top, replacing the title which is in editor) */}
        <div className="layer-1">
          <h1 className="insight-title">情绪切片</h1>
        </div>

        <motion.div 
          className="layer-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="emotion-badge">{insight.emotion}</div>
          <motion.div 
            className="need-badge"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            背后需求：{insight.need}
          </motion.div>
        </motion.div>

        <motion.div
          className="logic-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {insight.logic}
        </motion.div>

        {/* Layer 3: Actionable Insight */}
        <motion.div 
          className="layer-3 action-box"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
        >
          <div className="action-header">
            <Sparkles size={18} className="icon-gold" />
            <h3>下一步：向内探索</h3>
          </div>
          <p className="action-content">{insight.action}</p>

          <AnimatePresence mode="wait">
            {!showDone ? (
              <motion.button 
                key="btn"
                className="action-btn"
                onClick={() => setShowDone(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                我已收到，准备出发 <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.div 
                key="msg"
                className="success-msg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✨ 祝你旅途愉快！
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
