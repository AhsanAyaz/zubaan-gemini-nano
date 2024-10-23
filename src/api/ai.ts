let session: AIAssistant;

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

export async function translateText({
  sourceLanguage,
  targetLang,
  prompt,
  provider,
}: AIParams): Promise<AIResponse> {
  const finalPrompt = `Translate the following into ${targetLang} from ${sourceLanguage}: ${prompt}`;
  return processPrompt(finalPrompt, provider);
}

export async function summarizeConversation({
  sourceLanguage,
  targetLang,
  prompt,
  provider,
}: AIParams): Promise<AIResponse> {
  const responses = await Promise.all(
    [sourceLanguage, targetLang].map(async (lang) => {
      const finalPrompt = `Create a summary of all the content (source and translated) in language ${lang} from this JSON array. ${prompt}`;
      const result = await processPrompt(finalPrompt, provider);
      if (!result.length) {
        return {
          message: {
            content: "",
          },
        };
      }
      return result[0].message.content;
    })
  );

  return [
    {
      message: {
        content: responses.join(","),
      },
    },
  ];
}

export const initSession = async (provider: AIProvider) => {
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
          session = session
            ? await session.clone()
            : await self.ai.languageModel.create();
        }
      }
      break;
  }
};

export const destroySession = async () => {
  session?.destroy();
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
      const result = await session.prompt(prompt);
      console.log(result);
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
