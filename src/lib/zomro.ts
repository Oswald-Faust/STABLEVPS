/**
 * Zomro API Client - BillManager Native API
 * 
 * Uses the native BillManager API at /billmgr endpoint
 * Key discovery: skipbasket=on forces immediate payment from account balance
 */

const ZOMRO_API_URL = 'https://api.zomro.com/billmgr';

// Flag to enable mock mode for development/testing when API is blocked
const USE_ZOMRO_MOCK = process.env.USE_ZOMRO_MOCK === 'true';

// Session token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Cloud Forex Plan IDs (discovered via pricelist.export)
export const ZOMRO_PLANS: Record<string, {
  pricelistId: number;
  name: string;
  cpu: number;
  ram: number;
  terminals: number;
  priceEUR: number;
}> = {
  basic: {
    pricelistId: 7991, // Cloud Forex 1 | NL-3
    name: 'Cloud Forex 1',
    cpu: 2,
    ram: 1,
    terminals: 2,
    priceEUR: 6.48,
  },
  prime: {
    pricelistId: 7962, // Cloud Forex 2 | NL-3
    name: 'Cloud Forex 2',
    cpu: 3,
    ram: 2,
    terminals: 3,
    priceEUR: 11.48,
  },
  pro: {
    pricelistId: 7998, // Cloud Forex 3 | NL-3
    name: 'Cloud Forex 3',
    cpu: 4,
    ram: 3,
    terminals: 4,
    priceEUR: 16.48,
  },
};

export const REGION_MAPPING: Record<string, string> = {
  london: 'nl',
  frankfurt: 'nl',
  amsterdam: 'nl',
  newyork: 'pl',
  singapore: 'de',
  poland: 'pl',
};

/**
 * Authenticate with Zomro BillManager API
 */
async function authenticate(): Promise<string> {
  const user = process.env.ZOMRO_USER;
  const pass = process.env.ZOMRO_PASSWORD;

  if (!user || !pass) {
    throw new Error('Missing ZOMRO_USER or ZOMRO_PASSWORD');
  }

  console.log('🔑 Authenticating with Zomro BillManager...');

  const body = new URLSearchParams();
  body.append('func', 'auth');
  body.append('authinfo', `${user}:${pass}`);
  body.append('out', 'json');

  const response = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  const token = data?.doc?.auth?.['$id'] || data?.doc?.auth?.['$'];

  if (!token) {
    console.error('❌ Auth failed:', JSON.stringify(data));
    throw new Error('Failed to get Zomro session token');
  }

  cachedToken = token;
  tokenExpiry = Date.now() + 45 * 60 * 1000;
  console.log('✅ Zomro authenticated');
  return token;
}

/**
 * Make authenticated BillManager API request
 */
async function zomroRequest(
  func: string,
  params: Record<string, string | number> = {},
  isRetry = false
): Promise<Record<string, unknown>> {
  if (!cachedToken || Date.now() > tokenExpiry) {
    await authenticate();
  }

  const formData = new URLSearchParams();
  formData.append('func', func);
  formData.append('auth', cachedToken!);
  formData.append('out', 'json');

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value));
  }

  console.log(`🌐 Zomro API: ${func}`, params);

  const response = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const data = await response.json();

  // Check for errors
  if (data.doc?.error) {
    const error = data.doc.error;
    
    // Retry on auth error
    if (error['$type'] === 'auth' && !isRetry) {
      console.warn('⚠️ Session expired, re-authenticating...');
      cachedToken = null;
      return zomroRequest(func, params, true);
    }

    console.error(`❌ API Error (${func}):`, error);
    throw new Error(`Zomro API: ${error.msg?.['$'] || JSON.stringify(error)}`);
  }

  return data;
}

/**
 * Generate secure password
 */
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = 'Aa1!'; // Ensure requirements
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Create Cloud Forex VPS - OFFICIAL ZOMRO METHOD
 * Uses 2-step process:
 * 1. v2.instances.order.param - Add to cart
 * 2. cartorder.create.confirm - Pay and activate
 * 
 * Key parameters:
 * - use_ssh_key: 'off' - Disable SSH key requirement for Windows
 * - force_use_new_cart: 'on' - Ensure clean cart
 * - paymethod_id: '0' - Pay from account balance
 */
