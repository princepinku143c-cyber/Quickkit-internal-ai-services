import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually to load environment variables
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const parts = trimmed.split('=');
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
        console.log("Loaded environment variables from .env.local.");
    }
} catch (e) {
    console.error("Error reading .env.local:", e);
}

const odooUrl = process.env.ODOO_URL;
const odooDb = process.env.ODOO_DB;
const odooUsername = process.env.ODOO_USERNAME;
const odooApiKey = process.env.ODOO_API_KEY;

async function verifyLead() {
    try {
        console.log("Authenticating with Odoo...");
        const authResponse = await fetch(`${odooUrl}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "login",
                    args: [odooDb, odooUsername, odooApiKey]
                },
                id: Date.now()
            })
        });

        const authData = await authResponse.json();
        const uid = authData.result;
        
        if (!uid) {
            console.error("Auth failed!");
            return;
        }
        console.log(`Auth success, UID: ${uid}`);

        console.log("Searching for the lead in Odoo crm.lead model...");
        const searchResponse = await fetch(`${odooUrl}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        odooDb,
                        uid,
                        odooApiKey,
                        "crm.lead",
                        "search_read",
                        [[["name", "like", "Prince Test"]]],
                        { fields: ["name", "contact_name", "email_from", "phone", "description", "create_date"] }
                    ]
                },
                id: Date.now() + 1
            })
        });

        const searchData = await searchResponse.json();
        console.log("\nOdoo Search Results:");
        console.log(JSON.stringify(searchData.result, null, 2));

    } catch (e) {
        console.error("Error connecting to Odoo:", e);
    }
}

verifyLead();
