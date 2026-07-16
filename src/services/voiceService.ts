const N8N_WEBHOOK_URL = "https://saksham2026.app.n8n.cloud/webhook/d82608f3-923a-4460-a935-c44c4c6b3fed/chat";

// Generate a persistent session ID per browser session so n8n can maintain context
function getSessionId(): string {
  let sid = sessionStorage.getItem("fasalseva_chat_sid");
  if (!sid) {
    sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("fasalseva_chat_sid", sid);
  }
  return sid;
}

export const voiceService = {
  async askAssistant(query: string): Promise<string> {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: query,
          sessionId: getSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // n8n chat webhooks return the output in different shapes depending on the workflow.
      // Try the most common response fields in order:
      return (
        data?.output ||
        data?.text ||
        data?.message ||
        data?.response ||
        data?.answer ||
        (Array.isArray(data) && (data[0]?.output || data[0]?.text || data[0]?.message)) ||
        "Sorry, I couldn't understand the response from the server."
      );
    } catch (err: any) {
      console.error("[FasalSeva AI] n8n agent error:", err);
      if (err?.message?.includes("fetch")) {
        return "Network error — please check your internet connection and try again.";
      }
      return "The AI agent is temporarily unavailable. Please try again in a moment.";
    }
  },
};
