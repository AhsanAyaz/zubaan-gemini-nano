import { env, pipeline } from "@xenova/transformers";
import { encodeWAV } from "./utils";
env.allowLocalModels = false;

// Initialize the TTS pipeline
let synthesizer = null;

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  try {
    console.log("Worker received message:", event.data);
    const { text, id } = event.data;

    // Initialize the pipeline if not already done
    if (!synthesizer) {
      console.log("Initializing TTS pipeline...");

      // Custom progress tracking
      const progressCallback = (progress) => {
        // Check if this is a progress event with the specific structure
        if (progress.status === "progress") {
          // Send progress updates to the main thread
          self.postMessage({
            status: "loading",
            details: {
              name: progress.name,
              file: progress.file,
              loaded: progress.loaded,
              total: progress.total,
              progress: Math.round((progress.loaded / progress.total) * 100),
            },
          });
        }
      };

      synthesizer = await pipeline("text-to-speech", "Xenova/speecht5_tts", {
        quantized: false,
        progress_callback: progressCallback,
      });

      // Explicitly mark as ready after full initialization
      self.postMessage({ status: "ready" });
    }

    console.log("Generating speech for text:", text);
    const speaker_embeddings =
      "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";

    // Generate speech using the model
    const output = await synthesizer(text, { speaker_embeddings });
    console.log("Speech generated, encoding WAV...");
    const wav = encodeWAV(output.audio, output.sampling_rate);

    // Send the output back to the main thread with the audio URL
    self.postMessage({
      status: "complete",
      output: new Blob([wav], { type: "audio/wav" }),
      text: text,
      id,
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
