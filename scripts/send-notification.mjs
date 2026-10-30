/**
 * Backend Push & In-App Notification Dispatcher
 * Run directly via terminal:
 * node scripts/send-notification.mjs --title "🔥 50% OFF Festive Sale" --body "Special discount on all electronics!" --category deal --badge "50% OFF"
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Parse CLI flags
const args = process.argv.slice(2);
function getArg(key, defaultVal) {
  const index = args.findIndex((a) => a === `--${key}` || a.startsWith(`--${key}=`));
  if (index === -1) return defaultVal;
  if (args[index].includes("=")) return args[index].split("=")[1];
  return args[index + 1] || defaultVal;
}

const title = getArg("title", "🔥 Top Deal: 50% OFF Diwali Mega Sale");
const body = getArg(
  "body",
  "Exclusive flash offer on Air Max sneakers and iPhone 16 Pro! Use code FESTIVE50."
);
const category = getArg("category", "deal"); // deal | offer | order | system
const badge = getArg("badge", "50% OFF");
const icon = getArg("icon", category === "offer" ? "🎁" : category === "order" ? "📦" : "🔥");
const actionUrl = getArg("url", "/(tabs)/deals");
const actionText = getArg("actionText", "View Deal");

async function sendNotification() {
  console.log("==========================================");
  console.log("  SENDING NOTIFICATION TO MOBILE APP");
  console.log("==========================================");
  console.log(`Target Backend: ${BASE_URL}`);
  console.log(`Title:          ${title}`);
  console.log(`Body:           ${body}`);
  console.log(`Category:       ${category}`);
  console.log(`Badge:          ${badge}`);
  console.log(`Action Link:    ${actionUrl}`);
  console.log("------------------------------------------");

  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        category,
        badge,
        icon,
        actionUrl,
        actionText,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      console.log("✅ SUCCESS: Notification broadcasted successfully!");
      console.log(`Notification ID: ${data.data?.id}`);
      console.log(`Push Dispatched: ${data.pushSentCount || 0} devices`);
      console.log("Mobile app will show floating banner & update unread badge.");
    } else {
      console.error("❌ FAILED:", data.error || data);
    }
  } catch (err) {
    console.error("❌ NETWORK ERROR:", err.message);
  }
}

sendNotification();
