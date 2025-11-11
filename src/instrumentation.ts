// Instrumentation file to load OpenAI shims before any other code
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('openai/shims/node');
  }
}
