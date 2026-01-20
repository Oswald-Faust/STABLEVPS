/**
 * Zomro API Client
 * 
 * Zomro provides Cloud Forex VPS with Windows + MetaTrader pre-installed.
 * This is the KEY advantage over Aeza - clients get a ready-to-trade VPS.
 * 
 * Required environment variables:
 * - ZOMRO_USER (Your Zomro email/username)
 * - ZOMRO_PASSWORD (Your Zomro password)
 * 
 * Zomro uses session-based authentication. This client automatically
 * handles login and session token management.
 * 
 * @see https://zomro.com/docs/api/ for API documentation
 */

const ZOMRO_API_URL = 'https://api.zomro.com/';

// Cache for the session token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Plan Mapping: Our plan IDs to Zomro Cloud Forex pricelist IDs
 * ... existing mapping ...
 */
export const PLAN_MAPPING: Record<string, {
  pricelistId: number;
  name: string;
  cpu: number;
  ram: number;
  terminals: number;
  priceEUR: number;
}> = {
  // Basic: Cloud Forex 1 - 2 vCPU, 1GB RAM, 2 terminals
  basic: {
    pricelistId: 0, // Will be discovered from API
    name: 'Cloud Forex 1',
    cpu: 2,
    ram: 1,
    terminals: 2,
    priceEUR: 6.48,
  },

  // Prime: Cloud Forex 2 - 3 vCPU, 2GB RAM, 3 terminals
  prime: {
    pricelistId: 0, // Will be discovered from API
    name: 'Cloud Forex 2',
    cpu: 3,
    ram: 2,
    terminals: 3,
    priceEUR: 11.48,
  },

  // Pro: Cloud Forex 3 - 4 vCPU, 3GB RAM, 4 terminals
  pro: {
    pricelistId: 0, // Will be discovered from API
    name: 'Cloud Forex 3',
    cpu: 4,
    ram: 3,
    terminals: 4,
    priceEUR: 16.48,
  },
};

/**
 * Region mapping: Our location IDs to Zomro datacenter IDs
 */
export const REGION_MAPPING: Record<string, string> = {
  london: 'nl',
  frankfurt: 'nl',
  amsterdam: 'nl',
  newyork: 'us',
  singapore: 'sg',
  poland: 'pl',
};

// Cache for discovered pricelist IDs
let pricelistCache: Array<{
  id: number;
  name: string;
  price: number;
}> | null = null;

/**
 * Authenticate with Zomro to get a session token
 * Using the method provided by Zomro support:
 * func=auth, authinfo=user:pass
 */
async function authenticate(): Promise<string> {
  const user = process.env.ZOMRO_USER;
  const pass = process.env.ZOMRO_PASSWORD;

  if (!user || !pass) {
    throw new Error('Missing ZOMRO_USER or ZOMRO_PASSWORD environment variables.');
  }

  console.log('🔑 Authenticating with Zomro API...');
  console.log('📧 User:', user);
  console.log('🔐 Pass:', pass);

  // Build form data manually to match curl format exactly
  // The authinfo value needs to be URL-encoded as a whole
  const authinfo = `${user}:${pass}`;
  
  const body = new URLSearchParams();
  body.append('func', 'auth');
  body.append('authinfo', authinfo);
  body.append('out', 'json');

  console.log('📦 Body:', body.toString());

  const response = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await response.text();
  console.log('📥 Auth response:', text.substring(0, 200));
  
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('❌ Non-JSON response:', text);
    throw new Error('Zomro returned non-JSON response');
  }

  // Extract token from doc.auth.$id or doc.auth.$
  const token = data?.doc?.auth?.['$id'] || data?.doc?.auth?.['$'];

  if (!token) {
    console.error('❌ Zomro authentication failed:', JSON.stringify(data, null, 2));
    throw new Error('Failed to get Zomro session token');
  }

  cachedToken = token;
  // Tokens usually valid for 1 hour, let's refresh every 45 mins
  tokenExpiry = Date.now() + 45 * 60 * 1000;
  
  console.log('✅ Zomro session token acquired');
  return token;
}

/**
 * Make an authenticated request to Zomro API
 */
