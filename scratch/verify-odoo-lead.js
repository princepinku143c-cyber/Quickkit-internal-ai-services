import fetch from 'node-fetch'; // Node 20 global fetch is available

const odooUrl = "https://odoo-sil0.srv1743105.hstgr.cloud";
const odooDb = "real-estate";
const odooUsername = "princekaada19@gmail.com";
const odooApiKey = "51cd475197971a82803fa059f9a5fd1fad0b0601";

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