export async function createForexVPS(
  planId: string,
  hostname: string,
  location = 'amsterdam'
): Promise<{ instanceId: string; status: string; password?: string }> {
  
  const planConfig = ZOMRO_PLANS[planId];
  if (!planConfig) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  const password = generateSecurePassword();
  const sanitizedHostname = hostname.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 50);

  console.log(`🚀 Creating VPS: ${planConfig.name} (pricelist ${planConfig.pricelistId})`);

  // MOCK MODE: Bypass API if enabled (useful for development)
  if (USE_ZOMRO_MOCK) {
    console.log('⚠️ ZOMRO MOCK MODE ENABLED: Simulating successful VPS creation');
    return {
      instanceId: `mock-zomro-${Date.now()}`,
      status: 'provisioning',
      password: password,
    };
  }

  // Get Windows OS template UUID
  const osTemplateId = await findWindowsOSTemplate();

  try {
    // ============================================
    // STEP 1: Add to cart via v2.instances.order.param
    // ============================================
    console.log('📦 Step 1: Adding VPS to cart...');
    
    const step1Res = await zomroRequest('v2.instances.order.param', {
      order_period: 1,
      licence_agreement: 'on',
      use_ssh_key: 'off',              // 🔑 Critical: Disable SSH key for Windows
      pricelist: planConfig.pricelistId,
      servername: sanitizedHostname,
      password: password,
      instances_os: osTemplateId,
      order_count: 1,
      force_use_new_cart: 'on',
      sok: 'ok',
    });

    const doc1 = step1Res.doc as Record<string, unknown>;
    
    // Extract lineitem.id from response
    let lineitemId = '';
    if (doc1['lineitem.id'] && typeof doc1['lineitem.id'] === 'object') {
      lineitemId = String((doc1['lineitem.id'] as Record<string, string>)['$'] || '');
    } else if (doc1.elid) {
      lineitemId = String(typeof doc1.elid === 'object' ? (doc1.elid as Record<string, string>)['$'] : doc1.elid);
    }

    if (!lineitemId) {
      console.error('Step 1 response:', JSON.stringify(doc1).substring(0, 500));
      throw new Error('Failed to get lineitem.id from cart order');
    }

    console.log(`✅ Step 1 Success! Lineitem ID: ${lineitemId}`);

    // ============================================
    // STEP 2: Confirm and pay via cartorder.create.confirm
    // ============================================
    console.log('💳 Step 2: Confirming and paying...');
    
    const step2Res = await zomroRequest('cartorder.create.confirm', {
      elid: lineitemId,
      paymethod_id: 0,  // Pay from account balance
      sok: 'ok',
    });

    const doc2 = step2Res.doc as Record<string, unknown>;
    
    // Check for errors
    if (doc2.error) {
      throw new Error(`Payment failed: ${JSON.stringify(doc2.error)}`);
    }

    console.log('✅ Step 2 Success! Service is being activated.');

    // ============================================
    // STEP 3: Find the new service ID
    // ============================================
    console.log('🔍 Step 3: Finding new service ID...');
    
    // Poll for the new service to appear (it takes a few seconds)
    let serviceId = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(r => setTimeout(r, 3000)); // Wait 3 seconds
      
      const services = await listVPSInstances();
      // Sort by ID descending to get newest first
      const sorted = services.sort((a, b) => parseInt(String(b.id)) - parseInt(String(a.id)));
      
      if (sorted.length > 0) {
        // The newest service should be ours
        const newest = sorted[0];
        const newestId = String(newest.id);
        
        // Verify it's a new service (ID should be much higher than lineitem ID usually)
        // lineitem IDs are typically 4-digit, service IDs are 7-digit
        if (newestId.length >= 6 || parseInt(newestId) > 100000) {
          serviceId = newestId;
          console.log(`🎉 VPS Created! Service ID: ${serviceId}`);
          break;
        }
      }
      
      console.log(`   Attempt ${attempt + 1}/10: Service not ready yet...`);
    }
    
    if (serviceId) {
      return {
        instanceId: serviceId,
        status: 'provisioning',
        password: password,
      };
    }

    // Fallback: return lineitem ID if service not found yet
    console.log('⚠️ Service not found in list yet, using lineitem ID as fallback');
    console.log('   The actual service ID will be available once activation completes.');
    return {
      instanceId: lineitemId,
      status: 'provisioning',
      password: password,
    };

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to create Zomro VPS:', errorMsg);
    throw error;
  }
}

/**
 * Find Windows OS Template UUID for Cloud Forex plans
 * Returns the UUID format used by v2.instances API
 */
async function findWindowsOSTemplate(): Promise<string> {
  // Default Windows Server 2022 optimized UUID for Cloud Forex
  // This was discovered via the v2.instances.order.param slist
  const DEFAULT_WINDOWS_UUID = 'cc388142-2bd6-47ba-8989-1141063f3245';
  
  try {
    // Try to get the list of available OS templates
    const res = await zomroRequest('v2.instances.order.param', {
      pricelist: ZOMRO_PLANS.basic.pricelistId,
      period: 1,
    });
    
    const doc = res.doc as Record<string, unknown>;
    const slist = doc.slist as Array<Record<string, unknown>> | undefined;
    
    if (slist) {
      const osList = slist.find(s => s.$name === 'instances_os');
      if (osList && osList.val) {
        const vals = Array.isArray(osList.val) ? osList.val : [osList.val];
        const windows = vals.find((v: Record<string, string>) => 
          v.$ && v.$.toLowerCase().includes('windows')
        );
        if (windows && (windows as Record<string, string>).$key) {
          console.log(`✅ Found Windows OS: ${(windows as Record<string, string>).$key}`);
          return (windows as Record<string, string>).$key;
        }
      }
    }
  } catch (e) {
    console.log('⚠️ Could not fetch OS templates, using default');
  }
  
  console.log(`ℹ️ Using default Windows OS: ${DEFAULT_WINDOWS_UUID}`);
  return DEFAULT_WINDOWS_UUID;
}

