import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import InputArea from './InputArea';
import Sidebar from './SideBar';
import { MenuIcon, BotIcon } from './Icons';
import { LoginPage } from './LoginPage';

const API_URL = "http://localhost:8000";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('fastbot_token'));
  const [user, setUser] = useState(localStorage.getItem('fastbot_user'));
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) fetchChats();
  }, [token]);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0].id);
        }
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const messages = selectedConversation ? selectedConversation.messages : [];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isBotTyping]);

  const newChat = async () => {
    try {
      const res = await fetch(`${API_URL}/chats/new`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const newConv = { id: data.id, title: data.title, messages: data.messages };
      setConversations([newConv, ...conversations]);
      setSelectedConversationId(data.id);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error creating chat", err);
    }
  };

  // ✅ NEW: Delete Chat Functionality
  const deleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent clicking delete from opening the chat
    
    

    try {
      const res = await fetch(`${API_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // Remove from UI
        const updatedConversations = conversations.filter(c => c.id !== chatId);
        setConversations(updatedConversations);

        // If we deleted the active chat, switch to another one or empty
        if (selectedConversationId === chatId) {
          setSelectedConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
        }
      }
    } catch (err) {
      console.error("Error deleting chat", err);
    }
  };

  const selectConversation = (id) => { 
    setSelectedConversationId(id); 
    if (window.innerWidth < 1024) setIsSidebarOpen(false); 
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConversationId) return;

    const currentChatId = selectedConversationId;
    const content = input.trim();
    setInput('');
    
    const userMsg = { role: 'user', content };
    setConversations(prev => prev.map(conv => conv.id === currentChatId 
      ? { ...conv, messages: [...conv.messages, userMsg] } 
      : conv
    ));

    setIsBotTyping(true);

    try {
      const res = await fetch(`${API_URL}/chats/message`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ chatId: currentChatId, content })
      });

      const data = await res.json();

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentChatId) {
          const updatedMessages = [...conv.messages, data.bot_message];
          const newTitle = conv.title === 'New Chat' ? content.slice(0, 30) : conv.title;
          return { ...conv, title: newTitle, messages: updatedMessages };
        }
        return conv;
      }));

    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleLogin = (accessToken, username) => {
    localStorage.setItem('fastbot_token', accessToken);
    localStorage.setItem('fastbot_user', username);
    setToken(accessToken);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('fastbot_token');
    localStorage.removeItem('fastbot_user');
    setToken(null);
    setUser(null);
    setConversations([]);
  };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="flex h-screen antialiased bg-[#0C2B4E] overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0C2B4E]/80 backdrop-blur-md border border-white/10 text-white rounded-xl shadow-lg" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72 flex-shrink-0 shadow-2xl lg:shadow-none`}>
        <Sidebar 
          conversations={conversations} 
          selectConversation={selectConversation} 
          selectedId={selectedConversationId} 
          newChat={newChat}
          deleteChat={deleteChat} // ✅ Passed delete function
          onLogout={handleLogout}
        />
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 h-full lg:ml-72 relative z-0">
        <header className="flex-shrink-0 h-16 flex items-center justify-center lg:justify-start px-6 border-b border-white/5 bg-[#0C2B4E]/50 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-gray-300">
            {selectedConversation?.title || "Select a conversation"}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth ">
          <div className="max-w-4xl mx-auto">
            {!selectedConversationId ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
                 <BotIcon className="w-16 h-16 mb-4 opacity-20" />
                 <p>Start a new chat to begin</p>
               </div>
            ) : (
              messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
            )}
            
            {isBotTyping && (
              <div className="flex w-full justify-start mb-6 px-4">
                <div className="flex max-w-[75%] flex-row items-end gap-3">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                      <BotIcon className="w-5 h-5 text-white" />
                   </div>
                   <div className="px-5 py-4 bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="flex-shrink-0">
          <InputArea 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend} 
            isLoading={isBotTyping || !selectedConversationId} 
          />
        </footer>
      </div>
    </div>
  );
};

export default App;