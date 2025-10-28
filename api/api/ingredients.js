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
    const INGREDIENTS_TABLE_ID = 'tblillbifFHNSGvI8';

    if (!AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INGREDIENTS_TABLE_ID}?maxRecords=200`,
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
    
    const ingredients = data.records.map(record => ({
      id: record.id,
      name: (record.fields['Ingredient Name'] || '').toLowerCase().trim(),
      unit: record.fields['Unit of Measure'] || '',
      inventory: record.fields['Current Inventory'] || 0
    }));

    res.status(200).json({ ingredients });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: error.message });
  }
}
