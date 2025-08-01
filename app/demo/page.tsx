"use client";

import { useState } from 'react';
import { 
  MessageSquare, 
  Brain, 
  FileText, 
  Search, 
  Sparkles, 
  User, 
  Bot, 
  Send, 
  PlusCircle, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('chats');
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f76361] to-[#884f83] flex items-center justify-center mr-2">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#f76361] to-[#884f83] bg-clip-text text-transparent">Onix AI Sales Agent</h2>
            </div>
            
            <button className="rounded-full h-8 w-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <button 
            className="w-full justify-start bg-gradient-to-r from-[#f76361] to-[#884f83] hover:from-[#e55350] hover:to-[#7a4675] text-white py-2 px-4 rounded-md flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </button>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
          <div className="px-4 py-2">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
              <button 
                className={`flex-1 flex items-center justify-center py-1.5 px-2 text-sm rounded-md ${activeTab === 'chats' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('chats')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chats
              </button>
              <button 
                className={`flex-1 flex items-center justify-center py-1.5 px-2 text-sm rounded-md ${activeTab === 'search' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('search')}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </button>
              <button 
                className={`flex-1 flex items-center justify-center py-1.5 px-2 text-sm rounded-md ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto px-2 py-4">
          {/* Chat List */}
          <div className="space-y-1">
            {['Sales Strategy Discussion', 'Customer Feedback Analysis', 'Q1 Performance Review'].map((title, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${index === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`p-1 rounded-md ${
                    index === 0 ? 'bg-[#f76361] text-white' : 
                    index === 1 ? 'bg-[#884f83] text-white' : 
                    'bg-[#263b58] text-white'
                  }`}>
                    {index === 0 ? <MessageSquare className="h-4 w-4" /> : 
                     index === 1 ? <Brain className="h-4 w-4" /> : 
                     <FileText className="h-4 w-4" />}
                  </div>
                  
                  <div className="overflow-hidden">
                    <div className="truncate text-sm font-medium">
                      {title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {new Date().toLocaleDateString()} • {index === 0 ? 'Chat' : index === 1 ? 'RAG' : 'Summarize'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm font-medium">
                <Brain className="h-4 w-4 text-[#884f83]" />
                <span>RAG Search</span>
                <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
              </button>
            </div>
            
            <button className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm font-medium">
              <FileText className="h-4 w-4 text-[#263b58]" />
              <span>Select Documents</span>
              <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
            </button>
          </div>
          
          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md py-1.5 px-3 text-sm font-medium flex items-center">
            <PlusCircle className="mr-2 h-4 w-4 text-[#f76361]" />
            New Chat
          </button>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
          {/* Messages */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="flex max-w-[85%] gap-3 flex-row-reverse">
                <div className="flex-shrink-0 mt-1 ml-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#f76361] to-[#884f83] flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 items-end">
                  <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#f76361] to-[#884f83] text-white">
                    <p>Can you analyze our Q1 sales performance and identify key areas for improvement in Q2?</p>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    11:42 AM
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Message */}
            <div className="flex justify-start">
              <div className="flex max-w-[85%] gap-3">
                <div className="flex-shrink-0 mt-1 mr-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#263b58] to-[#3d5a85] flex items-center justify-center text-white">
                    <Bot size={16} />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-lg font-semibold mb-2 text-[#263b58] dark:text-[#60A5FA]">Q1 Sales Performance Analysis</h2>
                    
                    <p className="mb-3">Based on the documents I've analyzed, here are the key insights from Q1:</p>
                    
                    <h3 className="text-md font-medium mb-1 text-[#f76361]">Strengths:</h3>
                    <ul className="mb-3 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f76361]"></span>
                        <span>Healthcare vertical exceeded targets by 32% YoY</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f76361]"></span>
                        <span>Enterprise segment performance up 24% from projections</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f76361]"></span>
                        <span>Average deal size increased by 7% to $113,500</span>
                      </li>
                    </ul>
                    
                    <h3 className="text-md font-medium mb-1 text-[#884f83]">Areas for Improvement:</h3>
                    <ul className="mb-3 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#884f83]"></span>
                        <span>SMB segment underperforming by 8% against targets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#884f83]"></span>
                        <span>Southeast region trailing other territories by 15%</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-[#884f83]"></span>
                        <span>Renewal rates for legacy products at 78% (target: 85%)</span>
                      </li>
                    </ul>
                    
                    <h3 className="text-md font-medium mb-1 text-[#263b58]">Q2 Recommendations:</h3>
                    <ol className="space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2 font-medium text-[#263b58]">1.</span>
                        <span>Implement targeted enablement program for SMB sales team</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 font-medium text-[#263b58]">2.</span>
                        <span>Review pricing strategy for legacy product line</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 font-medium text-[#263b58]">3.</span>
                        <span>Launch focused marketing campaign in Southeast region</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 font-medium text-[#263b58]">4.</span>
                        <span>Expand successful healthcare vertical playbook to financial services</span>
                      </li>
                    </ol>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="font-semibold text-sm mb-1 text-[#884f83]">Sources:</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="mb-1">Q1 Sales Performance Report (p.5-8)</div>
                        <div className="mb-1">Vertical Market Analysis (Table 4)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    11:43 AM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-full shadow-sm">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about your knowledge base..."
                className="min-h-[60px] w-full pr-14 resize-none rounded-full border-gray-200 dark:border-gray-700 focus:ring-[#f76361] dark:focus:ring-[#f76361] focus:border-[#f76361] dark:focus:border-[#f76361] focus:ring-offset-0"
              />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f76361] to-[#884f83] hover:from-[#e55350] hover:to-[#7a4675] text-white h-10 w-10 flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}