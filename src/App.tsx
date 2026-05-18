import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MessageSquare, Wand2, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RecruitmentData } from './types';

export default function App() {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RecruitmentData | null>(null);
  const [activeTab, setActiveTab] = useState<'jd' | 'guide'>('jd');
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    setData(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (error) {
      console.error(error);
      alert('Failed to generate recruitment plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#E5E5E5] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Briefcase className="text-white w-4 h-4" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">RecruitSandbox</h1>
          </div>
          <div className="hidden sm:block text-xs font-medium text-[#9E9E9E] uppercase tracking-widest">
            AI-Powered Hiring Tool
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 items-start">
          
          {/* Left Side: Input */}
          <div className="space-y-8 flex flex-col items-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight leading-tight">
                Refine your recruitment <span className="italic text-[#9E9E9E]">vision.</span>
              </h2>
              <p className="text-[#9E9E9E] leading-relaxed">
                Paste your messy hiring notes, bullet points, or rough ideas below. We'll turn them into professional LinkedIn content.
              </p>
            </div>

            <div className="w-full space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, React/Vite/Tailwind, remote-first, needs to lead a small team, emphasize product mindset over just coding..."
                className="w-full h-64 p-5 rounded-2xl border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all resize-none shadow-sm"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !notes.trim()}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your plan...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Sandbox
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Output */}
          <div className="min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              {data ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex gap-1 p-1 bg-[#E5E5E5] rounded-xl self-start">
                    <button
                      onClick={() => setActiveTab('jd')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'jd' 
                          ? 'bg-white text-[#1A1A1A] shadow-sm' 
                          : 'text-[#9E9E9E] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Job Description
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('guide')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'guide' 
                          ? 'bg-white text-[#1A1A1A] shadow-sm' 
                          : 'text-[#9E9E9E] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Interview Guide
                      </div>
                    </button>
                  </div>

                  <div className="relative flex-grow bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 overflow-y-auto max-h-[700px] prose prose-sm prose-slate max-w-none prose-headings:font-semibold prose-a:text-[#1A1A1A]">
                      <ReactMarkdown>
                        {activeTab === 'jd' ? data.jobDescription : data.interviewGuide}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="p-4 border-t border-[#E5E5E5] bg-gray-50 flex justify-end">
                      <button
                        onClick={() => handleCopy(activeTab === 'jd' ? data.jobDescription : data.interviewGuide, activeTab)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-xs font-medium hover:bg-[#333] transition-all"
                      >
                        {copied === activeTab ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed border-[#E5E5E5] rounded-3xl"
                >
                  <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mb-6">
                    <Wand2 className="text-[#9E9E9E] w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Ready to transform your ideas?</h3>
                  <p className="text-[#9E9E9E] text-sm max-w-xs">
                    Once you generate your plan, your LinkedIn JD and Interview Guide will appear here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[#E5E5E5] flex flex-col md:flex-row justify-between items-center gap-4 text-[#9E9E9E] text-sm font-medium uppercase tracking-widest">
        <span>© 2026 RecruitSandbox</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">Documentation</a>
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
