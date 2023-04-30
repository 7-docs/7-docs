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
