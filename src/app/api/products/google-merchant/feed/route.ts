import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const feedData = await DatabaseStore.generateGoogleMerchantFeed();

    if (format === "json") {
      return NextResponse.json(feedData);
    }

    // Standard Google Merchant RSS 2.0 / XML Feed
    const itemsXml = feedData.items
      .map(
        (item) => `
    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
      <g:availability>${escapeXml(item.availability)}</g:availability>
      <g:price>${escapeXml(item.price)}</g:price>
      <g:google_product_category>${escapeXml(item.google_product_category)}</g:google_product_category>
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:gtin>${escapeXml(item.gtin)}</g:gtin>
      <g:mpn>${escapeXml(item.mpn)}</g:mpn>
      <g:condition>${escapeXml(item.condition)}</g:condition>
    </item>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(feedData.title)}</title>
    <link>${escapeXml(feedData.link)}</link>
    <description>Google Merchant Center Product Catalog Feed for emox</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch {
    return new NextResponse("Failed to generate Google Merchant feed", { status: 500 });
  }
}

function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
