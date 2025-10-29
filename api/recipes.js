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

        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${RECIPES_TABLE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                },
            }
        );

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
}
