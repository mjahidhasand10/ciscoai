"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  Code,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  content: string | CiscoCommandResponse;
  role: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "cisco_command";
}

interface CiscoCommandResponse {
  command: string;
  syntax: string;
  description: string;
  parameters: string[];
  examples: string[];
  notes: string[];
  fullResponse: string;
  metadata: {
    sourceUrl: string;
    documentCount: number;
    commandCategory: string;
    timestamp: string;
  };
}

const CiscoCommandCard = ({ data }: { data: CiscoCommandResponse }) => {
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSyntax(true);
      setTimeout(() => setCopiedSyntax(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Command Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Cisco NX-OS Command
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {data.command}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          {data.metadata.commandCategory.toUpperCase()} Section
        </Badge>
      </div>

      {/* Command Syntax */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-l-4 border-l-green-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm text-green-800 dark:text-green-200">
              Command Syntax
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(data.syntax)}
            className="h-6 px-2"
          >
            {copiedSyntax ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
        <code className="block p-3 bg-black text-green-400 rounded text-sm font-mono break-all">
          {data.syntax}
        </code>
      </Card>

      {/* Description */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm">Description</span>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Description</span>
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.description}
          </ReactMarkdown>
        </Card>
      </Card>

      {/* Parameters */}
      {data.parameters.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-sm">Parameters</span>
          </div>
          <div className="space-y-2">
            {data.parameters.map((param, index) => (
              <div
                key={index}
                className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded border-l-2 border-purple-400"
              >
                <code className="text-xs text-purple-800 dark:text-purple-200">
                  {param}
                </code>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Examples */}
      {data.examples.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-sm">Examples</span>
          </div>
          <div className="space-y-2">
            {data.examples.map((example, idx) => (
              <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
                {example}
              </ReactMarkdown>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {data.notes.length > 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800 dark:text-amber-200">
              Important Notes
            </span>
          </div>
          <div className="space-y-2">
            {data.notes.map((note, index) => (
              <p
                key={index}
                className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed"
              >
                {note}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Source Link */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <BookOpen className="w-3 h-3" />
          <span>Source: Cisco Documentation</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(data.metadata.sourceUrl, "_blank")}
          className="h-6 px-2 text-xs"
        >
          View Docs <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your Cisco NX-OS AI assistant. I can help you with:\n\n🔹 Show commands documentation\n🔹 Command syntax and parameters\n🔹 Usage examples and best practices\n🔹 General networking questions\n\nJust ask me about any Cisco show command or feel free to chat!",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          messages,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data) {
        if (result.type === "cisco_command") {
          // Cisco command response with structured data
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: result.data,
            role: "assistant",
            timestamp: new Date(),
            type: "cisco_command",
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // General conversation response
          const aiContent =
            result.data.answer ||
            result.data ||
            "Sorry, I couldn't process your request.";
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: aiContent,
            role: "assistant",
            timestamp: new Date(),
            type: "text",
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Fallback to text response
        const aiContent =
          result?.data?.answer ??
          result?.answer ??
          result?.message ??
          "Sorry, I couldn't process your request.";
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiContent,
          role: "assistant",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "⚠️ Sorry, I'm having trouble connecting to the AI service. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Cisco NX-OS AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Expert guidance for show commands
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 max-w-5xl",
              message.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <Avatar className="w-10 h-10 shrink-0 shadow-md">
              <AvatarFallback
                className={cn(
                  "text-sm font-medium",
                  message.role === "user"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex-1 space-y-2",
                message.role === "user" ? "text-right" : ""
              )}
            >
              {message.type === "cisco_command" ? (
                <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-700">
                  <CiscoCommandCard
                    data={message.content as CiscoCommandResponse}
                  />
                </Card>
              ) : (
                <Card
                  className={cn(
                    "p-4 shadow-md border-0 ring-1",
                    message.role === "user"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-green-200"
                      : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ring-gray-200 dark:ring-gray-700"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content as string}
                  </p>
                </Card>
              )}

              <p
                className={cn(
                  "text-xs text-muted-foreground px-2",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-5xl">
            <Avatar className="w-10 h-10 shrink-0 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  Analyzing Cisco documentation...
                </span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any Cisco show command... (e.g., 'show bgp', 'show interface')"
              className="pl-4 pr-12 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm shadow-sm"
              disabled={isTyping}
            />
            {input.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {input.toLowerCase().includes("show ") ||
                input.toLowerCase().includes("cisco") ||
                input.toLowerCase().includes("command") ? (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400"
                  >
                    <Terminal className="w-3 h-3 mr-1" />
                    {input.toLowerCase().startsWith("show ")
                      ? input.substring(5, 6).toUpperCase() + " Docs"
                      : "Cisco"}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Chat
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Press Enter to send • Shift+Enter for new line
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Badge variant="outline" className="text-xs">
              <Terminal className="w-3 h-3 mr-1" />
              NX-OS 7.x
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4o Powered
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
