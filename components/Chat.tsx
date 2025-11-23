'use client';

import { useState } from 'react';
import { Send, Terminal, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import clsx from 'clsx';

export function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input;
    setInput('');
    
    await sendMessage({ 
        role: 'user', 
        parts: [{ type: 'text', text }]
    });
  };

  return (
    <div className="flex flex-col w-full h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Terminal className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Ask to generate a graph...</p>
            <p className="text-sm">e.g., &quot;Create a cross-filtered scatter plot of sales data&quot;</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "flex flex-col max-w-[90%]",
              m.role === 'user' ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={clsx(
                "px-4 py-3 rounded-2xl text-sm shadow-sm",
                m.role === 'user'
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              )}
            >
              {m.parts ? (
                m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <div key={i} className="whitespace-pre-wrap">{part.text}</div>;
                  }
                  
                  if (part.type.startsWith('tool-')) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const toolPart = part as any;
                    // Check if it's our generate_graph tool
                    if (toolPart.toolName === 'generate_graph' || part.type === 'tool-generate_graph') {
                         if (toolPart.state === 'output-available' || toolPart.output) {
                             const url = toolPart.output;
                             if (typeof url === 'string' && url.startsWith('http')) {
                                 return (
                                     <div key={i} className="flex flex-col gap-2 mt-2">
                                        <p className="font-semibold text-xs opacity-75 mb-1">Generated Graph:</p>
                                        <iframe 
                                            src={url} 
                                            className="w-[800px] h-[600px] bg-white rounded-md border border-gray-300"
                                            title="Generated Graph"
                                        />
                                        <a href={url} target="_blank" rel="noreferrer" className="text-xs underline opacity-70 hover:opacity-100">Open in new tab</a>
                                     </div>
                                 );
                             }
                         }
                         // While generating or if output is not a URL yet
                         return <div key={i} className="flex items-center gap-2 text-gray-500 italic text-xs mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Generating graph...</span>
                         </div>;
                    }
                  }
                  return null;
                })
              ) : null}
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="self-start flex items-center gap-2 text-gray-400 text-sm ml-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking & Building...</span>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the graph you want..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
