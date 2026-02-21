import os
import json
import subprocess
from rich.console import Console
from rich.prompt import Prompt, Confirm

console = Console()

def clear_terminal():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    clear_terminal()
    console.print("[bold cyan]\n🚀 Welcome to CF-Stealth-Bridge Installer 🚀\n[/bold cyan]")

    panel_domain = Prompt.ask("Enter your X-UI Panel Domain (e.g., panel.yourdomain.com)")
    panel_port = Prompt.ask("Enter your X-UI Panel Port", default="2083")

    routes = {}
    
    console.print("\n[bold yellow]--- Configure VPN Subdomains ---[/bold yellow]")
    while True:
        path = Prompt.ask("Enter the URL path for this config (e.g., sub1)")
        host = Prompt.ask(f"Enter the blocked Subdomain for /{path} (e.g., sub1.yourdomain.com)")
        port = Prompt.ask(f"Enter the Cloudflare Port for /{path}", default="443")
        
        routes[path] = {"host": host, "port": port}
        
        if not Confirm.ask("Do you want to add another VPN path?"):
            break

    clear_terminal()
    with console.status("[cyan]Generating Worker Code...[/cyan]"):
        worker_code = f"""
export default {{
  async fetch(request, env, ctx) {{
    const url = new URL(request.url);
    const originalHost = url.hostname; 
    
    let targetHost = '{panel_domain}'; 
    let targetPort = '{panel_port}';

    const pathPrefix = url.pathname.split('/')[1];

    const vpnRoutes = {json.dumps(routes, indent=6)};

    if (pathPrefix && vpnRoutes[pathPrefix]) {{
      targetHost = vpnRoutes[pathPrefix].host;
      targetPort = vpnRoutes[pathPrefix].port;
    }}

    url.hostname = targetHost;
    url.protocol = 'https:';
    url.port = targetPort;
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetHost);
    newHeaders.set('X-Forwarded-Host', originalHost);
    newHeaders.set('X-Forwarded-Proto', 'https');

    const newRequest = new Request(url, {{
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual' 
    }});

    const response = await fetch(newRequest);

    if (response.status >= 300 && response.status < 400) {{
      const location = response.headers.get('Location');
      if (location) {{
        const rewrittenLocation = location
          .replace(`https://${{targetHost}}:${{targetPort}}`, `https://${{originalHost}}`)
          .replace(`https://${{targetHost}}`, `https://${{originalHost}}`);
          
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Location', rewrittenLocation);
        return new Response(response.body, {{ status: response.status, headers: responseHeaders }});
      }}
    }}
    return response;
  }}
}};
"""
        with open("worker.js", "w") as f:
            f.write(worker_code.strip())
            
    console.print("[bold green]✔ worker.js generated successfully!\n[/bold green]")

    if Confirm.ask("Do you want to deploy this automatically to Cloudflare?"):
        worker_name = Prompt.ask("Enter a name for your Worker", default="stealth-bridge")
        
        with open("wrangler.toml", "w") as f:
            f.write(f'name = "{worker_name}"\nmain = "worker.js"\ncompatibility_date = "2024-02-21"')
        
        console.print("\n[yellow]Executing Wrangler... Please follow the browser prompt to login if necessary.[/yellow]")
        try:
            subprocess.run(["npx", "wrangler", "login"], check=True) 
            subprocess.run(["npx", "wrangler", "deploy"], check=True) 
            console.print("\n[bold green]🎉 Deployment Complete![/bold green]")
        except subprocess.CalledProcessError:
            console.print("\n[bold red]✖ Deployment failed. Make sure Node.js and npx are installed.[/bold red]")

if __name__ == "__main__":
    main()