
import React from 'react';
import { motion } from 'framer-motion';
import { Target, FileText, Github } from 'lucide-react';
import { Button } from './Button';
import devLogData from '../devLog.json';

const stripeKeyframes = `
  @keyframes stripeMove {
    0% { background-position: 0 0; }
    100% { background-position: 11.31px 11.31px; }
  }
`;

interface RuleSceneProps {
  onBack: () => void;
}

const COLOR_CLASSES: Record<string, string> = {
  pink: 'text-pink-500',
  cyan: 'text-cyan-600',
  slate: 'text-slate-800',
};

export const RuleScene: React.FC<RuleSceneProps> = ({ onBack }) => {
  return (
    <>
      <style>{stripeKeyframes}</style>
      <motion.div 
      key="rules" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[50] flex flex-col items-center justify-start h-full w-full p-4 md:p-8 pt-24 bg-slate-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5 pointer-events-none" />
      
      <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-8 max-w-4xl w-full border border-slate-200 h-[85vh] flex flex-col relative z-10 overflow-hidden">
        {/* Animated stripes background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #000 0px,
            #000 1px,
            transparent 1px,
            transparent 8px
          )`,
          backgroundSize: '11.31px 11.31px',
          animation: 'stripeMove 1s linear infinite',
        }} />
        
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3 shrink-0">
          <Target className="text-cyan-500" /> 战术手册 Ver.3
        </h2>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
            {/* Rules Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-lg text-cyan-600 mb-2 flex items-center gap-2">
                    <span className="w-2 h-6 bg-cyan-500 rounded-full"/> 胜利条件
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
                  <li><strong>条件A:</strong> 标准五子连珠。</li>
                  <li><strong>条件B:</strong> 积攒满 <strong>5点</strong> SP (技能点)。</li>
                  <li><strong>条件C:</strong> 对手时间耗尽。</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-lg text-pink-600 mb-2 flex items-center gap-2">
                    <span className="w-2 h-6 bg-pink-500 rounded-full"/> 时限规则
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
                  <li>每位玩家拥有 <strong>240秒 (4分钟)</strong> 的基础时间。</li>
                  <li>每次行动结束，获得 <strong>+10秒</strong> 的回复时间。</li>
                  <li>时间归零直接判负。</li>
                </ul>
              </div>
            </div>

            {/* Dev Log Section */}
            <div className="mt-4 border-t border-slate-200 pt-6">
              <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-slate-500" /> 开发部日志 / Dev Log
              </h3>
              
              <div className="space-y-4 font-mono text-xs md:text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                
                {/* Logs from JSON */}
                {devLogData.logs.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="text-slate-400 font-bold shrink-0 w-24">{log.date}</div>
                    <div>
                      <span className={`font-bold ${COLOR_CLASSES[log.color] || 'text-slate-800'}`}>
                        {log.highlight}:
                      </span>
                      <span className="text-slate-600">{log.content}</span>
                    </div>
                  </div>
                ))}

                <div className="my-4 border-t border-dashed border-slate-300" />

                {/* Special Thanks */}
                <div className="flex gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4 mb-4">
                    <div className="text-yellow-600 font-bold shrink-0 w-24">{devLogData.specialThanks.title}</div>
                    <div 
                      className="italic text-slate-600"
                      dangerouslySetInnerHTML={{ __html: devLogData.specialThanks.content }}
                    />
                </div>

                <div className="my-4 border-t border-dashed border-slate-300" />

                {/* Wanted */}
                <div className="flex gap-3 pt-2 border-t border-slate-200 border-dashed">
                    <div className="text-red-400 font-bold shrink-0 w-24">{devLogData.wanted.title}</div>
                    <div className="italic text-slate-500">
                    {devLogData.wanted.content}
                    </div>
                </div>
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 text-center md:text-left">
              <div className="font-bold text-slate-700 mb-1">Developer: linxixi233</div>
              <div className="text-[10px] md:text-xs leading-tight opacity-70">
                Assets & Music © NEXON Games Co., Ltd.<br/>
                本网站仅供学习与交流使用 (For Educational Purpose Only)
              </div>
            </div>
            <div className="flex gap-3">
              <a href="https://github.com/linxixi233" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold shadow-md">
                <Github size={16} /> GitHub
              </a>
              <Button variant="secondary" onClick={onBack} className="py-2 text-sm">
                返回
              </Button>
            </div>
          </div>
        </div>

      </div>
      </motion.div>
      
      {/* Animated GIFs row - outside the white panel, at bottom of gray background */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none z-[60]">
        {['admire.gif', 'clap.gif', 'draw.gif', 'good.gif', 'hacido.gif', 'hengheng.gif', 'ski.gif', 'want.gif'].map((gif, index) => (
          <img 
            key={index}
            src={`/res/${gif}`}
            alt=""
            className="w-14 md:w-18 lg:w-20 opacity-75"
          />
        ))}
      </div>
    </>
  );
};
