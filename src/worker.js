import { pipeline } from "@xenova/transformers";
import { encodeWAV } from "./utils";

// Initialize the TTS pipeline
let synthesizer = null;

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  try {
    console.log("Worker received message:", event.data);

    const { text } = event.data;

    // Initialize the pipeline if not already done
    if (!synthesizer) {
      console.log("Initializing TTS pipeline...");
      synthesizer = await pipeline("text-to-speech", "Xenova/mms-tts-eng", {
        quantized: false, // Set to true if you want to use the quantized version
      });
      self.postMessage({ status: "ready" });
    }

    console.log("Generating speech for text:", text);

    // Generate speech using the model
    const output = await synthesizer(text);

    console.log("Speech generated, encoding WAV...");
    const wav = encodeWAV(output.audio, output.sampling_rate); // Assuming output.audio is a Float32Array

    // Send the output back to the main thread
    self.postMessage({
      status: "complete",
      output: new Blob([wav], { type: "audio/wav" }),
    });
  } catch (error) {
    console.error("Worker error:", error);
    self.postMessage({
      status: "error",
      error: error.message,
    });
  }
});

console.log("Worker initialized");
