import { forwardRef, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./Dictaphone.css";

type DictaphoneProps = {
  language: string;
  sendMessage: (text: string) => void;
  propagateTranscript: (text: string) => void;
  propagateListening: (val: boolean) => void;
  disabled?: boolean;
};

const Dictaphone = forwardRef<HTMLButtonElement, DictaphoneProps>(
  (
    {
      language,
      sendMessage,
      propagateTranscript,
      propagateListening,
      disabled,
    },
    ref
  ) => {
    const {
      transcript,
      listening,
      resetTranscript,
      browserSupportsSpeechRecognition,
    } = useSpeechRecognition();
    const [isRunning, setIsRunning] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
      if (isRunning && transcript) {
        propagateTranscript(transcript);
        if (timer) {
          clearTimeout(timer);
        }
        setTimer(
          setTimeout(() => {
            stopListening();
          }, 2000)
        );
      }
    }, [transcript, propagateTranscript]);

    useEffect(() => {
      propagateListening(listening);
    }, [listening, propagateListening]);

    const stopListening = () => {
      SpeechRecognition.stopListening();
      if (transcript) {
        sendMessage(transcript);
        resetTranscript();
      }
      setIsRunning(false);
    };

    const startListening = () => {
      setIsRunning(true);
      SpeechRecognition.startListening({
        language,
        continuous: true,
      });
    };

    if (!browserSupportsSpeechRecognition) {
      return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
      <div className="text-center flex flex-col gap-4 items-center">
        <button
          ref={ref}
          disabled={disabled}
          className={`rounded-full p-6 hover:bg-primary duration-200 ${
            listening ? "bg-primary" : "border border-primary"
          } ${transcript ? " microphone" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            isRunning ? stopListening() : startListening();
          }}
        >
          {listening ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
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
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          )}
        </button>
      </div>
    );
  }
);
export default Dictaphone;
