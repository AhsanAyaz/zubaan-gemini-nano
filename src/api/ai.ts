declare var ai: any;

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
    }),
  );

  return [
    {
      message: {
        content: responses.join(","),
      },
    },
  ];
}

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
    case AIProvider.GeminiNano:
    default:
      const session = await ai.assistant.create();
      const result = await session.prompt(prompt);
      setTimeout(() => {
        session.destroy();
      }, 1000);
      return [
        {
          message: {
            content: result,
          },
        },
      ];
  }
};

