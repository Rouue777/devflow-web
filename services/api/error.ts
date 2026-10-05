import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data: unknown = error.response?.data;

  if (!data || typeof data !== "object" || !("message" in data)) {
    return fallback;
  }

  const { message } = data;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find(
      (item): item is string => typeof item === "string" && Boolean(item.trim()),
    );

    return firstMessage ?? fallback;
  }

  return fallback;
}
