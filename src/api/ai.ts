let translationsSession: AIAssistant;
let summarySession: AIAssistant;
let isGeminiNanoAvailable: boolean = false;

export type AIResponse = Array<{
  message: {
    content: string;
  };
}>;

export enum AIProvider {
  ChatGpt,
  GeminiNano,
}

export type AIParams = {
  sourceLanguage: string;
  targetLang: string;
  prompt: string;
  provider: AIProvider;
};

export const checkGeminiNanoAvailability = async () => {
  const isAvailable = (await self.ai?.languageModel?.capabilities?.())
    ?.available;
  isGeminiNanoAvailable = isAvailable && isAvailable !== "no";
  if (!isGeminiNanoAvailable) {
    alert(
      "Gemini Nano is not available in your browser. Please see the readme for more information."
    );
  }
  return isGeminiNanoAvailable;
};

export async function translateText({
  sourceLanguage,
  targetLang,
  prompt,
  provider,
}: AIParams): Promise<AIResponse> {
  if (!isGeminiNanoAvailable) {
    throw new Error("Gemini Nano is not available in your browser.");
  }
  const finalPrompt = `
  You are an expert translation helper, proficient in many languages.
  Provide exact translations of the sentences from source language to target language.
  Do not add anything extra.
  Translate the following into ${targetLang} from ${sourceLanguage}: ${prompt}`;
  return processPrompt(finalPrompt, provider);
}

export async function summarizeConversation({
  sourceLanguage,
  targetLang,
  prompt,
  provider,
}: AIParams): Promise<
  {
    language: string;
    summary: string;
  }[]
> {
  if (!isGeminiNanoAvailable) {
    throw new Error("Gemini Nano is not available in your browser.");
  }
  const responses: {
    language: string;
    summary: string;
  }[] = [];
  const languages = [sourceLanguage, targetLang];

  for await (const lang of languages) {
    await createSession(provider, "summary");
    const finalPrompt = `
    You are an expert translator and summarizer. Your task is to provide a concise summary of a bilingual conversation.

    Context:
    - The conversation is between speaker of ${sourceLanguage} and bot in ${targetLang}.
    - The conversation history is provided as a JSON array, containing both original messages and their translations.

    Instructions:
    1. Analyze the entire conversation, considering both languages.
    2. Identify the main topics, key points, and any important decisions or conclusions reached.
    3. Create a clear and concise summary that captures the essence of the conversation.
    4. Your summary should be in ${lang}.
    5. Aim for a summary length of about 3-5 sentences. Not more than 100 words.

    Conversation history:
    ${prompt}

    Please provide the summary:`;

    const result = await processPrompt(finalPrompt, provider);
    if (result.length) {
      responses.push({
        language: lang,
        summary: result[0].message.content,
      });
    }
    await destroySession("summary");
  }
  return responses;
}

export const createSession = async (
  provider: AIProvider,
  sessionType: "translations" | "summary"
) => {
  switch (provider) {
    case AIProvider.GeminiNano:
      {
        const isAvailable = (await self.ai?.languageModel?.capabilities?.())
          ?.available;
        if (!isAvailable || isAvailable === "no") {
          alert(
            "Gemini Nano is not available in your browser. Please see the readme for more information."
          );
          return;
        } else {
          if (sessionType === "translations") {
            translationsSession = await self.ai.languageModel.create({
              topK: 1,
              temperature: 0.1,
            });
          } else {
            summarySession = await self.ai.languageModel.create();
          }
        }
      }
      break;
  }
};

export const destroySession = async (
  sessionType: "translations" | "summary"
) => {
  if (sessionType === "translations") {
    translationsSession?.destroy();
  } else {
    summarySession?.destroy();
  }
};

const processPrompt = async (prompt: string, provider: AIProvider) => {
  switch (provider) {
    case AIProvider.ChatGpt:
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     { "role": "system", "content": "You are a translator." },
    //     { "role": "user", "content": finalPrompt }
    //   ],
    //   model: 'gpt-3.5-turbo',
    // });
    // return completion.choices;
    // eslint-disable-next-line no-fallthrough
    case AIProvider.GeminiNano:
    default: {
      await createSession(provider, "translations");
      const result = await translationsSession.prompt(prompt);
      await destroySession("translations");
      return [
        {
          message: {
            content: result,
          },
        },
      ];
    }
  }
};
