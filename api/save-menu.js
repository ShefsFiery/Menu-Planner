// This file should be placed at: /api/save-menu.js in your Vercel project

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'appPgk1uhCYcUbHIg';
    const MENUS_TABLE_ID = 'tbl9YPagJD8v4Mj4R';

    if (!AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    const { startDate, endDate, recipes } = req.body;

    if (!startDate || !endDate || !recipes || recipes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recipeNames = recipes.map(r => r.name).join(', ');
    const recipeIds = recipes.map(r => r.id);

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MENUS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Week Starting': startDate,
            'Status': 'Planned',
            'Notes': `Recipes: ${recipeNames}\nEnd Date: ${endDate}\nRecipe IDs: ${recipeIds.join(',')}`
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    res.status(200).json({ success: true, menu: data });
  } catch (error) {
    console.error('Error saving menu:', error);
    res.status(500).json({ error: error.message });
  }
}
