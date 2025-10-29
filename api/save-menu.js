

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
        const MENUS_TABLE_ID = 'tblDPagJpagMNJSj';

        const { name, startDate, endDate, recipes } = req.body;

        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MENUS_TABLE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: {
                        Name: name,
                        'Start Date': startDate,
                        'End Date': endDate,
                        Recipes: recipes,
                    },
                }),
            }
        );

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error saving menu:', error);
        return res.status(500).json({ error: 'Failed to save menu' });
    }
}