/**
 * Get VPS details using instances.edit API
 * This is the correct V2 function for Cloud VPS
 */
export async function getVPSDetails(instanceId: string): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
} | null> {
  // Handle mock/legacy IDs
  if (instanceId.startsWith('mock-') || instanceId.includes('mock')) {
    return {
      instanceId,
      status: 'active',
      ipv4: '0.0.0.0',
      hostname: 'Mock VPS',
      username: 'Administrator',
    };
  }

  try {
    // Use instances.edit for Cloud VPS details
    const res = await zomroRequest('instances.edit', { elid: instanceId });
    const doc = res.doc as Record<string, unknown>;
    
    // BillManager returns values as { $: "value" } objects
    const getValue = (field: unknown): string => {
      if (!field) return '';
      if (typeof field === 'object' && field !== null && '$' in field) {
        return String((field as Record<string, string>)['$']);
      }
      return String(field);
    };
    
    const status = getValue(doc.status);
    const ip = getValue(doc.ip);
    const name = getValue(doc.name) || getValue(doc.servername);
    const password = getValue(doc.password);
    
    return {
      instanceId: getValue(doc.id) || instanceId,
      status: status === '2' ? 'active' : 'provisioning',
      ipv4: ip,
      hostname: name,
      username: 'Administrator',
      password: password || undefined,
    };
  } catch (error) {
    console.error(`Failed to get VPS ${instanceId}:`, error);
    return null;
  }
}

/**
 * List all Cloud VPS instances
 * Uses 'instances' function for V2 Cloud VPS
 */
export async function listVPSInstances(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await zomroRequest('instances');
    const doc = res.doc as Record<string, unknown>;
    const elems = doc.elem as Array<Record<string, unknown>> | undefined;
    
    if (!elems) return [];
    
    // Normalize the response - extract $ values
    return (Array.isArray(elems) ? elems : [elems]).map(elem => {
      const getValue = (field: unknown): string => {
        if (!field) return '';
        if (typeof field === 'object' && field !== null && '$' in field) {
          return String((field as Record<string, string>)['$']);
        }
        return String(field);
      };
      
      return {
        id: getValue(elem.id),
        name: getValue(elem.name),
        status: getValue(elem.status),
        ip: getValue(elem.ip),
        cost: getValue(elem.cost),
        expiredate: getValue(elem.expiredate),
      };
    });
  } catch (error) {
    console.error('Failed to list instances:', error);
    return [];
  }
}

/**
 * Control VPS: reboot, stop, start, delete
 * Uses 'instances.*' functions for Cloud VPS
 */
export async function rebootVPS(instanceId: string): Promise<boolean> {
  try {
    await zomroRequest('instances.reboot', { elid: instanceId, sok: 'ok' });
    return true;
  } catch { return false; }
}

export async function stopVPS(instanceId: string): Promise<boolean> {
  try {
    await zomroRequest('instances.stop', { elid: instanceId, sok: 'ok' });
    return true;
  } catch { return false; }
}

export async function startVPS(instanceId: string): Promise<boolean> {
  try {
    await zomroRequest('instances.start', { elid: instanceId, sok: 'ok' });
    return true;
  } catch { return false; }
}

export async function deleteVPS(instanceId: string): Promise<boolean> {
  try {
    await zomroRequest('instances.delete', { elid: instanceId, sok: 'ok' });
    return true;
  } catch { return false; }
}

/**
 * Poll until VPS is active
 */
export async function pollUntilActive(
  instanceId: string,
  maxAttempts = 60,
  intervalMs = 15000
): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
} | null> {
  console.log(`⏳ Polling VPS ${instanceId}...`);

  for (let i = 0; i < maxAttempts; i++) {
    const details = await getVPSDetails(instanceId);
    
    if (details?.status === 'active' && details?.ipv4) {
      console.log(`✅ VPS ${instanceId} is active!`);
      return details;
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  console.warn(`⏰ Polling timeout for ${instanceId}`);
  return null;
}

// Exports for compatibility
export const createVPS = createForexVPS;
export const getVPS = getVPSDetails;
