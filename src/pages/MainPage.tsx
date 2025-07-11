import type {FC} from 'react';
import {useSelector} from 'react-redux';
import type {RootState} from '../store/store';
import {useNavigate} from 'react-router';
import ChatSidebar from '../components/chat-side-bar/ChatSidebar.tsx';
import ChatComponent from '../components/chat/Chat.tsx';
import {useState, useEffect} from 'react';

const MainPage: FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1250) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
                <ChatSidebar onCollapse={() => setIsSidebarOpen(false)} />
            </div>
            <div className="flex-1 relative">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-4 left-4 z-10 p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors"
                    >
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                )}
                <ChatComponent />
            </div>
        </div>
    );
};

export default MainPage; 