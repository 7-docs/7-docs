type Params = Record<string, string | null>;

export const getParams = async (req: Request): Promise<Params> => {
  const method = req.method;
  if (method === 'GET') {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') ?? '';
    const embedding_model = url.searchParams.get('embedding_model');
    const completion_model = url.searchParams.get('completion_model');
    return { query: decodeURIComponent(query), embedding_model, completion_model };
  } else {
    return await req.json();
  }
};

export const streamResponse = (body: BodyInit | null) => {
  const headers = { 'Content-Type': 'text/event-stream' };
  return new Response(body, { headers });
};