async function zomroRequest(
  func: string,
  params: Record<string, string | number> = {},
  isRetry: boolean = false
): Promise<Record<string, unknown>> {
  
  // Get token if not cached or expired
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

  console.log(`🌐 Zomro API: ${func}`);

  const response = await fetch(ZOMRO_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const text = await response.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Zomro API error: Non-JSON response - ${text.substring(0, 100)}`);
  }

  // Handle errors
  if (data.doc && (data.doc as Record<string, unknown>).error) {
    const error = (data.doc as Record<string, unknown>).error as { code?: string; msg?: string };
    
    // If session expired, retry once
    if (error.code === 'auth' && !isRetry) {
      console.warn('⚠️ Zomro session expired, re-authenticating...');
      cachedToken = null;
      return zomroRequest(func, params, true);
    }

    console.error(`❌ Zomro API error (${func}):`, error);
    throw new Error(`Zomro API error: ${error.msg || JSON.stringify(error)}`);
  }

  return data;
}

/**
 * Get available Cloud Forex plans from Zomro
 * This fetches the pricelist and caches it
 */
export async function fetchPricelist(): Promise<Array<{
  id: number;
  name: string;
  price: number;
}>> {
  if (pricelistCache) {
    return pricelistCache;
  }

  try {
    const response = await zomroRequest('v2.instances.order.pricelist');

    // Parse the response - Zomro returns data in 'doc' element
    const doc = response.doc as Record<string, unknown>;
    const items = (doc.elem as Array<Record<string, unknown>>) || [];

    pricelistCache = items.map(item => ({
      id: parseInt(String(item.id), 10),
      name: String(item.name || ''),
      price: parseFloat(String(item.cost || '0')),
    }));

    console.log(`📦 Found ${pricelistCache.length} Zomro plans`);

    // Match our plans to Zomro plans
    for (const plan of pricelistCache) {
      const planNameLower = plan.name.toLowerCase();

      if (planNameLower.includes('forex') || planNameLower.includes('cloud forex')) {
        // Match by name pattern
        if (planNameLower.includes('1') || planNameLower.includes('basic')) {
          PLAN_MAPPING.basic.pricelistId = plan.id;
          console.log(`  ✅ Basic plan matched: ${plan.name} (ID: ${plan.id})`);
        } else if (planNameLower.includes('2') || planNameLower.includes('standard')) {
          PLAN_MAPPING.prime.pricelistId = plan.id;
          console.log(`  ✅ Prime plan matched: ${plan.name} (ID: ${plan.id})`);
        } else if (planNameLower.includes('3') || planNameLower.includes('premium')) {
          PLAN_MAPPING.pro.pricelistId = plan.id;
          console.log(`  ✅ Pro plan matched: ${plan.name} (ID: ${plan.id})`);
        }
      }
    }

    return pricelistCache;
  } catch (error) {
    console.error('❌ Failed to fetch Zomro pricelist:', error);
    throw error;
  }
}

/**
 * Get plan parameters (OS options, datacenter options, etc.)
 * @internal Used for debugging/advanced configuration
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPlanParameters(pricelistId: number, period: number = 1): Promise<Record<string, unknown>> {
  try {
    const response = await zomroRequest('v2.instances.order.param', {
      pricelist: pricelistId,
      period: period,
    });

    return response.doc as Record<string, unknown>;
  } catch (error) {
    console.error('❌ Failed to get plan parameters:', error);
    throw error;
  }
}

/**
 * Generate a secure password that meets Zomro requirements
 * Must contain: 1 uppercase, 1 lowercase, 1 number, min 8 chars
 */
function generateSecurePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%';

  // Ensure one of each required type
  let password = '';
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest (12 more chars for 16 total)
  const all = upper + lower + numbers;
  for (let i = 0; i < 12; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Create a Cloud Forex VPS with Windows + MetaTrader pre-installed
 * 
 * Zomro uses a cart-based system:
 * 1. Add to cart
 * 2. Confirm order
 * 
 * @param planId - Our internal plan ID (basic, prime, pro)
 * @param hostname - Server hostname/label
 * @param location - Location ID (default: amsterdam/nl)
 * @returns Object with instance ID and initial status
 */
export async function createForexVPS(
  planId: string,
  hostname: string,
  location: string = 'amsterdam'
): Promise<{
  instanceId: string;
  status: string;
  orderId?: string;
  password?: string;
}> {
  try {
    // Make sure we have the pricelist IDs
    await fetchPricelist();

    const planConfig = PLAN_MAPPING[planId];
    if (!planConfig) {
      throw new Error(`No Zomro plan found for ${planId}`);
    }

    if (planConfig.pricelistId === 0) {
      throw new Error(`Zomro plan ${planId} not found in pricelist. Run fetchPricelist() first.`);
    }

    const datacenter = REGION_MAPPING[location] || 'nl';
    const password = generateSecurePassword();

    // Sanitize hostname
    const sanitizedHostname = hostname
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .substring(0, 50);

    console.log('🚀 Creating Zomro Cloud Forex VPS:', {
      plan: planConfig.name,
      hostname: sanitizedHostname,
      datacenter,
    });

    // Step 1: Add service to cart
    const addToCartResponse = await zomroRequest('v2.instances.order', {
      pricelist: planConfig.pricelistId,
      period: 1, // Monthly
      server_name: sanitizedHostname,
      server_password: password,
      datacenter: datacenter,
      // Cloud Forex includes Windows + MT5 by default
      sok: 'ok',
    });

    console.log('📝 Added to cart:', addToCartResponse);

    // Extract cart item ID (elid)
    const doc = addToCartResponse.doc as Record<string, unknown>;
    const cartItemId = doc.id || doc.elid;

    if (!cartItemId) {
      // Sometimes Zomro creates the order directly
      // Check if we got a service ID back
      if (doc.id) {
        return {
          instanceId: String(doc.id),
          status: 'provisioning',
          password: password,
        };
      }
      throw new Error('No cart item ID returned from Zomro');
    }

    // Step 2: Confirm and pay from account balance
    const confirmResponse = await zomroRequest('cartorder.create.confirm', {
      elid: String(cartItemId),
      paymethod_id: 0, // Pay from account balance
      sok: 'ok',
    });

    console.log('✅ Order confirmed:', confirmResponse);

    // Extract the service ID
    const confirmDoc = confirmResponse.doc as Record<string, unknown>;
    const serviceId = confirmDoc.id || confirmDoc.service_id || confirmDoc.elid;

    if (!serviceId) {
      // Try to get from nested structure
      const elements = confirmDoc.elem as Array<Record<string, unknown>> | undefined;
      if (elements && elements.length > 0) {
        return {
          instanceId: String(elements[0].id || cartItemId),
          status: 'provisioning',
          orderId: String(cartItemId),
          password: password,
        };
      }
    }

    return {
      instanceId: String(serviceId || cartItemId),
      status: 'provisioning',
      orderId: String(cartItemId),
      password: password,
    };

  } catch (error) {
    console.error('❌ Failed to create Zomro VPS:', error);
    throw error;
  }
}

/**
 * Get VPS instance details including IP and credentials
 * 
 * @param instanceId - The Zomro service ID
 */
export async function getVPSDetails(instanceId: string): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
} | null> {
  // Skip mock IDs
  if (instanceId.startsWith('mock-') || instanceId.startsWith('pending-')) {
    console.log(`🧪 [MOCK/PENDING] Skipping: ${instanceId}`);
    const createdTime = parseInt(instanceId.split('-').pop() || '0');
    const elapsed = Date.now() - createdTime;
    const isReady = elapsed > 60000;

    return {
      instanceId,
      status: isReady ? 'active' : 'provisioning',
      ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
      hostname: 'Zomro Cloud Forex VPS',
      username: 'Administrator',
      password: isReady ? 'TempPassword123!' : undefined,
    };
  }

  // Skip legacy IDs from other providers
  const isCloudzyUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(instanceId);
  if (isCloudzyUUID) {
    console.log(`⚠️ [LEGACY] Skipping Cloudzy UUID: ${instanceId}`);
    return {
      instanceId,
      status: 'legacy',
      ipv4: '',
      hostname: 'Legacy Cloudzy VPS',
      username: 'Administrator',
      password: undefined,
    };
  }

  try {
    // Get service details
    const response = await zomroRequest('v2.instances', {
      elid: instanceId,
    });

    const doc = response.doc as Record<string, unknown>;
    const elements = doc.elem as Array<Record<string, unknown>> | undefined;

    if (!elements || elements.length === 0) {
      console.warn(`⚠️ No service data found for ${instanceId}`);
      return null;
    }

    const service = elements[0];

    // Map Zomro status to our standard statuses
    const zomroStatus = String(service.status || '').toLowerCase();
    let status = 'unknown';
    if (zomroStatus === 'active' || zomroStatus === 'ok') {
      status = 'active';
    } else if (zomroStatus === 'suspended' || zomroStatus === 'stopped') {
      status = 'suspended';
    } else if (zomroStatus === 'pending' || zomroStatus === 'creating') {
      status = 'provisioning';
    }

    return {
      instanceId: String(service.id || instanceId),
      status: status,
      ipv4: String(service.ip || service.ipv4 || ''),
      hostname: String(service.name || service.server_name || ''),
      username: String(service.username || 'Administrator'),
      password: service.password ? String(service.password) : undefined,
    };

  } catch (error) {
    console.error(`❌ Failed to get VPS details for ${instanceId}:`, error);
    return null;
  }
}

/**
 * List all VPS instances
 */
export async function listVPSInstances(): Promise<Array<Record<string, unknown>>> {
  try {
    const response = await zomroRequest('v2.instances');
    const doc = response.doc as Record<string, unknown>;
    return (doc.elem as Array<Record<string, unknown>>) || [];
  } catch (error) {
    console.error('❌ Failed to list VPS instances:', error);
    return [];
  }
}

/**
 * Control VPS: start, stop, reboot
 */
async function controlVPS(instanceId: string, action: 'start' | 'stop' | 'reboot'): Promise<boolean> {
  try {
    await zomroRequest(`v2.instances.${action}`, {
      elid: instanceId,
      sok: 'ok',
    });
    console.log(`🔄 VPS ${instanceId} ${action} initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to ${action} VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Reboot a VPS
 */
export async function rebootVPS(instanceId: string): Promise<boolean> {
  return controlVPS(instanceId, 'reboot');
}

/**
 * Stop a VPS
 */
export async function stopVPS(instanceId: string): Promise<boolean> {
  return controlVPS(instanceId, 'stop');
}

/**
 * Start a VPS
 */
export async function startVPS(instanceId: string): Promise<boolean> {
  return controlVPS(instanceId, 'start');
}

/**
 * Delete/Cancel a VPS
 */
export async function deleteVPS(instanceId: string): Promise<boolean> {
  try {
    await zomroRequest('v2.instances.delete', {
      elid: instanceId,
      sok: 'ok',
    });
    console.log(`🗑️ VPS ${instanceId} deletion initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Rebuild/Reinstall VPS with new OS
 */
export async function reinstallVPS(
  instanceId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _osId?: number
): Promise<boolean> {
  try {
    await zomroRequest('v2.instances.rebuild', {
      elid: instanceId,
      // For Cloud Forex, Windows + MT5 is default
      sok: 'ok',
    });
    console.log(`🔄 VPS ${instanceId} reinstall initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to reinstall VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Poll VPS status until active or timeout
 * 
 * @param instanceId - Instance ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 60 = ~15 minutes with 15s interval)
 * @param intervalMs - Interval between polls in ms (default: 15000 = 15 seconds)
 */
export async function pollUntilActive(
  instanceId: string,
  maxAttempts: number = 60,
  intervalMs: number = 15000
): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
} | null> {
  console.log(`⏳ Starting polling for ${instanceId} (max ${maxAttempts} attempts, ${intervalMs}ms interval)`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const details = await getVPSDetails(instanceId);

    if (!details) {
      console.log(`  Attempt ${attempt}: Instance not found, waiting...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      continue;
    }

    console.log(`  Attempt ${attempt}: Status = ${details.status}`);

    if (details.status === 'active' && details.ipv4) {
      console.log(`✅ VPS ${instanceId} is now active!`);
      return details;
    }

    if (details.status === 'error' || details.status === 'failed') {
      console.error(`❌ VPS ${instanceId} failed to provision`);
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  console.warn(`⚠️ Polling timeout for ${instanceId}`);
  return null;
}

// ============================================
// MOCK MODE FOR DEVELOPMENT/TESTING
// ============================================

const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.ZOMRO_PASSWORD;

/**
 * Mock version of createForexVPS for testing
 */
export async function createForexVPSMock(
  planId: string,
  hostname: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _location: string = 'amsterdam'
): Promise<{ instanceId: string; status: string; password?: string }> {
  console.log(`🧪 [MOCK] Creating Zomro Cloud Forex VPS: ${planId} - ${hostname}`);

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    instanceId: `mock-zomro-${Date.now()}`,
    status: 'provisioning',
    password: 'MockZomroPass123!',
  };
}

/**
 * Mock version of getVPSDetails for testing
 */
export async function getVPSDetailsMock(instanceId: string): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
} | null> {
  console.log(`🧪 [MOCK] Getting Zomro VPS details: ${instanceId}`);

  const createdTime = parseInt(instanceId.split('-').pop() || '0');
  const elapsed = Date.now() - createdTime;
  const isReady = elapsed > 30000;

  return {
    instanceId,
    status: isReady ? 'active' : 'provisioning',
    ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
    hostname: `Zomro Cloud Forex ${instanceId}`,
    username: 'Administrator',
    password: isReady ? 'ZomroSecure123!' : undefined,
  };
}

// Export the appropriate functions based on environment
export const createVPS = USE_MOCK ? createForexVPSMock : createForexVPS;
export const getVPS = USE_MOCK ? getVPSDetailsMock : getVPSDetails;
