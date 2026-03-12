self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "You have a notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "default",
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    actions: [{ action: "open", title: "Open App" }],
  };
  event.waitUntil(self.registration.showNotification(data.title || "Trevian Oar", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      return clients.openWindow("/crew");
    })
  );
});
