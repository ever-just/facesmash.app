const https = require('https');

const projects = [
  'jtgtuptiqnbonigozntq', // PROJECT JEANIE
  'hhkuholostmqgildiwgh', // CompanyDirectory
  'moltnwxcbdrnazdvbsnf', // PROJECT JANICE
  'revsnlnrjnuhebrvytbb', // weldon.vip
  'cnydzgajkvcuyyafjwfe', // executiveaction
  'hfkeqfhzfjtopqfwpnoy', // PROJECT CUSTOM PORTAL
  'eselrdgmtpvsivfluehq', // PROJECT ALEXA
  'zbhjxzgabrzdwnhfjvnq', // vapi-voice
  'bbamswctdmfsgnphnmvg', // Life ledger
  'gaywxijzwtswizhhnrfy', // PROJECT CHATR
];

async function checkProject(ref) {
  return new Promise((resolve) => {
    const req = https.get(`https://${ref}.supabase.co/rest/v1/`, {
      headers: { 'apikey': 'test' },
      timeout: 5000
    }, (res) => {
      resolve({ ref, status: res.statusCode, alive: true });
    });
    req.on('error', (e) => resolve({ ref, alive: false, error: e.code }));
    req.on('timeout', () => { req.destroy(); resolve({ ref, alive: false, error: 'TIMEOUT' }); });
  });
}

async function main() {
  console.log('Checking which Supabase projects are alive...\n');
  const results = await Promise.all(projects.map(checkProject));
  for (const r of results) {
    console.log(`${r.alive ? '✅' : '❌'} ${r.ref} — ${r.alive ? 'status ' + r.status : r.error}`);
  }
}

main();
