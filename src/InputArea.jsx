import React, { useRef, useEffect } from 'react';
// FIX: Added .jsx extension to ensure correct file resolution
import { SendIcon } from './Icons.jsx';

const InputArea = ({ input, setInput, handleSend, isLoading }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 md:p-6 pb-6">
      <div className="max-w-4xl mx-auto relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
        
        <div className="relative flex items-end gap-2 bg-[#0C2B4E] border border-white/10 rounded-2xl p-2 shadow-2xl">
          <textarea
            ref={textareaRef}
            className="flex-grow w-full p-3 bg-transparent text-white placeholder-gray-400 text-sm md:text-base resize-none focus:outline-none max-h-40 scrollbar-hide"
            placeholder="Ask anything..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 mb-0.5 ${
              input.trim()
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] md:text-xs text-gray-500 mt-3">
        FAST RAGger AI can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default InputArea;