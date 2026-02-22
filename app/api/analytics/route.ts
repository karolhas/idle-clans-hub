import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextResponse } from "next/server";

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [response] = await analyticsClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: firstDayOfMonth,
          endDate: "today",
        },
      ],
      metrics: [{ name: "screenPageViews" }],
    });

    const views = response.rows?.[0]?.metricValues?.[0]?.value ?? "0";

    return NextResponse.json({ views: parseInt(views, 10) });
  } catch (error) {
    console.error("GA4 Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
