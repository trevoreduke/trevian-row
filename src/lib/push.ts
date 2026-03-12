import webpush from "web-push";

let initialized = false;

function init() {
  if (initialized) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (publicKey && privateKey && subject) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    initialized = true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPush(
  subscription: any,
  payload: { title: string; body: string; tag?: string }
) {
  init();
  if (!initialized) throw new Error("VAPID keys not configured");
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      return { expired: true };
    }
    throw err;
  }
  return { expired: false };
}
