import React, { useState } from 'react';

const Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('whatsapp');

    return (
        <div className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Minty
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Main Menu
                </div>

                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveItem('whatsapp')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeItem === 'whatsapp'
                                ? 'bg-gray-800 text-white border-l-4 border-green-500 shadow-md'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3 text-xl">💬</span>
                        WhatsApp Button Features
                    </button>

                    <button
                        onClick={() => setActiveItem('settings')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeItem === 'settings'
                                ? 'bg-gray-800 text-white border-l-4 border-blue-500 shadow-md'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3 text-xl">⚙️</span>
                        Settings
                    </button>
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-gray-400">Pro Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
