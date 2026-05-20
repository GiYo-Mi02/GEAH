// ─── Puter.js Global Type Declaration ──────────────────────────────
// Puter.js loads as a browser global via <script> tag.
// Never import it — always access via window.puter.

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            stream?: boolean;
            systemPrompt?: string;
          }
        ) => Promise<{ message: { role: string; content: string } }>;
      };
      fs: {
        write: (path: string, data: string) => Promise<void>;
        read: (path: string) => Promise<string>;
      };
      auth: {
        isSignedIn: () => boolean;
        signIn: () => Promise<void>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<void>;
        del: (key: string) => Promise<void>;
      };
    };
  }
}

export {};
