
const https = require('https');
const { URLSearchParams } = require('url');

const ZOMRO_USER = process.env.ZOMRO_USER || 'contact.stablevps@gmail.com';
const ZOMRO_PASSWORD = process.env.ZOMRO_PASSWORD || 'StableVpsDM66!';
const ZOMRO_API_URL = 'https://api.zomro.com/billmgr';

async function checkPermissions() {
  console.log('🔍 Starting Zomro API Permission Diagnosis...');
  console.log(`👤 User: ${ZOMRO_USER}`);

  // 1. Auth via native BillManager
  let token = '';
  try {
    const params = new URLSearchParams();
    params.append('func', 'auth');
    params.append('authinfo', `${ZOMRO_USER}:${ZOMRO_PASSWORD}`);
    params.append('out', 'json');
    
    const res = await fetch(ZOMRO_API_URL, { method: 'POST', body: params });
    const data = await res.json();
    
    if (data.doc?.auth?.['$id']) {
      token = data.doc.auth['$id'];
      console.log('✅ Authentication: SUCCESS');
    } else {
      console.error('❌ Authentication: FAILED', data);
      return;
    }
  } catch (e) {
    console.error('❌ Authentication: NETWORK ERROR', e);
    return;
  }

  // Helper
  const checkFunc = async (name, params = {}) => {
    const p = new URLSearchParams();
    p.append('func', name);
    p.append('auth', token);
    p.append('out', 'json');
    for (const [k, v] of Object.entries(params)) p.append(k, String(v));

    try {
      const res = await fetch(ZOMRO_API_URL, { method: 'POST', body: p });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { return { status: 'NON-JSON', raw: text.substring(0, 100) }; }

      if (json.doc?.error) {
         return { status: 'ERROR', error: json.doc.error.msg?.['$'] || json.doc.error };
      }
      return { status: 'OK', keys: Object.keys(json.doc || {}) };
    } catch (e) {
      return { status: 'EXCEPTION', error: e.message };
    }
  };

  // 2. Check Key Functions
  const checks = [
    { name: 'whoami', params: {} },
    { name: 'session', params: {} },
    { name: 'paymethod', params: {} },
    { name: 'client.profile', params: {} }, // Profile details
    { name: 'pricelist.export', params: { elid: '' } }, // View plans
    { name: 'vds.order', params: { pricelist: '7991' } }, // Order form
    { name: 'vds.order.param', params: { pricelist: '7991' } }, // Order submit
    { name: 'cartorder.create', params: { pricelist: '7991' } }, // Cart flow
    { name: 'basket', params: {} }, // View basket
    { name: 'payment', params: {} }, // View payments
  ];

  console.log('\n📋 Function Permission Check:');
  for (const check of checks) {
    const result = await checkFunc(check.name, check.params);
    let icon = '✅';
    if (result.status === 'ERROR') icon = '❌';
    if (result.status === 'NON-JSON') icon = '⚠️';
    if (result.status === 'OK' && result.keys.includes('keys') && result.keys.length === 1) icon = '❓'; // possibly empty
    
    console.log(`${icon} ${check.name.padEnd(20)}: ${result.status} ${result.error ? `(${typeof result.error === 'object' ? JSON.stringify(result.error) : result.error})` : ''}`);
  }

  console.log('\n💡 Diagnosis:');
  console.log('If you see "Insufficient privileges" or "Function not found" for key ordering functions (vds.order, paymethod),');
  console.log('it indicates your Zomro account API access is restricted. You must contact support to enable API ordering.');
}

checkPermissions();
