import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { File, Folder, ChevronRight, ChevronDown, Play, Save, TerminalSquare, Code2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock File System
type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
};

const mockFileSystem: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;'
      },
      {
        id: '3',
        name: 'index.css',
        type: 'file',
        language: 'css',
        content: 'body {\n  margin: 0;\n  background-color: #1e1e1e;\n  color: #d4d4d4;\n}'
      }
    ]
  },
  {
    id: '4',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: '{\n  "name": "biofactor-app",\n  "version": "1.0.0"\n}'
  }
];

const FileExplorerNode = ({ node, level = 0, onSelect, activeId }: { node: FileNode, level?: number, onSelect: (file: FileNode) => void, activeId: string | null }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'folder') {
    return (
      <div>
        <div 
          className="flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc] text-sm select-none transition-colors"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
          <Folder size={14} className="mr-2 text-blue-400" />
          {node.name}
        </div>
        {isOpen && node.children?.map(child => (
          <FileExplorerNode key={child.id} node={child} level={level + 1} onSelect={onSelect} activeId={activeId} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc] text-sm select-none transition-colors",
        activeId === node.id && "bg-[#37373d]"
      )}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
      onClick={() => onSelect(node)}
    >
      <File size={14} className="mr-2 text-gray-400" />
      {node.name}
    </div>
  );
};

const CodeEditorPage = () => {
  const [activeFile, setActiveFile] = useState<FileNode | null>(mockFileSystem[0].children![0]);
  const [files] = useState<FileNode[]>(mockFileSystem);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['[System] Editor initialized. Ready for coding.']);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'output' | 'problems'>('terminal');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRun = () => {
    setConsoleOutput(prev => [...prev, `> Executing ${activeFile?.name}...`, 'Code executed successfully.']);
    setActiveBottomTab('terminal');
    setIsTerminalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] -mt-2 -mx-2 sm:-mx-4 lg:-mx-6 flex flex-col bg-[#1e1e1e] text-white border border-[#333] rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* Top Bar */}
      <div className="h-12 bg-[#323233] flex items-center justify-between px-4 border-b border-[#252526]">
        <div className="flex items-center gap-4 text-sm text-[#cccccc]">
          <div className="flex items-center gap-2 mr-4">
             <Code2 size={18} className="text-blue-400" />
             <span className="font-semibold text-white">Code Editor</span>
          </div>
          <div className="hidden md:flex space-x-4 text-xs">
            <button className="hover:text-white transition-colors">File</button>
            <button className="hover:text-white transition-colors">Edit</button>
            <button className="hover:text-white transition-colors">View</button>
            <button className="hover:text-white transition-colors">Run</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRun} className="flex items-center gap-1 bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm">
            <Play size={14} /> Run
          </button>
          <button className="flex items-center gap-1 bg-[#4d4d4d] hover:bg-[#5a5a5a] px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm">
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Explorer Sidebar */}
        <div className="w-64 bg-[#252526] flex flex-col border-r border-[#333]">
          <div className="p-3 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Explorer</span>
            <span className="text-gray-500 lowercase text-[10px]">Ctrl+Shift+E</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {files.map(node => (
              <FileExplorerNode key={node.id} node={node} onSelect={setActiveFile} activeId={activeFile?.id || null} />
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Tabs */}
          {activeFile && (
            <div className="flex bg-[#252526] overflow-x-auto custom-scrollbar">
              <div className="flex items-center px-4 py-2 bg-[#1e1e1e] border-t-2 border-blue-500 text-sm text-white cursor-pointer min-w-max">
                <File size={14} className="mr-2 text-blue-400" />
                {activeFile.name}
              </div>
            </div>
          )}
          
          {/* Main Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language || 'javascript'}
                theme="vs-dark"
                value={activeFile.content}
                onChange={(val) => {
                  if (activeFile && val !== undefined) {
                    activeFile.content = val;
                  }
                }}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                  renderLineHighlight: "all",
                  smoothScrolling: true,
                }}
                loading={
                  <div className="flex items-center justify-center h-full text-gray-400 bg-[#1e1e1e]">
                    Loading Editor...
                  </div>
                }
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 bg-[#1e1e1e]">
                Select a file to edit
              </div>
            )}
          </div>

          {/* Terminal / Output Bottom Panel */}
          {isTerminalOpen && (
            <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col relative">
              <div className="flex items-center justify-between px-4 pt-2">
                <div className="flex items-center space-x-6 text-[11px] uppercase tracking-wider">
                  <button 
                    onClick={() => setActiveBottomTab('problems')}
                    className={cn("transition-colors pb-1.5 border-b-2 hover:text-white", activeBottomTab === 'problems' ? "text-white border-blue-500" : "text-gray-400 border-transparent")}
                  >
                    Problems
                  </button>
                  <button 
                    onClick={() => setActiveBottomTab('terminal')}
                    className={cn("flex items-center gap-1 transition-colors pb-1.5 border-b-2 hover:text-white", activeBottomTab === 'terminal' ? "text-white border-blue-500" : "text-gray-400 border-transparent")}
                  >
                    <TerminalSquare size={12} /> Terminal
                  </button>
                  <button 
                    onClick={() => setActiveBottomTab('output')}
                    className={cn("transition-colors pb-1.5 border-b-2 hover:text-white", activeBottomTab === 'output' ? "text-white border-blue-500" : "text-gray-400 border-transparent")}
                  >
                    Output
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <button onClick={() => setIsTerminalOpen(false)} className="hover:text-white transition-colors p-1" title="Close Panel">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-3 font-mono text-[13px] overflow-y-auto bg-[#1e1e1e] text-[#cccccc] leading-relaxed">
              {activeBottomTab === 'terminal' ? (
                <>
                  <div className="text-gray-500 mb-2">Windows PowerShell<br/>Copyright (C) Microsoft Corporation. All rights reserved.</div>
                  {consoleOutput.map((line, idx) => (
                    <div key={idx} className="mb-1">
                      {line.startsWith('>') ? (
                        <span className="text-blue-400">{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                  <div className="flex mt-1">
                    <span className="text-green-400 mr-2">PS C:\Users\Admin&gt;</span>
                    <span className="w-2 h-4 bg-gray-400 animate-pulse mt-0.5"></span>
                  </div>
                </>
              ) : activeBottomTab === 'problems' ? (
                <div className="text-gray-500">No problems have been detected in the workspace.</div>
              ) : (
                <div className="text-gray-500">Output console is empty.</div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
