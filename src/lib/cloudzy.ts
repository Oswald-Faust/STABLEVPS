/**
 * Cloudzy API Client
 * 
 * Cloudzy provides Forex VPS with Windows Server + MetaTrader pre-installed.
 * This client handles VPS provisioning and status polling.
 * 
 * Required environment variable:
 * - CLOUDZY_API_TOKEN
 * 
 * @see https://api.cloudzy.com/developers/redoc for API documentation
 */

const CLOUDZY_API_URL = 'https://api.cloudzy.com/developers/v1';

/**
 * Plan Mapping: Our plan IDs to Cloudzy product IDs
 * 
 * Windows-capable products in UK-London region (verified from API):
 * - Basic: 2 vCPU, 4GB RAM, 120GB - $28.95/month
 * - Prime: 4 vCPU, 8GB RAM, 240GB - $52.95/month  
 * - Pro: 4 vCPU, 12GB RAM, 300GB - $69.95/month
 * 
 * Note: These are the PRODUCT IDs (not plan IDs)
 */
export const PLAN_MAPPING: Record<string, string> = {
  // Basic: 2 vCPU, 4GB RAM, 120GB SSD - $28.95/month
  basic: 'bc1f70fe-558d-472d-b981-8cc29e995de1',
  
  // Prime: 4 vCPU, 8GB RAM, 240GB SSD - $52.95/month
  prime: 'fe8bbbbe-3bd8-4fcb-9fb9-19f5ab96a6a8',
  
  // Pro: 4 vCPU, 12GB RAM, 300GB SSD - $69.95/month
  pro: '1f1cd048-6714-4aa2-82ac-a575fa24fec0',
};

/**
 * Region mapping: Our location IDs to Cloudzy region IDs
 */
export const REGION_MAPPING: Record<string, string> = {
  london: 'UK-London',
  frankfurt: 'DE-Frankfurt',
  newyork: 'US-NewYork',
  singapore: 'SG-Singapore',
};

// Windows Server 2022 OS ID
const WINDOWS_OS_ID = '5804e78eb6225097297da141deb78b3910fc1e3556c8fc3f85d634907bf7416d';

// Forex VPS / MetaTrader 5 Application ID
const MT5_APP_ID = 'cbfe4063d84e0e56f21d938e9605e095cba44b98d44f7e24998ffd9af777c155';

/**
 * Make an authenticated request to Cloudzy API
 */
