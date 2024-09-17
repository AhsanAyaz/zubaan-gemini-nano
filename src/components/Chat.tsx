import { useRef, useState } from "react";
import LanguagePicker from "./LanguagePicker";
import Dictaphone from "./Dictaphone";
import { ZubaanLanguage } from "../utils/languages";
import { translateText, summarizeConversation, AIProvider } from "../api/ai";
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
    languagesFromStorage.sourceLanguage,
  );
  const [targetLanguage, setTargetLanguage] = useState<ZubaanLanguage>(
    languagesFromStorage.targetLanguage,
  );
  const [prompt, setPrompt] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const dictaphoneRef = useRef<HTMLButtonElement | null>(null);
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTextAreaKeyUp = async (
    ev: React.KeyboardEvent<HTMLTextAreaElement>,
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

  return (
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
      <button
        onClick={async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          try {
            setIsLoading(true);
            const summary = await summarizeConversation({
              sourceLanguage: sourceLanguage.name,
              targetLang: targetLanguage.name,
              prompt: JSON.stringify(messages),
              provider: AIProvider.GeminiNano,
            });
            console.log(summary[0].message.content);
            alert("Check the console for summary");
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        }}
        className="btn btn-secondary"
      >
        Summarize
      </button>
      <div className="flex-1">
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
      </div>
      {isLoading ? (
        <div className="w-full text-center">
          <Loader />
        </div>
      ) : (
        <Dictaphone
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
        disabled={listening}
        onChange={(ev) => {
          setPrompt(ev.target.value);
        }}
        onKeyUp={(ev) => handleTextAreaKeyUp(ev)}
        value={prompt}
        placeholder={`What do you need translated?\nPress Shift+Enter for new line`}
        className="mt-4 placeholder:text-gray-500 focus:ring-primary focus:ring-1 textarea textarea-bordered textarea-lg w-full"
      ></textarea>
      <button disabled={listening} type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default Chat;
