import React from 'react';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import type { Message } from "@/services/chat/types.ts";

interface WelcomeScreenProps {
    messages: Message[];
    message: string;
    setMessage: (message: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isSending: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    messages,
    message,
    setMessage,
    handleSubmit,
    isSending
}) => {
    if (messages.length > 0) {
        return (
            <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {[...messages].reverse().map((message) => (
                        <MessageBubble key={message.id} message={message}/>
                    ))}
                </div>
                <div className="p-4 mt-auto">
                    <MessageInput
                        message={message}
                        setMessage={setMessage}
                        handleSubmit={handleSubmit}
                        isSending={isSending}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        SDU Knowledge Base
                    </h2>
                    <p className="text-gray-600">
                        Suleyman Demirel University Q&A Assistant
                    </p>
                </div>
            </div>
            <div className="p-4 mt-auto">
                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    handleSubmit={handleSubmit}
                    isSending={isSending}
                    placeholder="Задайте вопрос о СДУ..."
                />
            </div>
        </div>
    );
};

export default WelcomeScreen; 