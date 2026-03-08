// src/data/mockInsights.ts

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  insight?: {
    emotion: string;
    need: string;
    logic: string;
    action: string;
  };
}

export const mockInsights: JournalEntry[] = [
  {
    id: '1',
    date: '2026-03-08',
    title: '那个没回消息的人',
    content: '今天给他发了很长一段走心的话，但是他一直没回。我觉得有点挫败，甚至有点怀疑自己是不是又说错话了。',
    insight: {
      emotion: '孤独',
      need: '深度链接',
      logic: '孤独提醒你，目前的社交浮于表面，缺乏灵魂的碰撞。',
      action: '与其在群聊中寻找存在感，不如约一位好友进行一次不带手机的深度长谈，或者通过写作完成一次‘自我对话’。'
    }
  },
  {
    id: '2',
    date: '2026-03-07',
    title: '无标题草稿',
    content: '看到前同事拿到了大厂的高薪 Offer，表面上恭喜他，其实心里一直酸溜溜的，觉得凭什么是他。',
    insight: {
      emotion: '嫉妒',
      need: '自我实现、职业安全感',
      logic: '嫉妒是你潜意识在“点菜”。既然你会嫉妒，说明你认为自己有能力且应该拥有它。',
      action: '拆解对方的成功路径，把“酸味”化作为期 3 个月的技能补课计划。'
    }
  }
];
