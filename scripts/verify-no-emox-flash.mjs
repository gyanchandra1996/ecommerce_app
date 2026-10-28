// scripts/verify-no-emox-flash.mjs
async function run() {
  const res = await fetch("http://localhost:3001");
  const html = await res.text();

  console.log("Status:", res.status);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  console.log("Page <title>:", title);

  const hasEmox = html.toLowerCase().includes("emox");
  console.log("Does initial SSR HTML contain 'emox'?", hasEmox);

  // Check API menu
  const menuRes = await fetch("http://localhost:3001/api/menu");
  const menuJson = await menuRes.json();
  const menuLabels = menuJson.data.map((m) => m.label);
  console.log("Menu labels:", menuLabels);

  // Check Settings
  const setRes = await fetch("http://localhost:3001/api/settings");
  const setJson = await setRes.json();
  console.log("Settings themeName:", setJson.data.themeName);
  console.log("Settings siteTitle:", setJson.data.siteTitle);

  // Check Sliders
  const sliderRes = await fetch("http://localhost:3001/api/sliders?position=triple_promo");
  const sliderJson = await sliderRes.json();
  console.log("Promo sliders tags:", sliderJson.data.map((s) => ({ tag: s.tag, title: s.title })));
}

run().catch(console.error);
