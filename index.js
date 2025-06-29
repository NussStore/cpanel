const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// ✅ API Key hardcoded
global.apikey = ['nussjb'];

app.get('/createpanel', async (req, res) => {
  const { apikey, domain, ptla, ptlc, egg, user, ram, cpu, disk } = req.query;

  if (!global.apikey.includes(apikey)) {
    return res.status(401).json({ status: false, error: 'Apikey invalid' });
  }

  if (!domain || !ptla || !ptlc || !egg || !user || !ram || !cpu || !disk) {
    return res.status(400).json({ status: false, error: 'Missing parameters' });
  }

  try {
    const username = user;
    const email = `${user}@Nuss.Store`;
    const charset = "abcdefghijklmnopqrstuvwxyz1234567890@#$&";
    const password = Array.from(crypto.randomFillSync(new Uint32Array(5)))
      .map(x => charset[x % charset.length])
      .join('');

    // Buat user
    const userRes = await axios.post(`${domain}/api/application/users`, {
      username,
      email,
      first_name: "Nuss",
      last_name: "Store",
      password
    }, {
      headers: {
        'Authorization': `Bearer ${ptla}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    const userId = userRes.data.attributes.id;

    // Buat server
    await axios.post(`${domain}/api/application/servers`, {
      name: `${username}-server`,
      user: userId,
      egg: parseInt(egg),
      docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
      startup: `if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z \${NODE_PACKAGES} ]]; then /usr/local/bin/npm install \${NODE_PACKAGES}; fi; if [[ ! -z \${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall \${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/\${CMD_RUN}`,
      limits: {
        memory: parseInt(ram),
        swap: 0,
        disk: parseInt(disk),
        io: 500,
        cpu: parseInt(cpu)
      },
      feature_limits: {
        databases: 1,
        backups: 1,
        allocations: 1
      },
      allocation: {
        default: parseInt(ptlc)
      },
      environment: {
        AUTO_UPDATE: "1",
        CMD_RUN: "npm start",
        NODE_PACKAGES: "",
        UNNODE_PACKAGES: ""
      }
    }, {
      headers: {
        'Authorization': `Bearer ${ptla}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    return res.json({
      status: true,
      creator: 'NUSS-STORE',
      result: {
        email,
        username,
        password
      }
    });

  } catch (error) {
    const message = error.response?.data || error.message || 'Unknown error';
    return res.status(500).json({ status: false, error: message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
