import React from 'react';
import { UserIcon, BotIcon } from './Icons.jsx';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-400 to-cyan-400' 
            : 'bg-gradient-to-br from-emerald-400 to-teal-600'
        }`}>
          {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-white" />}
        </div>

        {/* Message Bubble */}
        <div className={`relative px-5 py-3.5 shadow-md backdrop-blur-sm border ${
          isUser 
            ? 'bg-blue-600/30 border-blue-500/30 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-white/10 border-white/10 text-gray-100 rounded-2xl rounded-tl-sm'
        }`}>
          <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          {/* Timestamp/Role hint (optional, visible on hover) */}
          <span className={`absolute -bottom-5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? 'right-0' : 'left-0'
          }`}>
            {isUser ? 'You' : 'FAST RAGger AI'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;