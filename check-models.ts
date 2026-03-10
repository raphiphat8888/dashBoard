import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API key found in .env.local');
    process.exit(1);
}

fetch(\`https://generativelanguage.googleapis.com/v1beta/models?key=\${apiKey}\`)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log('Available models:');
            data.models.forEach((m: any) => console.log(m.name));
        } else {
            console.error('Error fetching models:', data);
        }
    })
    .catch(err => console.error(err));
