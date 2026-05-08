import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const theme = {
  primary: '#D4651A',
  primaryLight: '#FFF3E0',
  primaryBorder: '#FFD9B0',
  primaryDark: '#B5430A',
  text: '#1a0a00',
  textMuted: '#8B4513',
  bg: '#FFFAF5',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  students: any[];
  results: any[];
  announcements: any[];
  materials: any[];
  timetable: any[];
}

export default function AdminChatbot({ students, results, announcements, materials, timetable }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Divine Path assistant. I have access to all student data. Ask me anything like:\n\n• "Who has pending fees?"\n• "Show low attendance students"\n• "What are Rahul results?"\n• "How many students in Class 11?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const studentList = students.map(s => `ID: ${s.id}, Name: ${s.name}, Batch: ${s.batch}, Phone: ${s.phone}`).join('\n');
    const resultList = results.map(r => `Student: ${r.students?.name}, Subject: ${r.subject}, Marks: ${r.marks}/${r.total_marks} (${Math.round((r.marks/r.total_marks)*100)}%), Date: ${r.exam_date}`).join('\n');
    const announcementList = announcements.map(a => `Title: ${a.title}, Message: ${a.message}`).join('\n');
    const materialList = materials.map(m => `Title: ${m.title}, Subject: ${m.subject}`).join('\n');
    const timetableList = timetable.map(t => `Day: ${t.day}, Subject: ${t.subject}, Time: ${t.time}, Teacher: ${t.teacher}`).join('\n');

    return `You are an AI assistant for Divine Path Coaching Institute admin panel. You have access to the following data:

STUDENTS (${students.length} total):
${studentList || 'No students yet'}

RESULTS:
${resultList || 'No results yet'}

ANNOUNCEMENTS:
${announcementList || 'No announcements yet'}

MATERIALS:
${materialList || 'No materials yet'}

TIMETABLE:
${timetableList || 'No timetable yet'}

Answer admin questions based on this data. Be helpful, concise and accurate. Format your responses clearly.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildContext(),
          messages: [
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ],
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry I could not process that.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,101,26,0.4)', zIndex: 60 }}>
        {open ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: 90, right: 24, width: 360, height: 500, background: 'white', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: `1px solid ${theme.primaryBorder}`, display: 'flex', flexDirection: 'column', zIndex: 60, overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot size={20} color="white" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Divine Path AI</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Knows all student data</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
                    <Bot size={14} color={theme.primary} />
                  </div>
                )}
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? theme.primary : theme.primaryLight, color: msg.role === 'user' ? 'white' : theme.text, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
                    <User size={14} color="white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color={theme.primary} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: theme.primaryLight }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primary, animation: 'bounce 1s infinite', animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.primaryBorder}`, display: 'flex', gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about students..." style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${theme.primaryBorder}`, background: theme.bg, fontSize: 13, outline: 'none', color: theme.text }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: 40, height: 40, borderRadius: 12, background: input.trim() ? theme.primary : '#ccc', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}