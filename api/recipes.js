export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'appPgk1uhCYcUbHIg';
    const RECIPES_TABLE_ID = 'tblUK3paGpKNupW8l';

    if (!AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${RECIPES_TABLE_ID}?maxRecords=100`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    
    const recipes = data.records.map(record => ({
      id: record.id,
      name: record.fields['Recipe Name'] || 'Unnamed Recipe',
      type: record.fields['Recipe Type'] || 'Unknown',
      productionType: record.fields['Production Type'] || '',
      cuisine: record.fields['Cuisine Region'] || '',
      spiceLevel: record.fields['Spice Level'] || '',
      ingredients: record.fields['Ingredients List'] || '',
      vegetarian: record.fields['Vegetarian Option'] || false
    }));

    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: error.message });
  }
}
