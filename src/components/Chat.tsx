import { useRef, useState, useEffect } from "react";
import LanguagePicker from "./LanguagePicker";
import Dictaphone from "./Dictaphone";
import { ZubaanLanguage } from "../utils/languages";
import {
  translateText,
  summarizeConversation,
  AIProvider,
  checkGeminiNanoAvailability,
} from "../api/ai";
import Loader from "./Loader";
import {
  getSavedLanguages,
  saveSrcLanguage,
  saveTargetLanguage,
} from "../utils/storage-helper";

type Message = {
  text: string;
  by: "user" | "ai";
};

const languagesFromStorage = getSavedLanguages();

const Chat = () => {
  const [sourceLanguage, setSourceLanguage] = useState<ZubaanLanguage>(
    languagesFromStorage.sourceLanguage
  );
  const [targetLanguage, setTargetLanguage] = useState<ZubaanLanguage>(
    languagesFromStorage.targetLanguage
  );
  const [prompt, setPrompt] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const dictaphoneRef = useRef<HTMLButtonElement | null>(null);
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    checkAiAvailability();
  }, []);

  const checkAiAvailability = async () => {
    const isAvailable = await checkGeminiNanoAvailability();
    setAiAvailable(isAvailable);
  };

  const handleTextAreaKeyUp = async (
    ev: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (dictaphoneRef.current?.classList.contains("microphone")) {
      dictaphoneRef.current?.click();
      return;
    }
    const key = ev.key;
    if (key === "Enter" && !ev.shiftKey && !ev.ctrlKey) {
      await sendMessage();
    }
  };
  const sendMessage = async (message: string = prompt) => {
    setMessages((messages) => {
      return [
        ...messages,
        {
          text: message,
          by: "user",
        },
      ];
    });
    setTimeout(() => {
      setPrompt("");
    }, 0);
    try {
      setIsLoading(true);
      const resp = await translateText({
        sourceLanguage: sourceLanguage.name,
        targetLang: targetLanguage.name,
        prompt: message,
        provider: AIProvider.GeminiNano,
      });
      console.log({ resp });
      setMessages((messages) => {
        return [
          ...messages,
          {
            text: resp[0].message.content!,
            by: "ai",
          },
        ];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setIsLoading(true);
      const summaryResult = await summarizeConversation({
        sourceLanguage: sourceLanguage.name,
        targetLang: targetLanguage.name,
        prompt: JSON.stringify(messages),
        provider: AIProvider.GeminiNano,
      });
      setSummary(
        summaryResult
          .filter((r) => r.summary)
          .map((r) => `${r.language}:\n ${r.summary}`)
          .join("\n\n") || "No summary available"
      );
      setShowSummaryModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  return (
    <>
      {!isLoading && messages.length ? (
        <div className="fixed bottom-0 top-0 my-auto h-max right-2 md:right-10 z-10">
          <div className="tooltip tooltip-left" data-tip="Summary">
            <button
              disabled={!aiAvailable}
              onClick={handleSummarize}
              className="btn btn-secondary btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      <form
        className="flex flex-col gap-4 py-10"
        style={{
          height: "100%",
          minHeight: "100%",
          flex: 1,
        }}
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (dictaphoneRef.current?.classList.contains("microphone")) {
            dictaphoneRef.current?.click();
            return;
          }
          await sendMessage();
        }}
      >
        <div className="flex flex-col">
          <LanguagePicker
            defaultLang={sourceLanguage}
            label={"Source Language"}
            onChange={(lang: ZubaanLanguage) => {
              setSourceLanguage(lang);
              saveSrcLanguage(lang);
            }}
          />
          <LanguagePicker
            defaultLang={targetLanguage}
            label={"Target Language"}
            onChange={(lang: ZubaanLanguage) => {
              setTargetLanguage(lang);
              saveTargetLanguage(lang);
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {messages.map((message, index) => {
            if (message.by === "user") {
              return (
                <div key={index} className="chat chat-end">
                  <div className="chat-bubble chat-bubble-accent">
                    {message.text}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="chat chat-start">
                  <div className="chat-bubble chat-bubble-primary">
                    {message.text}
                  </div>
                </div>
              );
            }
          })}
          <div ref={messagesEndRef} />
        </div>
        {isLoading ? (
          <div className="w-full text-center">
            <Loader />
          </div>
        ) : (
          <Dictaphone
            disabled={!aiAvailable}
            propagateListening={(val) => {
              setListening(val);
            }}
            ref={dictaphoneRef}
            propagateTranscript={(message) => {
              setPrompt(message);
            }}
            sendMessage={(message: string) => {
              sendMessage(message);
            }}
            language={sourceLanguage.code}
          />
        )}
        <textarea
          disabled={listening || !aiAvailable}
          onChange={(ev) => {
            setPrompt(ev.target.value);
          }}
          onKeyUp={(ev) => handleTextAreaKeyUp(ev)}
          value={prompt}
          placeholder={`What do you need translated?\nPress Shift+Enter for new line`}
          className="mt-4 placeholder:text-gray-500 focus:ring-primary focus:ring-1 textarea textarea-bordered textarea-lg w-full"
        ></textarea>
        <button
          disabled={listening || !aiAvailable}
          type="submit"
          className="btn btn-primary"
        >
          Submit
        </button>
      </form>

      {showSummaryModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Conversation Summary</h3>
            <pre className="py-4 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {summary}
            </pre>
            <div className="modal-action">
              <button
                disabled={!aiAvailable}
                className="btn"
                onClick={() => setShowSummaryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
