import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { getLocalizedTaxMate } from "./Navbar";
import "./TaxChatbot.css";

function TaxChatbot() {
    const [open, setOpen] = useState(false);
    const [lang, setLang] = useState(localStorage.getItem('taxmate_lang') || 'en');
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    // Set initial message dynamically based on language
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    sender: "bot",
                    text: `👋 Hi! I'm ${getLocalizedTaxMate(lang)} AI. Ask me anything about income tax.`,
                }
            ]);
        }
    }, [lang, messages.length]);

    // Auto-scroll ref
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [messages, open]);

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('taxmate_lang') || 'en');
        };
        window.addEventListener('languageChange', handleLangChange);
        return () => window.removeEventListener('languageChange', handleLangChange);
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            { sender: "user", text: userMessage },
        ]);
        setMessage("");
        setLoading(true);

        try {
            // Send new message AND history
            const history = messages.map(msg => ({ sender: msg.sender, text: msg.text }));

            const response = await api.post("/tax-chat", {
                message: userMessage,
                history: history
            });
            const data = response.data;

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.reply || "Sorry, I couldn't understand that.",
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "⚠️ Server error. Please try again later.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!open && (
                <div className="chatbot-tooltip" onClick={() => setOpen(true)}>
                    Need Tax Help? Ask AI!
                </div>
            )}
            <div className="chatbot-fab" onClick={() => setOpen(true)}>
                💬
            </div>

            {/* Chatbot Window */}
            {open && (
                <div className="chatbot-box">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-title"><span className="notranslate">{getLocalizedTaxMate(lang)}</span> AI</div>
                        <button
                            className="chatbot-close"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`msg ${msg.sender}`}>
                                {typeof msg.text === "string" ? (
                                    <span>
                                        {msg.text.split(new RegExp(`(${getLocalizedTaxMate(lang)}|TaxMate)`, 'gi')).map((part, i) => {
                                            if (
                                                part.toLowerCase() === getLocalizedTaxMate(lang).toLowerCase() ||
                                                part.toLowerCase() === 'taxmate'
                                            ) {
                                                return <span key={i} className="notranslate">{getLocalizedTaxMate(lang)}</span>;
                                            }
                                            return <React.Fragment key={i}>{part}</React.Fragment>;
                                        })}
                                    </span>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="msg bot">......</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input">
                        <textarea
                            placeholder="Type your tax question..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend} disabled={loading}>
                            {/* Simple Filled Paper Plane Icon */}
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default TaxChatbot;
