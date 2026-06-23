import { execSync } from 'child_process';

const envs = ['production', 'preview', 'development'];
const vars = {
    ODOO_URL: 'https://odoo-sil0.srv1743105.hstgr.cloud',
    ODOO_DB: 'real-estate',
    ODOO_USERNAME: 'princekaada19@gmail.com',
    ODOO_API_KEY: '51cd475197971a82803fa059f9a5fd1fad0b0601'
};

console.log("Starting environment variables sync to Vercel...");

for (const [key, value] of Object.entries(vars)) {
    for (const env of envs) {
        try {
            console.log(`Setting ${key} for ${env}...`);
            const command = `vercel env add ${key} ${env} --value "${value}" --force --yes`;
            const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
            console.log(`Success: ${output.trim()}`);
        } catch (error) {
            console.error(`Error setting ${key} for ${env}:`, error.message);
            if (error.stderr) console.error("Details:", error.stderr.trim());
        }
    }
}

console.log("Environment variables sync complete!");
