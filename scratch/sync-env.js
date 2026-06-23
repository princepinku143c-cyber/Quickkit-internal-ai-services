import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const envs = ['production', 'preview', 'development'];

const vars = {};
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
                vars[key] = value;
            }
        });
        console.log("Loaded configuration variables from .env.local.");
    }
} catch (e) {
    console.error("Error reading .env.local:", e);
}

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
