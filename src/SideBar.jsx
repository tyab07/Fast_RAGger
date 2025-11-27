import React, { useState } from 'react';
// FIX: Using standard import without extension, ensuring it matches the file generated above
import { BotIcon, PlusIcon, LogOutIcon, TrashIcon } from './Icons';

const Sidebar = ({ conversations, selectConversation, selectedId, newChat, deleteChat, onLogout }) => {
  // State to manage the delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Stop click from selecting the chat
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (e) => {
    if (deleteConfirmId) {
      deleteChat(deleteConfirmId, e);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0C2B4E]/90 backdrop-blur-md border-r border-white/10 text-white relative">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <BotIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            FAST RAGger AI
          </h1>
        </div>
        
        <button 
          onClick={newChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-xl transition-all duration-200 shadow-lg group"
        >
          <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          New Chat
        </button>
      </div>
      
      {/* Conversation List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="px-2 py-2 text-xs font-semibold text-blue-200/50 uppercase tracking-wider">
          History
        </div>
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`group w-full flex items-center justify-between p-3 mb-1 rounded-xl transition-all duration-200 cursor-pointer ${
              conv.id === selectedId
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            onClick={() => selectConversation(conv.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
               <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${conv.id === selectedId ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-transparent group-hover:bg-gray-600'}`}></div>
               <span className="truncate text-sm font-medium">{conv.title}</span>
            </div>

            {/* ✅ Delete Button triggers the modal now */}
            <button
              onClick={(e) => handleDeleteClick(e, conv.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-[#09223e]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Student</span>
              <span className="text-[10px] text-gray-400">Pro Plan</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Sign Out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-[#0f2e52] border border-white/10 p-5 rounded-2xl shadow-2xl w-full max-w-[260px] transform transition-all scale-100 ring-1 ring-white/5">
              <h3 className="text-white font-semibold text-lg mb-2">Delete Chat?</h3>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                 <button 
                   onClick={handleCancelDelete}
                   className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleConfirmDelete}
                   className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-lg shadow-red-900/20 transition-all"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;