/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from "react";
import LanguagePicker from "./LanguagePicker";
import Dictaphone from "./Dictaphone";
import { ZubaanLanguage } from "../utils/languages";
import {
  translateText,
  // summarizeConversation,
  AIProvider,
  checkGeminiNanoAvailability,
} from "../api/ai";
import Loader from "./Loader";
import {
  getSavedLanguages,
  saveSrcLanguage,
  saveTargetLanguage,
} from "../utils/storage-helper";
import AudioPlayer from "./AudioPlayer";
import LoadingModal from "./LoadingModal";
import useMessagesStore from "../store/messages.store";

type ModelLoadingProgress = {
  name: string;
  file: string;
  loaded: number;
  total: number;
  progress: number;
};

const languagesFromStorage = getSavedLanguages();

const Chat = () => {
  const { messages, addMessage, updateMessageAudio, clearMessages } =
    useMessagesStore();
  const [sourceLanguage, setSourceLanguage] = useState<ZubaanLanguage>(
    languagesFromStorage.sourceLanguage
  );
  const [targetLanguage, setTargetLanguage] = useState<ZubaanLanguage>(
    languagesFromStorage.targetLanguage
  );
  const [prompt, setPrompt] = useState("");

  const dictaphoneRef = useRef<HTMLButtonElement | null>(null);
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [showSummaryModal, setShowSummaryModal] = useState(false);
  // const [summary, setSummary] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const worker = useRef<Worker | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loadingTTS, setLoadingTTS] = useState<Record<string, boolean>>({});
  const [modelLoadingProgresses, setModelLoadingProgresses] = useState<
    Record<string, ModelLoadingProgress>
  >({});
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  // Add a system message for model loading
  const addSystemMessage = (text: string) => {
    addMessage({
      text,
      by: "system",
      audioUrl: null,
      id: self.crypto.randomUUID(),
      langCode: "en",
    });
  };

  useEffect(() => {
    const setupWorker = async () => {
      try {
        await checkAiAvailability();

        if (!worker.current) {
          console.log("Initializing worker...");
          worker.current = new Worker(
            new URL("../worker.js", import.meta.url),
            {
              type: "module",
            }
          );

          const onMessageReceived = (e: MessageEvent) => {
            console.log("Worker message received:", e.data);
            switch (e.data.status) {
              case "loading":
                // eslint-disable-next-line no-case-declarations
                const { details } = e.data;

                // Update loading progresses
                setModelLoadingProgresses((prev) => ({
                  ...prev,
                  [details.file]: details,
                }));

                // Add or update system message for this file
                // addSystemMessage(
                //   `Loading ${details.name}: ${details.file} (${details.progress}%)`
                // );
                break;

              case "ready":
                console.log("Worker is ready to receive messages");
                setModelLoadingProgresses({});
                break;

              case "complete":
                console.log("Setting output URL");
                setOutput(URL.createObjectURL(e.data.output));
                // Use Zustand store to update message audio
                updateMessageAudio(
                  e.data.id,
                  URL.createObjectURL(e.data.output)
                );
                setLoadingTTS((prev) => ({ ...prev, [e.data.id]: false }));
                break;

              case "error":
                console.error("Worker error:", e.data.error);
                // addSystemMessage(`Error loading model: ${e.data.error}`);
                break;

              default:
                console.log("Worker message:", e.data);
            }
          };

          const onWorkerError = (error: ErrorEvent) => {
            console.error("Worker error:", error);
            addSystemMessage(`Worker error: ${error.message}`);
          };

          worker.current.onerror = onWorkerError;
          worker.current.onmessage = onMessageReceived;

          console.log("Worker event listeners attached");
        }
      } catch (error) {
        console.error("Error setting up worker:", error);
        addSystemMessage(
          `Error setting up worker: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    setupWorker();

    return () => {
      if (worker.current) {
        console.log("Terminating worker...");
        worker.current.terminate();
        worker.current = null;
      }
    };
  }, []);

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    saveSrcLanguage(targetLanguage);
    saveTargetLanguage(sourceLanguage);
  };

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
    addMessage({
      text: message,
      by: "user",
      audioUrl: null,
      id: self.crypto.randomUUID(),
      langCode: sourceLanguage.code,
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

      const newMessageId = self.crypto.randomUUID();

      // Add AI message
      addMessage({
        text: resp[0].message.content!,
        by: "ai",
        audioUrl: null,
        id: newMessageId,
        langCode: targetLanguage.code,
      });

      if (worker.current) {
        if (targetLanguage.code === "en") {
          console.log("Sending message to worker:", {
            text: resp[0].message.content,
            id: newMessageId,
          });

          setLoadingTTS((prev) => ({ ...prev, [newMessageId]: true }));
          worker.current.postMessage({
            text: resp[0].message.content,
            language: targetLanguage.llmModelId,
            id: newMessageId,
          });
        }
      } else {
        console.error("Worker not initialized");
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSummarize = async () => {
  //   try {
  //     setIsLoading(true);
  //     const summaryResult = await summarizeConversation({
  //       sourceLanguage: sourceLanguage.name,
  //       targetLang: targetLanguage.name,
  //       prompt: JSON.stringify(messages),
  //       provider: AIProvider.GeminiNano,
  //     });
  //     setSummary(
  //       summaryResult
  //         .filter((r) => r.summary)
  //         .map((r) => `${r.language}:\n ${r.summary}`)
  //         .join("\n\n") || "No summary available"
  //     );
  //     setShowSummaryModal(true);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const handlePlayAudio = async (text: string, id: string) => {
    const message = messages.find((msg) => msg.id === id);
    if (!message?.audioUrl) {
      if (aiAvailable) {
        setLoadingTTS((prev) => ({ ...prev, [id]: true }));
        worker.current?.postMessage({ text, id });
      }
      return;
    }
    setOutput("");
    setTimeout(() => {
      console.log(message!.audioUrl, "new audio to play");
      setOutput(message!.audioUrl);
    }, 0);
  };

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={isLoadingModalOpen}
        onClose={() => setIsLoadingModalOpen(false)}
        modelLoadingProgresses={modelLoadingProgresses}
      />

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
            fieldName="sourceLang"
          />
          {/* Swap Button */}
          <div
            className="tooltip tooltip-primary tooltip-bottom"
            data-tip="Swap languages"
          >
            <button
              type="button"
              onClick={handleSwapLanguages}
              className="btn btn-outline btn-primary btn-block"
              aria-label="Swap Languages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </button>
          </div>
          <LanguagePicker
            defaultLang={targetLanguage}
            label={"Target Language"}
            onChange={(lang: ZubaanLanguage) => {
              setTargetLanguage(lang);
              saveTargetLanguage(lang);
            }}
            fieldName="targetLang"
          />
        </div>
        {/* Download Indicator */}
        {Object.keys(modelLoadingProgresses).length > 0 && (
          <div
            role="alert"
            className="alert bg-primary text-primary-content mt-10"
            onClick={() => setIsLoadingModalOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Downloading models for speech... Click for details.</span>
          </div>
        )}
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
            } else if (message.by === "ai") {
              return (
                <div key={index} className="chat chat-start">
                  <div className="chat-bubble chat-bubble-primary flex items-center">
                    {message.text}
                    {(message.langCode === "en" || loadingTTS[message.id]) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(message.text, message.id);
                        }}
                        className="ml-2"
                      >
                        {loadingTTS[message.id] ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            } else if (message.by === "system") {
              <div key={index} className="chat chat-start">
                <div className="chat-bubble chat-bubble-warning">
                  {message.text}
                </div>
              </div>;
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
        <button
          disabled={listening || isLoading}
          type="button"
          className="btn"
          onClick={() => clearMessages()}
        >
          Clear Chat
        </button>
      </form>

      {/* {showSummaryModal && (
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
      )} */}
      {output && (
        <div className="hidden">
          <AudioPlayer audioUrl={output} mimeType={"audio/wav"} />
        </div>
      )}
    </>
  );
};

export default Chat;
