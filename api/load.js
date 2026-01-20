// /api/load.js
export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!token || !baseId) {
      return res.status(500).json({
        error: "Missing server configuration",
        details: "AIRTABLE_TOKEN or AIRTABLE_BASE_ID not set",
      });
    }

    const RECIPES_TABLE = "Recipes";
    const INGREDIENTS_TABLE = "Ingredients";

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    async function fetchAllRecords(table) {
      let records = [];
      let offset;

      do {
        const url = new URL(
          `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
        );
        url.searchParams.set("pageSize", "100");
        if (offset) url.searchParams.set("offset", offset);

        const r = await fetch(url, { headers });
        const data = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(data));

        records.push(...data.records);
        offset = data.offset;
      } while (offset);

      return records;
    }

    const recipes = await fetchAllRecords(RECIPES_TABLE);
    const ingredients = await fetchAllRecords(INGREDIENTS_TABLE);

    res.status(200).json({ recipes, ingredients });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}
