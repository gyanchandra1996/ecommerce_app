/**
 * Push All Notifications & Deals to Mobile Devices (Bulk Broadcast)
 * Run from terminal:
 * node scripts/push-all-notifications.mjs
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

async function pushAllNotifications() {
  console.log("==================================================");
  console.log("  BROADCASTING ALL NOTIFICATIONS TO MOBILE APP");
  console.log("==================================================");
  console.log(`Backend Server: ${BASE_URL}\n`);

  try {
    const res = await fetch(`${BASE_URL}/api/notifications/broadcast-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      console.log(`✅ SUCCESS: ${data.message}`);
      console.log(`Total Notifications Pushed: ${data.broadcastCount}`);
      console.log(`Active Mobile Devices:      ${data.deviceCount}`);
      console.log(`Total Push Messages Sent:   ${data.totalPushDispatched}\n`);

      console.log("--- Pushed Items Summary ---");
      data.notifications?.forEach((n, idx) => {
        console.log(`[${idx + 1}] ${n.icon || "🔔"} ${n.title} (${n.badge || n.category}) -> ${n.actionUrl}`);
      });
      console.log("\nAll mobile devices will now see these deals and notification badges.");
    } else {
      console.error("❌ FAILED:", data.error || data);
    }
  } catch (err) {
    console.error("❌ NETWORK ERROR:", err.message);
  }
}

pushAllNotifications();
