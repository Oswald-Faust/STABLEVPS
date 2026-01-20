// Hardcoded for test script
const user = 'the.area.epitech@gmail.com';
const pass = 'writer55FF55';
const ZOMRO_API_URL = 'https://api.zomro.com/';

async function run() {
  console.log('🔍 Listing Zomro Plans');
  
  // Authenticate
  const authInfo = `${user}:${pass}`;
  const authBody = new URLSearchParams();
  authBody.append('func', 'auth');
  authBody.append('authinfo', authInfo);
  authBody.append('out', 'json');
  
  const authRes = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: authBody.toString(),
  });
  
  const authData = await authRes.json();
  const token = authData?.doc?.auth?.['$id'];
  
  if (!token) return console.error('❌ Auth Failed');
  
  // Fetch INSTANCES Pricelist
  await listPlans(token, 'v2.instances.order.pricelist', 'INSTANCES');
  
  // Fetch VDS Pricelist
  await listPlans(token, 'v2.vds.order.pricelist', 'VDS');
  
  // Fetch DEDICATED Pricelist
  await listPlans(token, 'v2.dedicated.order.pricelist', 'DEDICATED');
}

async function listPlans(token: string, func: string, label: string) {
  console.log(`\n📦 Checking ${label} plans...`);
  const body = new URLSearchParams();
  body.append('func', func);
  body.append('auth', token);
  body.append('out', 'json');
  
  const res = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  
  const data = await res.json();
  const items = data.doc?.elem;
  
  if (!items) {
    console.log(`❌ No items found in ${label}`);
    // Log available categories if any
    return;
  }
  
  console.log(`✅ Found ${items.length} plans in ${label}:`);
  items.forEach((item: any) => {
    console.log(`   - [${item.id}] ${item.name} (${item.cost_month || item.cost_month_eur} EUR)`);
  });
}

run().catch(console.error);
