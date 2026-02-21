export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const originalHost = url.hostname;

        // ==========================================
        // ⚙️ CONFIGURATION START
        // ==========================================

        // 1. DEFAULT ROUTE: Your Panel Dashboard & Subscription Links
        let targetHost = 'panel.yourdomain.com'; // Change to your X-UI domain
        let targetPort = '2083'; // Change to your X-UI port

        // 2. ROUTING MAP: Match URL paths to your specific VPN Subdomains
        const vpnRoutes = {
            'sub1': { host: 'sub1.yourdomain.com', port: '443' },
            'sub2': { host: 'sub2.yourdomain.com', port: '2087' }
            // Add more routes here as needed...
        };

        // ==========================================
        // 🛑 CONFIGURATION END (Do not edit below)
        // ==========================================

        const pathPrefix = url.pathname.split('/')[1];

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

        // Intercept and rewrite panel redirects to stay on the Worker URL
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('Location');
            if (location) {
                const rewrittenLocation = location
                    .replace(`https://${targetHost}:${targetPort}`, `https://${originalHost}`)
                    .replace(`https://${targetHost}`, `https://${originalHost}`);

                const responseHeaders = new Headers(response.headers);
                responseHeaders.set('Location', rewrittenLocation);

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders
                });
            }
        }

        return response;
    }
};