async function cloudzyRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: object
): Promise<Record<string, unknown>> {
  const token = process.env.CLOUDZY_API_TOKEN;
  
  if (!token) {
    throw new Error('Missing CLOUDZY_API_TOKEN environment variable');
  }

  const url = `${CLOUDZY_API_URL}${endpoint}`;
  console.log(`🌐 Cloudzy API ${method} ${endpoint}`);

  const response = await fetch(url, {
    method,
    headers: {
      'API-Token': token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  
  // Try to parse as JSON
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('❌ Cloudzy API returned non-JSON response:', text.substring(0, 200));
    throw new Error(`Cloudzy API error: Non-JSON response - ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    console.error(`❌ Cloudzy API error (${endpoint}):`, data);
    throw new Error(`Cloudzy API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Create a Forex VPS with Windows Server 2022 + MetaTrader 5
 * 
 * @param planId - Our internal plan ID (basic, prime, pro)
 * @param hostname - Server hostname/label
 * @param location - Location ID (default: london)
 * @returns Object with instance ID and initial status
 */
export async function createForexVPS(
  planId: string,
  hostname: string,
  location: string = 'london'
): Promise<{ 
  instanceId: string; 
  status: string;
  orderId?: string;
}> {
  try {
    const productId = PLAN_MAPPING[planId];
    if (!productId) {
      throw new Error(`No Cloudzy plan found for ${planId}`);
    }

    const region = REGION_MAPPING[location] || 'UK-London';
    
    // Sanitize hostname (alphanumeric and hyphens only)
    const sanitizedHostname = hostname
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .substring(0, 50);

    const payload = {
      hostnames: [sanitizedHostname],
      region: region,
      productId: productId,
      osId: WINDOWS_OS_ID,
      appId: MT5_APP_ID,
      billingCycle: 'monthly',
      // IP address configuration - IPv4 is required for RDP access
      // API uses assignIpv4/assignIpv6 (booleans)
      assignIpv4: true,
      assignIpv6: false,
    };

    console.log('🚀 Creating Cloudzy Forex VPS:', payload);

    const response = await cloudzyRequest('/instances', 'POST', payload);

    console.log('✅ Cloudzy VPS creation response:', response);

    // Extract instance ID from response
    const instances = response.data as { instances?: Array<{ id: string }> };
    const instanceId = instances?.instances?.[0]?.id || 
                       (response.data as { id?: string })?.id ||
                       (response as { id?: string }).id;

    if (!instanceId) {
      console.warn('⚠️ No instance ID in response, using order ID');
      // Fall back to order ID if available
      const orderId = (response.data as { orderId?: string })?.orderId ||
                      (response as { orderId?: string }).orderId;
      
      return {
        instanceId: orderId || `pending-${Date.now()}`,
        status: 'provisioning',
        orderId: orderId,
      };
    }

    return {
      instanceId: instanceId,
      status: 'provisioning',
    };

  } catch (error) {
    console.error('❌ Failed to create Cloudzy VPS:', error);
    throw error;
  }
}

/**
 * Get VPS instance details including IP and credentials
 * 
 * @param instanceId - The Cloudzy instance ID
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
    console.log(`🧪 [MOCK] Skipping: ${instanceId}`);
    const createdTime = parseInt(instanceId.split('-').pop() || '0');
    const elapsed = Date.now() - createdTime;
    const isReady = elapsed > 60000; // 1 minute for mock
    
    return {
      instanceId,
      status: isReady ? 'active' : 'provisioning',
      ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
      hostname: 'Mock VPS',
      username: 'Administrator',
      password: isReady ? 'MockPassword123!' : undefined,
    };
  }

  // Skip legacy Contabo IDs (numeric only, not UUIDs)
  // Cloudzy uses UUIDs like "bc1f70fe-558d-472d-b981-8cc29e995de1"
  // Contabo uses numeric IDs like "203024710"
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(instanceId);
  const isNumericId = /^\d+$/.test(instanceId);
  
  if (isNumericId && !isUUID) {
    console.log(`⚠️ [LEGACY] Skipping Contabo ID: ${instanceId} (not a Cloudzy UUID)`);
    // Return null for legacy IDs - they can't be queried on Cloudzy
    return {
      instanceId,
      status: 'legacy',
      ipv4: '',
      hostname: 'Legacy Contabo VPS',
      username: 'Administrator',
      password: undefined,
    };
  }

  try {
    const response = await cloudzyRequest(`/instances/${instanceId}`);
    
    const instance = (response.data as {
      instance?: {
        id: string;
        status: string;
        ipv4?: string;
        hostname?: string;
        username?: string;
        password?: string;
      }
    })?.instance;

    if (!instance) {
      console.warn(`⚠️ No instance data found for ${instanceId}`);
      return null;
    }

    return {
      instanceId: instance.id,
      status: instance.status || 'unknown',
      ipv4: instance.ipv4 || '',
      hostname: instance.hostname || '',
      username: instance.username || 'Administrator',
      password: instance.password,
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
    const response = await cloudzyRequest('/instances');
    return (response.data as { instances?: Array<Record<string, unknown>> })?.instances || [];
  } catch (error) {
    console.error('❌ Failed to list VPS instances:', error);
    return [];
  }
}

/**
 * Reboot a VPS
 */
export async function rebootVPS(instanceId: string): Promise<boolean> {
  try {
    await cloudzyRequest(`/instances/${instanceId}/reboot`, 'POST');
    console.log(`🔄 VPS ${instanceId} reboot initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to reboot VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Stop a VPS
 */
export async function stopVPS(instanceId: string): Promise<boolean> {
  try {
    await cloudzyRequest(`/instances/${instanceId}/stop`, 'POST');
    console.log(`⏹️ VPS ${instanceId} stop initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to stop VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Start a VPS
 */
export async function startVPS(instanceId: string): Promise<boolean> {
  try {
    await cloudzyRequest(`/instances/${instanceId}/start`, 'POST');
    console.log(`▶️ VPS ${instanceId} start initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to start VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Delete/Cancel a VPS
 */
export async function deleteVPS(instanceId: string): Promise<boolean> {
  try {
    await cloudzyRequest(`/instances/${instanceId}`, 'DELETE');
    console.log(`🗑️ VPS ${instanceId} deletion initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete VPS ${instanceId}:`, error);
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

const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.CLOUDZY_API_TOKEN;

/**
 * Mock version of createForexVPS for testing
 */
export async function createForexVPSMock(
  planId: string,
  hostname: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _location: string = 'london'
): Promise<{ instanceId: string; status: string }> {
  console.log(`🧪 [MOCK] Creating Forex VPS: ${planId} - ${hostname}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    instanceId: `mock-vps-${Date.now()}`,
    status: 'provisioning',
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
  console.log(`🧪 [MOCK] Getting VPS details: ${instanceId}`);
  
  const createdTime = parseInt(instanceId.split('-').pop() || '0');
  const elapsed = Date.now() - createdTime;
  const isReady = elapsed > 30000;
  
  return {
    instanceId,
    status: isReady ? 'active' : 'provisioning',
    ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
    hostname: `Mock VPS ${instanceId}`,
    username: 'Administrator',
    password: isReady ? 'MockPassword123!' : undefined,
  };
}

// Export the appropriate functions based on environment
export const createVPS = USE_MOCK ? createForexVPSMock : createForexVPS;
export const getVPS = USE_MOCK ? getVPSDetailsMock : getVPSDetails;
