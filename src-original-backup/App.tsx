import React from 'react';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';

function App() {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'chat':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="+1234567890" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea placeholder="Hello! I'm interested in..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-24" />
            </div>
            <button className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
              Generate Link
            </button>
          </div>
        );
      case 'auto-reply':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">Configure automated responses for incoming messages.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Welcome Message</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full text-blue-600 font-medium text-sm hover:underline mt-2">
              + Add New Rule
            </button>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-6">
            <div className="inline-block p-4 rounded-full bg-purple-50 mb-4">
              <span className="text-4xl">📈</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">No Data Yet</h4>
            <p className="text-gray-500 mt-2 text-sm">Start sharing your links to see engagement metrics here.</p>
            <button className="mt-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors">
              Refresh Data
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'chat': return 'Create Click to Chat Link';
      case 'auto-reply': return 'Automated Replies';
      case 'analytics': return 'Button Analytics';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 pointer-events-auto select-none">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">WhatsApp Button Features</h2>
          <p className="text-gray-500 mt-2">Manage your WhatsApp integration settings and buttons here.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Cards */}
          <div
            onClick={() => setActiveModal('chat')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-green-200 group"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600 text-2xl group-hover:scale-110 transition-transform">
              📱
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">Click to Chat</h3>
            <p className="text-sm text-gray-600">Create direct links for users to message you on WhatsApp.</p>
          </div>

          <div
            onClick={() => setActiveModal('auto-reply')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-blue-200 group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 text-2xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">Automated Replies</h3>
            <p className="text-sm text-gray-600">Set up quick replies for common customer inquiries.</p>
          </div>

          <div
            onClick={() => setActiveModal('analytics')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-purple-200 group"
          >
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600 text-2xl group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">Analytics</h3>
            <p className="text-sm text-gray-600">Track clicks and engagement on your WhatsApp buttons.</p>
          </div>
        </div>
      </main>

      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default App;
