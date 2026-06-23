import fetch from 'node-fetch'; // Vercel has native fetch, but locally we can import or use global fetch if node is v18+
// Since we are running Node v20, global fetch is available.

const payload = {
    name: "Prince Test (Live API)",
    phone: "+91 99999 88888",
    email: "test@quickkitai.com",
    businessName: "Test Real Estate Live",
    projectName: "Odoo Live Integration Test",
    notes: "Live test sent to production endpoint to verify Firestore + Nodemailer + Odoo Integration.",
    price: 999
};

async function runLiveTest() {
    console.log("Sending live test payload to https://quickkitai.com/api/system?action=lead...");
    try {
        const response = await fetch("https://quickkitai.com/api/system?action=lead", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        console.log(`Response Status: ${status}`);
        
        const data = await response.json();
        console.log("Response Body:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Failed to connect to live API:", e);
    }
}

runLiveTest();
