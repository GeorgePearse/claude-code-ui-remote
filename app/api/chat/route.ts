import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createGraphSandbox } from '@/lib/sandbox';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages,
    system: `You are an expert React developer specializing in data visualization.
    When asked to generate a graph or visualization:
    1. Design a visually appealing, interactive dashboard or graph.
    2. Use 'recharts' or 'nivo' or 'visx' or 'victory' for charts.
    3. Use Tailwind CSS for layout and styling.
    4. Generate the full source code for 'App.tsx'.
    5. Call the 'generate_graph' tool with the code and required dependencies.
    
    The code must be a default export function App() { ... }.
    Imports must be at the top.
    Do not omit code. Write the full functional component.
    
    Example dependencies: ["recharts", "lucide-react", "clsx", "tailwind-merge"]
    `,
    tools: {
      generate_graph: tool({
        description: 'Generates and deploys a React graph application',
        parameters: z.object({
          code: z.string().describe('The full source code for App.tsx'),
          dependencies: z.array(z.string()).describe('List of npm dependencies to install'),
        }),
        execute: async ({ code, dependencies }: { code: string, dependencies: string[] }) => {
          const logs: string[] = [];
          try {
            const onLog = (message: string) => logs.push(message);
            // Explicitly cast the result or ensuring it matches expected type
            const url = await createGraphSandbox(code, dependencies, onLog);
            return { url, logs };
          } catch (error) {
            console.error("Sandbox error:", error);
            return { error: String(error), logs };
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    },
  });

  return result.toUIMessageStreamResponse();
}
