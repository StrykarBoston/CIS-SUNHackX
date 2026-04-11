const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'alerts', label: 'Alert Center', icon: '🚨' },
  { id: 'osint', label: 'OSINT Explorer', icon: '🔍' },
  { id: 'sentiment', label: 'Sentiment Engine', icon: '💡' },
  { id: 'simulation', label: 'Simulation Lab', icon: '🎮' },
  { id: 'humanitarian', label: 'Civilian Impact', icon: '👥' },
  { id: 'brief', label: 'Commander Brief', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="no-print lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full 
          bg-[#ef4444] text-white flex items-center justify-center shadow-lg shadow-red-500/25
          hover:bg-[#dc2626] transition-colors"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          {isOpen ? (
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`no-print fixed lg:relative z-40 h-full w-[220px] shrink-0
        bg-white dark:bg-[#0d1220] border-r border-gray-200 dark:border-[#1f2937] flex flex-col py-4 px-3 gap-1
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="text-[10px] text-gray-400 dark:text-[#4b5563] font-semibold uppercase tracking-[0.2em] px-4 mb-2">
          Navigation
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              setIsOpen(false);
            }}
            className={`sidebar-item w-full text-left ${activePage === item.id ? 'active' : ''}`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#1f2937] px-3">
          <div className="text-[10px] text-gray-400 dark:text-[#4b5563] font-medium leading-relaxed">
            <p>CONFLICT.AI v2.0</p>
            <p>5-Agent Pipeline</p>
            <p className="text-[#ef4444] mt-1">UNCLASSIFIED</p>
          </div>
        </div>
      </aside>
    </>
  );
}
