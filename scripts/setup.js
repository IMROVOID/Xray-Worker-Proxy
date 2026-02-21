import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';

console.clear();
console.log(chalk.cyan.bold('\n🚀 Welcome to CF-Stealth-Bridge Installer 🚀\n'));

async function run() {
    const panelDomain = await input({ message: 'Enter your X-UI Panel Domain (e.g., panel.yourdomain.com):' });
    const panelPort = await input({ message: 'Enter your X-UI Panel Port (e.g., 2083):', default: '2083' });

    const routes = {};
    let addMore = true;

    console.log(chalk.yellow('\n--- Configure VPN Subdomains ---'));
    while (addMore) {
        const path = await input({ message: 'Enter the URL path for this config (e.g., sub1):' });
        const host = await input({ message: `Enter the blocked Subdomain for /${path} (e.g., sub1.yourdomain.com):` });
        const port = await input({ message: `Enter the Cloudflare Port for /${path} (e.g., 443, 2053, 2087):`, default: '443' });

        routes[path] = { host, port };

        addMore = await confirm({ message: 'Do you want to add another VPN path?', default: false });
    }

    console.clear();
    console.log(chalk.cyan('Generating Worker Code...'));

    const workerCode = `
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const originalHost = url.hostname; 
    
    let targetHost = '${panelDomain}'; 
    let targetPort = '${panelPort}';

    const pathPrefix = url.pathname.split('/')[1];

    const vpnRoutes = ${JSON.stringify(routes, null, 6)};

    if (pathPrefix && vpnRoutes[pathPrefix]) {
      targetHost = vpnRoutes[pathPrefix].host;
      targetPort = vpnRoutes[pathPrefix].port;
    }

    url.hostname = targetHost;
    url.protocol = 'https:';
    url.port = targetPort;
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetHost);
    newHeaders.set('X-Forwarded-Host', originalHost);
    newHeaders.set('X-Forwarded-Proto', 'https');

    const newRequest = new Request(url, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual' 
    });

    const response = await fetch(newRequest);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (location) {
        const rewrittenLocation = location
          .replace(\`https://\${targetHost}:\${targetPort}\`, \`https://\${originalHost}\`)
          .replace(\`https://\${targetHost}\`, \`https://\${originalHost}\`);
          
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Location', rewrittenLocation);
        return new Response(response.body, { status: response.status, headers: responseHeaders });
      }
    }
    return response;
  }
};`;

    fs.writeFileSync('worker.js', workerCode.trim());
    console.log(chalk.green('✔ worker.js generated successfully!\n'));

    const deploy = await confirm({ message: 'Do you want to deploy this automatically to Cloudflare?', default: true });

    if (deploy) {
        const workerName = await input({ message: 'Enter a name for your Worker:', default: 'stealth-bridge' });
        fs.writeFileSync('wrangler.toml', `name = "${workerName}"\nmain = "worker.js"\ncompatibility_date = "2024-02-21"`);

        try {
            console.log(chalk.yellow('\nExecuting Wrangler... Please follow the browser prompt to login if necessary.'));
            execSync('npx wrangler login', { stdio: 'inherit' });
            execSync('npx wrangler deploy', { stdio: 'inherit' });
            console.log(chalk.green.bold('\n🎉 Deployment Complete!'));
        } catch (error) {
            console.log(chalk.red('\n✖ Deployment failed. Make sure Node.js is installed properly.'));
        }
    }
}

run();