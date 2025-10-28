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
    const MENUS_TABLE_ID = 'tbl9YPagJD8v4Mj4R';

    if (!AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MENUS_TABLE_ID}?maxRecords=20&sort[0][field]=Week Starting&sort[0][direction]=desc`,
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
    
    const menus = data.records.map(record => {
      const notes = record.fields['Notes'] || '';
      
      const recipeIdsMatch = notes.match(/Recipe IDs: (.+?)(?:\n|$)/);
      const recipeIds = recipeIdsMatch 
        ? recipeIdsMatch[1].split(',').map(id => id.trim())
        : [];

      return {
        id: record.id,
        startDate: record.fields['Week Starting'] || '',
        status: record.fields['Status'] || '',
        notes: notes,
        recipeIds: recipeIds
      };
    });

    res.status(200).json({ menus });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: error.message });
  }
}
