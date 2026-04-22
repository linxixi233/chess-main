import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

interface LoadItem {
  url: string;
  type: 'image' | 'audio';
}

// 预加载的资源列表
const ASSETS_TO_PRELOAD: LoadItem[] = [
  // Standees
  { url: '/standees/爱丽丝未觉醒.webp', type: 'image' },
  { url: '/standees/爱丽丝觉醒.webp', type: 'image' },
  { url: '/standees/优香.webp', type: 'image' },
  { url: '/standees/柚子.webp', type: 'image' },
  { url: '/standees/小绿.webp', type: 'image' },
  { url: '/standees/桃.png', type: 'image' },
  { url: '/standees/星野未觉醒.webp', type: 'image' },
  { url: '/standees/恐怖白子.webp', type: 'image' },
  { url: '/standees/sensei.webp', type: 'image' },
  // Icons
  { url: '/icons/爱丽丝（觉醒前）.webp', type: 'image' },
  { url: '/icons/爱丽丝（觉醒）.webp', type: 'image' },
  { url: '/icons/优香.webp', type: 'image' },
  { url: '/icons/柚子.webp', type: 'image' },
  { url: '/icons/绿.webp', type: 'image' },
  { url: '/icons/桃.webp', type: 'image' },
  { url: '/icons/星野.webp', type: 'image' },
  { url: '/icons/白子（恐怖）.webp', type: 'image' },
  { url: '/icons/老师.webp', type: 'image' },
  // Character Backgrounds
  { url: '/characterbackground/BG_GameDevRoom.jpg', type: 'image' },
  { url: '/characterbackground/bg_view_mainstadium.jpg', type: 'image' },
  { url: '/characterbackground/BG_SchoolFrontGate.jpg', type: 'image' },
  { url: '/characterbackground/BG_View_Schale.jpg', type: 'image' },
  // School Icons
  { url: '/characterbackground/School_Icon_MILLENNIUM.png', type: 'image' },
  { url: '/characterbackground/School_Icon_ABYDOS.png', type: 'image' },
  { url: '/characterbackground/sensei schale.png', type: 'image' },
  // Tactical GIFs
  { url: '/res/admire.gif', type: 'image' },
  { url: '/res/clap.gif', type: 'image' },
  { url: '/res/draw.gif', type: 'image' },
  { url: '/res/good.gif', type: 'image' },
  { url: '/res/hacido.gif', type: 'image' },
  { url: '/res/hengheng.gif', type: 'image' },
  { url: '/res/ski.gif', type: 'image' },
  { url: '/res/want.gif', type: 'image' },
];

// 检查资源是否已缓存（通过创建 Image/Audio 对象）
const preloadAsset = (item: LoadItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (item.type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        // 图片加载失败也继续，不阻塞
        console.warn(`Failed to load image: ${item.url}`);
        resolve();
      };
      img.src = item.url;
    } else if (item.type === 'audio') {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => {
        console.warn(`Failed to load audio: ${item.url}`);
        resolve();
      };
      audio.src = item.url;
      audio.load();
    }
  });
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentAsset, setCurrentAsset] = useState('');
  const [statusText, setStatusText] = useState('初始化中...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      const total = ASSETS_TO_PRELOAD.length;
      let loaded = 0;

      for (const asset of ASSETS_TO_PRELOAD) {
        if (!mounted) break;

        setCurrentAsset(asset.url);
        
        // 分类更新状态文字
        if (asset.url.includes('standees')) {
          setStatusText('加载角色立绘...');
        } else if (asset.url.includes('icons') && !asset.url.includes('characterbackground')) {
          setStatusText('加载角色头像...');
        } else if (asset.url.includes('characterbackground')) {
          setStatusText('加载角色背景...');
        } else if (asset.url.includes('res/')) {
          setStatusText('加载战术表情...');
        } else if (asset.url.includes('audio') || asset.url.includes('bgm')) {
          setStatusText('加载音频资源...');
        }

        await preloadAsset(asset);
        
        if (mounted) {
          loaded++;
          setProgress(Math.round((loaded / total) * 100));
        }
      }

      if (mounted) {
        setStatusText('准备就绪!');
        setIsComplete(true);
        
        // 延迟跳转，让用户看到 100%
        setTimeout(() => {
          if (mounted) {
            onComplete();
          }
        }, 500);
      }
    };

    loadAssets();

    return () => {
      mounted = false;
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景装饰 - 几何图形 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-cyan-500/20 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 border border-yellow-500/10 rotate-45 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* 扫描线效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-30 animate-[scan_3s_linear_infinite]" style={{ backgroundSize: '100% 4px' }} />
      </div>

      {/* Logo / Title */}
      <motion.div 
        className="relative z-10 mb-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] max-w-full px-4 overflow-hidden">
          KIVOTOS
        </div>
        <div className="text-center text-2xl font-bold text-cyan-400/80 mt-2 tracking-[0.3em]">
          GOBANG
        </div>
      </motion.div>

      {/* 进度条容器 */}
      <motion.div 
        className="relative z-10 w-80 md:w-96"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* 进度条背景 */}
        <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur">
          {/* 进度条填充 */}
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 rounded-full relative"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* 发光效果 */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 blur-sm" />
            {/* 脉冲点 */}
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
              animate={{ opacity: isComplete ? [1, 1, 1] : [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* 百分比 */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-cyan-400 font-mono text-sm">{progress}%</span>
          <span className="text-slate-400 text-sm font-medium">{statusText}</span>
        </div>

        {/* 当前加载的资源（调试用，可注释掉） */}
        <div className="mt-2 text-xs text-slate-600 truncate font-mono">
          {currentAsset.replace('/standees/', '').replace('/icons/', '').replace('/characterbackground/', '').replace('/res/', '')}
        </div>
      </motion.div>

      {/* 底部提示 */}
      <motion.div 
        className="absolute bottom-12 text-slate-500 text-sm font-medium tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {isComplete ? (
          <span className="text-cyan-400">ENTERING SCHALE NETWORK...</span>
        ) : (
          <span>LOADING TACTICAL DATA...</span>
        )}
      </motion.div>

      {/* 版本号 */}
      <motion.div 
        className="absolute bottom-6 right-6 text-slate-600 text-xs font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        VER 1.0
      </motion.div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </motion.div>
  );
};
