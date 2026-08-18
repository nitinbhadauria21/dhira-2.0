import { randomUUID } from 'crypto';

export type OpenAiChatChunk = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { role?: string; content?: string };
    finish_reason: 'stop' | null;
  }>;
};

function chunkPayload(params: {
  id: string;
  model: string;
  created: number;
  delta: { role?: string; content?: string };
  finishReason: 'stop' | null;
}): string {
  const body: OpenAiChatChunk = {
    id: params.id,
    object: 'chat.completion.chunk',
    created: params.created,
    model: params.model,
    choices: [
      {
        index: 0,
        delta: params.delta,
        finish_reason: params.finishReason,
      },
    ],
  };
  return `data: ${JSON.stringify(body)}\n\n`;
}

/** Format a full assistant reply as OpenAI-compatible SSE chunks for ElevenLabs Custom LLM. */
export function encodeAssistantReplyAsSse(reply: string, model = 'dhira'): ReadableStream<Uint8Array> {
  const id = `chatcmpl-${randomUUID()}`;
  const created = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(chunkPayload({ id, model, created, delta: { role: 'assistant' }, finishReason: null })),
      );

      const text = reply.trim();
      if (text) {
        controller.enqueue(
          encoder.encode(chunkPayload({ id, model, created, delta: { content: text }, finishReason: null })),
        );
      }

      controller.enqueue(
        encoder.encode(chunkPayload({ id, model, created, delta: {}, finishReason: 'stop' })),
      );
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
