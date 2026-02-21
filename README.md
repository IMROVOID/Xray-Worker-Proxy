# CF-Stealth-Bridge

A modern, high-performance path-based reverse proxy powered by Cloudflare Workers. This project is built from the ground up to securely bridge VPN connections behind a single Cloudflare URL, bypassing SNI filtering and local censorship.

## ✨ Key Features

* **Path-Based Routing:** Completely eliminates the need for multiple custom domains. Route all your X-UI inbound connections through a single Cloudflare Worker URL using URL paths (e.g., `/sub1`, `/sub2`).
* **Direct Panel Access:** Automatically intercepts and rewrites HTTP redirects, allowing you to access your X-UI dashboard directly through the Worker without exposing your backend IP or port.
* **Seamless Subscription Updates:** Natively supports X-UI subscription links, bridging them silently so your clients receive updated configurations without the firewall dropping the connection.
* **Automated Setup Scripts:** Includes modern CLI tools (Node.js & Python) to dynamically generate your custom Worker code and deploy it directly to Cloudflare.
* **Zero Server-Side Footprint:** Everything runs securely on Cloudflare's Edge network.

## 🔌 Protocol Compatibility

Because Cloudflare Workers operate strictly at Layer 7 (the HTTP/HTTPS web layer), compatibility depends entirely on your **Transport Network**, not the core VPN protocol.

**✅ Supported Protocols** (Must use `ws`, `xhttp`, or `gRPC` network types):

* VLESS
* VMess
* Trojan
* Shadowsocks (SS)
* Standard HTTP/HTTPS Proxying

**❌ Unsupported Protocols** (Will be dropped by Cloudflare):

* Hysteria & Hysteria2 (Uses raw UDP)
* TUIC (Uses raw UDP)
* WireGuard (Uses raw UDP)
* Any protocol over raw `tcp` transport
* VLESS-REALITY (Cloudflare intercepts the required TLS handshake)

## 📁 Project Structure

The project is organized into a clean and scalable structure to make navigation and modification intuitive.

```text
/
├── scripts/        # Automated CLI setup tools
│   ├── setup.js    # Node.js interactive builder
│   └── setup.py    # Python interactive builder
├── template/       # Base Worker logic
│   └── worker.js   # The core Cloudflare Worker script
├── README.md       # Project documentation
└── package.json    # NPM dependencies for the setup script
```

## ⚙️ How to Run the Project

You can set up and deploy the Worker in multiple ways depending on your preference.

### Method 1: Automated CLI Setup (Recommended)

Use our interactive scripts to generate your custom code and automatically deploy it to Cloudflare Workers via Wrangler.

1. **Clone the repository:**

```sh
git clone https://github.com/YOUR_USERNAME/CF-Stealth-Bridge.git
cd CF-Stealth-Bridge
```

1. **Run the Setup Wizard:**

* **Using Node.js:**

```sh
npm install
npm run setup
```

* **Using Python:**

```sh
pip install rich
python scripts/setup.py
```

1. **Follow the Prompts:** The script will ask for your Panel URL, Ports, and VPN Subdomains, build the code, and securely log you into Cloudflare to deploy.

### Method 2: Manual Deployment

If you prefer to configure everything manually via the Cloudflare Dashboard:

