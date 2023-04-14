export const writeToStdOut = (text?: string) => {
  if (!text) return;
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    const message = line.replace(/^data: /, '');
    if (message === '[DONE]') {
      process.stdout.write('\n\n');
      return;
    }
    try {
      const parsed = JSON.parse(message);
      const delta = parsed.choices[0].delta?.content;
      if (delta) process.stdout.write(delta);
    } catch (error) {
      console.error('Unable to parse chunk:', line);
      console.error(error);
    }
  }
};

interface Event {
  event: string;
  data: string;
}

export class TransformWithEvent {
  private sentEventOnce: boolean;
  private transformStream: TransformStream<Uint8Array, Uint8Array>;

  constructor(options: Event) {
    this.sentEventOnce = false;
    this.transformStream = this.createTransformStream(options);
  }

  private createTransformStream(options: Event): TransformStream<Uint8Array, Uint8Array> {
    return new TransformStream<Uint8Array, Uint8Array>({
      transform: (chunk, controller) => {
        if (!this.sentEventOnce) {
          const eventString = `event: ${options.event}\ndata: ${options.data}\n\n`;
          const customEventBytes = new TextEncoder().encode(eventString);
          controller.enqueue(customEventBytes);
          this.sentEventOnce = true;
        }
        controller.enqueue(chunk);
      }
    });
  }

  public getTransformStream(): TransformStream<Uint8Array, Uint8Array> {
    return this.transformStream;
  }
}
