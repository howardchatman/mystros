"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  PhoneCall,
  PhoneOff,
  Mic,
} from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

type CallStatus = "idle" | "connecting" | "connected" | "error";

const quickActions = [
  { label: "Programs", action: "programs" },
  { label: "Apply Now", action: "apply" },
  { label: "Financial Aid", action: "financial" },
  { label: "Schedule Tour", action: "tour" },
];

export default function MystrosChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Welcome to Mystros Barber Academy! I'm here to help you start your barbering career. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isTalking, setIsTalking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/retell/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "I'd be happy to help you learn more about our programs. What specific information are you looking for?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Connection issue on my end. Please call us at (713) 999-2904 for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      programs: "What programs do you offer?",
      apply: "How do I apply to Mystros Barber Academy?",
      financial: "What financial aid options are available?",
      tour: "I'd like to schedule a campus tour.",
    };
    handleSendMessage(actionMessages[action]);
  };

  // Initialize Retell event handlers
  const setupRetellEvents = useCallback((client: RetellWebClient) => {
    client.on("call_started", () => {
      setCallStatus("connected");
      const callMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Connected! Go ahead, I'm listening.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, callMessage]);
    });

    client.on("call_ended", () => {
      setCallStatus("idle");
      setIsTalking(false);
      const endMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Call ended. Is there anything else I can help you with?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, endMessage]);
      retellClientRef.current = null;
    });

    client.on("agent_start_talking", () => {
      setIsTalking(true);
    });

    client.on("agent_stop_talking", () => {
      setIsTalking(false);
    });

    client.on("error", (error) => {
      console.error("Retell error:", error);
      setCallStatus("error");
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Connection issue. Try again or call (713) 999-2904 directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      retellClientRef.current = null;
    });
  }, []);

  const handleStartCall = async () => {
    setCallStatus("connecting");

    const connectingMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      text: "Connecting you now. Have your questions ready!",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, connectingMessage]);

    try {
      const response = await fetch("/api/retell/web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!data.success || !data.data?.access_token) {
        throw new Error(data.error || "Failed to start call");
      }

      const client = new RetellWebClient();
      retellClientRef.current = client;
      setupRetellEvents(client);

      await client.startCall({
        accessToken: data.data.access_token,
      });

    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus("idle");
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Couldn't connect right now. Please call (713) 999-2904 for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleEndCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    setCallStatus("idle");
    setIsTalking(false);
  };

  useEffect(() => {
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-brand-accent hover:bg-brand-accent2 text-white rounded-full shadow-lg shadow-brand-accent/30 transition-colors group"
            title="Chat with us"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-brand-gold rounded-full animate-pulse" />
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-brand-elevated text-brand-text text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-brand-primary/30">
              Chat with us
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-brand-elevated border border-brand-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Mystros Assistant</h3>
                  <p className="text-xs text-brand-ice">
                    {callStatus === "connecting" ? "Connecting..." :
                     callStatus === "connected" ? (isTalking ? "Speaking..." : "On Call - Listening") :
                     "Your Admissions Guide"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-brand-accent"
                            : "bg-brand-primary"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-brand-ice" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] ${
                          message.sender === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-brand-accent text-white rounded-tr-md"
                              : "bg-brand-elevated text-brand-text rounded-tl-md border border-brand-primary/30"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                        <span className="text-xs text-brand-muted mt-1 block">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                        <Bot className="w-4 h-4 text-brand-ice" />
                      </div>
                      <div className="bg-brand-elevated p-3 rounded-2xl rounded-tl-md border border-brand-primary/30">
                        <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2 bg-brand-bg">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.action}
                          onClick={() => handleQuickAction(action.action)}
                          className="px-3 py-1.5 text-xs bg-brand-elevated hover:bg-brand-primary text-brand-ice border border-brand-primary/30 rounded-full transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-brand-primary/30 bg-brand-elevated">
                  {/* Voice Call Active Indicator */}
                  {callStatus === "connected" && (
                    <div className="mb-3 p-3 bg-green-900/30 border border-green-500/30 rounded-xl flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isTalking ? "bg-green-500 animate-pulse" : "bg-green-400"}`} />
                      <span className="text-sm text-green-400 font-medium">
                        {isTalking ? "Speaking" : "Listening..."}
                      </span>
                      <Mic className={`w-4 h-4 ${isTalking ? "text-green-500" : "text-green-400 animate-pulse"}`} />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={callStatus === "connected" || callStatus === "connecting" ? handleEndCall : handleStartCall}
                      disabled={callStatus === "connecting"}
                      className={`p-2.5 rounded-xl transition-colors ${
                        callStatus === "connected"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : callStatus === "connecting"
                          ? "bg-brand-accent/50 text-white cursor-wait"
                          : "bg-brand-primary hover:bg-brand-accent hover:text-white text-brand-ice"
                      }`}
                      title={callStatus === "connected" ? "End Call" : callStatus === "connecting" ? "Connecting..." : "Talk to us"}
                    >
                      {callStatus === "connected" ? (
                        <PhoneOff className="w-5 h-5" />
                      ) : callStatus === "connecting" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <PhoneCall className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder={callStatus === "connected" ? "On voice call..." : "Type your message..."}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-primary/30 rounded-xl text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:bg-brand-primary/20"
                        disabled={callStatus !== "idle"}
                      />
                    </div>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading || callStatus !== "idle"}
                      className="p-2.5 bg-brand-accent hover:bg-brand-accent2 disabled:bg-brand-primary disabled:text-brand-muted text-white rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-brand-muted mt-2 text-center">
                    {callStatus === "idle" ? "Click the phone to talk, or type a message." : "Voice call in progress"}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