1. Download the latest [worker.js](https://github.com/IMROVOID/Xray-Worker-Proxy/releases/latest/download/worker.js) release from GitHub.
2. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages** > **Create Worker**.
3. Paste the `worker.js` code into the online editor.
4. Modify the `vpnRoutes` dictionary and the `targetHost` variables with your specific domains and ports.
5. Click **Deploy**.

## 📦 Automated Releases (GitHub Actions)

This repository includes a pre-configured GitHub Actions workflow to automatically package and publish new releases.

You can trigger a release in two ways:

**1. Using the GitHub Dashboard (Manual or Auto-bump)**

* Navigate to the **Actions** tab in your repository.
* Select the **Generate and Publish Release** workflow on the left sidebar.
* Click the **Run workflow** dropdown.
* You can either type a specific version into the **Custom Tag** field (e.g., `v1.2.0`), or leave it blank and select Patch/Minor/Major to have the workflow automatically calculate the next version for you.

**2. Using the Git CLI (Auto-trigger)**
Simply push a version tag directly to your repository. The workflow will intercept it and automatically attach the `worker.js` file to a new release page.

```sh
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 How to Configure Your Clients

Once the Worker is deployed, update your VPN clients (e.g., v2rayNG, Nekobox, V2rayN) with the following standard configuration format:

* **Address:** `198.41.199.172` *(or any working Clean IP)*
* **Port:** `443` *(or any Cloudflare port)*
* **SNI:** `your-worker-name.your-account.workers.dev` *(Your Worker URL)*
* **Request Host:** `your-worker-name.your-account.workers.dev`
* **Path:** `/sub1` *(The specific path you assigned to that config)*

## 🛠️ Technologies & Libraries Used

This project leverages several modern tools to achieve its functionality and seamless deployment.

| Library | Link | Description |
| --- | --- | --- |
| **Cloudflare Workers** | [workers.cloudflare.com](https://workers.cloudflare.com/) | Serverless execution environment running on Cloudflare's global edge network. |
| **Wrangler CLI** | [npmjs.com/package/wrangler](https://www.npmjs.com/package/wrangler) | The official command-line tool for building and deploying Cloudflare Workers. |
| **Inquirer.js** | [npmjs.com/package/@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) | A collection of common interactive command line user interfaces for Node.js. |
| **Chalk** | [npmjs.com/package/chalk](https://www.npmjs.com/package/chalk) | Terminal string styling done right for Node.js scripts. |
| **Rich** | [rich.readthedocs.io](https://rich.readthedocs.io/) | A Python library for rich text and beautiful formatting in the terminal. |

---

## 📜 License

This project is open-source and licensed under the **[GNU General Public License v3.0 (GPL-3.0)](https://choosealicense.com/licenses/gpl-3.0/)**.

### Summary of Key Requirements

The GPL-3.0 is a strong copyleft license that ensures the software remains free. If you use, modify, or distribute this code, you must adhere to the following:

* **Disclose Source:** You must make the source code available when you distribute the software.
* **License & Copyright Notice:** You must include a copy of the license and the original author's copyright notice.
* **Same License (Copyleft):** Any modifications or derived works must also be licensed under GPL-3.0.
* **State Changes:** You must clearly indicate if you have modified the original files.
* **No Warranty:** This software is provided "as is" without any warranty of any kind.

> This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

For full details, please refer to the [LICENSE](/LICENSE) file in this repository.

---

## © About the Developer

This application was developed and is maintained by **Roham Andarzgou**.

I'm a passionate professional from Iran specializing in Graphic Design, Web Development, and cross-platform app development with Dart & Flutter. I thrive on turning innovative ideas into reality, whether it's a stunning visual, a responsive website, or a polished desktop app like this one. I also develop immersive games using Unreal Engine.

* **Website:** [rovoid.ir](https://rovoid.ir)
* **GitHub:** [IMROVOID](https://github.com/IMROVOID)
* **LinkedIn:** [Roham Andarzgou](https://www.linkedin.com/in/roham-andarzgouu)

### 🙏 Support This Project

If you find this application useful, please consider a donation. As I am based in Iran, cryptocurrency is the only way I can receive support. Thank you!

| Cryptocurrency | Address |
| --- | --- |
| **Bitcoin** (BTC) | `bc1qd35yqx3xt28dy6fd87xzd62cj7ch35p68ep3p8` |
| **Ethereum** (ETH) | `0xA39Dfd80309e881cF1464dDb00cF0a17bF0322e3` |
| **USDT** (TRC20) | `THMe6FdXkA2Pw45yKaXBHRnkX3fjyKCzfy` |
| **Solana** (SOL) | `9QZHMTN4Pu6BCxiN2yABEcR3P4sXtBjkog9GXNxWbav1` |
| **TON** | `UQCp0OawnofpZTNZk-69wlqIx_wQpzKBgDpxY2JK5iynh3mC` |
