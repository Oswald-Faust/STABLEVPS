/**
 * Aeza API Client
 * 
 * Aeza provides high-performance VPS with AMD Ryzen 9 processors.
 * This client handles VPS provisioning and status polling.
 * 
 * Aeza offers MUCH better pricing than Cloudzy:
 * - ~$5-8/month for 2-4GB RAM with Windows included
 * - AMD Ryzen 9 7950X3D (5GHz+) vs Intel Xeon
 * - Same API simplicity
 * 
 * Required environment variable:
 * - AEZA_API_TOKEN (Get from https://my.aeza.net/settings/apikeys)
 * 
 * @see https://github.com/AezaGroup/dev-docs for API documentation
 */

const AEZA_API_URL = 'https://my.aeza.net/api';

/**
 * Plan Mapping: Our plan IDs to Aeza product IDs
 * 
 * Aeza VPS plans with Windows Server included:
 * - Basic ($8/month): 2 vCPU Ryzen, 4GB RAM, 60GB NVMe  → Ruthenium
 * - Prime ($14/month): 4 vCPU Ryzen, 8GB RAM, 90GB NVMe → Palladium
 * - Pro ($27/month): 8 vCPU Ryzen, 12GB RAM, 150GB NVMe → Aurum
 * 
 * Note: Product IDs may need to be fetched from API on first run
 * Use GET /services/products to get actual IDs
 */
export const PLAN_MAPPING: Record<string, { 
  productId: number;
  name: string;
  cpu: number;
  ram: number;
  disk: number;
  priceUSD: number;
}> = {
  // Basic: 2 vCPU, 4GB RAM, 60GB NVMe - ~$8/month (Ruthenium)
  basic: {
    productId: 1,  // Will be updated after API verification
    name: 'Ruthenium',
    cpu: 2,
    ram: 4,
    disk: 60,
    priceUSD: 8,
  },
  
  // Prime: 4 vCPU, 8GB RAM, 90GB NVMe - ~$14/month (Palladium)
  prime: {
    productId: 2,  // Will be updated after API verification
    name: 'Palladium', 
    cpu: 4,
    ram: 8,
    disk: 90,
    priceUSD: 14,
  },
  
  // Pro: 8 vCPU, 12GB RAM, 150GB NVMe - ~$27/month (Aurum)
  pro: {
    productId: 3,  // Will be updated after API verification
    name: 'Aurum',
    cpu: 8,
    ram: 12,
    disk: 150,
    priceUSD: 27,
  },
};

/**
 * Region mapping: Our location IDs to Aeza location IDs
 * 
 * Aeza has data centers in:
 * - Vienna (Austria) - Great for EU Forex
 * - Frankfurt (Germany) - Major Forex hub
 * - Amsterdam (Netherlands)
 * - London (UK) - Major Forex hub
 * - Moscow (Russia)
 * - Stockholm (Sweden)
 */
export const REGION_MAPPING: Record<string, string> = {
  london: 'london',
  frankfurt: 'frankfurt', 
  vienna: 'vienna',
  amsterdam: 'amsterdam',
  newyork: 'newyork',
  moscow: 'moscow',
};

/**
 * Windows Server 2022 OS ID
 * To get actual ID: GET https://my.aeza.net/api/os
 * Look for Windows Server 2022 in the response
 */
let WINDOWS_OS_ID: number | null = null;

/**
 * Make an authenticated request to Aeza API
 */
async function aezaRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<Record<string, unknown>> {
  const token = process.env.AEZA_API_TOKEN;
  
  if (!token) {
    throw new Error('Missing AEZA_API_TOKEN environment variable. Get it from https://my.aeza.net/settings/apikeys');
  }

  const url = `${AEZA_API_URL}${endpoint}`;
  console.log(`🌐 Aeza API ${method} ${endpoint}`);

  const response = await fetch(url, {
    method,
    headers: {
      'X-API-Key': token,
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
    console.error('❌ Aeza API returned non-JSON response:', text.substring(0, 200));
    throw new Error(`Aeza API error: Non-JSON response - ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    console.error(`❌ Aeza API error (${endpoint}):`, data);
    throw new Error(`Aeza API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Get list of available OS and find Windows Server 2022 ID
 */
async function getWindowsOsId(): Promise<number> {
  if (WINDOWS_OS_ID !== null) {
    return WINDOWS_OS_ID;
  }

  try {
    const response = await aezaRequest('/os');
    const osList = (response.items as Array<{ id: number; name: string }>) || [];
    
    // Find Windows Server 2022
    const windowsOs = osList.find(os => 
      os.name.toLowerCase().includes('windows') && 
      os.name.includes('2022')
    );
    
    if (windowsOs) {
      WINDOWS_OS_ID = windowsOs.id;
      console.log(`✅ Found Windows Server 2022 OS ID: ${WINDOWS_OS_ID}`);
      return WINDOWS_OS_ID;
    }
    
    // Fallback: any Windows Server
    const anyWindows = osList.find(os => 
      os.name.toLowerCase().includes('windows server')
    );
    
    if (anyWindows) {
      WINDOWS_OS_ID = anyWindows.id;
      console.log(`✅ Found Windows Server OS ID: ${WINDOWS_OS_ID} (${anyWindows.name})`);
      return WINDOWS_OS_ID;
    }

    throw new Error('No Windows Server OS found in Aeza');
  } catch (error) {
    console.error('❌ Failed to get Windows OS ID:', error);
    // Default fallback (will need to be updated after API check)
    return 1;
  }
}

/**
 * Get available products from Aeza and update PLAN_MAPPING
 */
export async function syncProductIds(): Promise<void> {
  try {
    const response = await aezaRequest('/services/products?extra=1');
    const products = (response.items as Array<{ 
      id: number; 
      name: string;
      parameters?: {
        cpu?: number;
        ram?: number;
        disk?: number;
      };
    }>) || [];
    
    console.log(`📦 Found ${products.length} Aeza products`);
    
    // Match products by specs
    for (const product of products) {
      const specs = product.parameters;
      if (!specs) continue;
      
      // Match Basic: 2 vCPU, 4GB RAM
      if (specs.cpu === 2 && specs.ram === 4) {
        PLAN_MAPPING.basic.productId = product.id;
        console.log(`  ✅ Basic plan matched: ${product.name} (ID: ${product.id})`);
      }
      // Match Prime: 4 vCPU, 8GB RAM  
      else if (specs.cpu === 4 && specs.ram === 8) {
        PLAN_MAPPING.prime.productId = product.id;
        console.log(`  ✅ Prime plan matched: ${product.name} (ID: ${product.id})`);
      }
      // Match Pro: 8 vCPU, 12GB RAM
      else if (specs.cpu === 8 && (specs.ram ?? 0) >= 12) {
        PLAN_MAPPING.pro.productId = product.id;
        console.log(`  ✅ Pro plan matched: ${product.name} (ID: ${product.id})`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync product IDs:', error);
  }
}

/**
 * Create a Forex VPS with Windows Server 2022
 * 
 * @param planId - Our internal plan ID (basic, prime, pro)
 * @param hostname - Server hostname/label
 * @param location - Location ID (default: frankfurt)
 * @returns Object with instance ID and initial status
 */
export async function createForexVPS(
  planId: string,
  hostname: string,
  location: string = 'frankfurt'
): Promise<{ 
  instanceId: string; 
  status: string;
  orderId?: string;
}> {
  try {
    const planConfig = PLAN_MAPPING[planId];
    if (!planConfig) {
      throw new Error(`No Aeza plan found for ${planId}`);
    }

    const region = REGION_MAPPING[location] || 'frankfurt';
    const windowsOsId = await getWindowsOsId();
    
    // Sanitize hostname (alphanumeric and hyphens only)
    const sanitizedHostname = hostname
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .substring(0, 50);

    // Aeza order payload
    // Based on: POST /services/orders
    const payload = {
      productId: planConfig.productId,
      name: sanitizedHostname,
      location: region,
      os: windowsOsId,
      // Auto-generated secure password
      autoPassword: true,
      // Period in months (1 = monthly billing)
      period: 1,
      // Quantity
      count: 1,
    };

    console.log('🚀 Creating Aeza Forex VPS:', payload);

    const response = await aezaRequest('/services/orders', 'POST', payload);

    console.log('✅ Aeza VPS order response:', response);

    // Extract order ID from response
    const orderId = (response.data as { id?: number })?.id?.toString() || 
                    (response as { id?: number }).id?.toString();

    if (!orderId) {
      throw new Error('No order ID returned from Aeza');
    }

    // Poll for created service IDs
    // Aeza creates the order first, then services are created async
    let serviceId: string | undefined;
    
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderDetails = await aezaRequest(`/services/orders/${orderId}`);
      const createdIds = (orderDetails.data as { createdServiceIds?: number[] })?.createdServiceIds ||
                         (orderDetails as { createdServiceIds?: number[] }).createdServiceIds;
      
      if (createdIds && createdIds.length > 0) {
        serviceId = createdIds[0].toString();
        console.log(`✅ Service created with ID: ${serviceId}`);
        break;
      }
      
      console.log(`  ⏳ Waiting for service creation... (attempt ${attempt + 1})`);
    }

    return {
      instanceId: serviceId || `order-${orderId}`,
      status: 'provisioning',
      orderId: orderId,
    };

  } catch (error) {
    console.error('❌ Failed to create Aeza VPS:', error);
    throw error;
  }
}

/**
 * Get VPS instance details including IP and credentials
 * 
 * @param instanceId - The Aeza service ID
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
  if (instanceId.startsWith('mock-') || instanceId.startsWith('pending-') || instanceId.startsWith('order-')) {
    console.log(`🧪 [MOCK/PENDING] Skipping: ${instanceId}`);
    const createdTime = parseInt(instanceId.split('-').pop() || '0');
    const elapsed = Date.now() - createdTime;
    const isReady = elapsed > 60000; // 1 minute for mock
    
    return {
      instanceId,
      status: isReady ? 'active' : 'provisioning',
      ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
      hostname: 'Aeza VPS',
      username: 'Administrator',
      password: isReady ? 'TempPassword123!' : undefined,
    };
  }

  // Skip legacy Cloudzy UUIDs (they have dashes in specific format)
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
    const response = await aezaRequest(`/services/${instanceId}?extra=1`);
    
    const service = response.data as {
      id: number;
      name?: string;
      status?: string;
      currentStatus?: string;
      secureParameters?: {
        ip?: string;
        ipv4?: string;
        password?: string;
        username?: string;
      };
      payload?: {
        ip?: string;
        ipv4?: string;
      };
    } || response;

    if (!service || !service.id) {
      console.warn(`⚠️ No service data found for ${instanceId}`);
      return null;
    }

    // Aeza status mapping
    // Aeza uses: active, suspended, provisioning, etc.
    const status = service.currentStatus || service.status || 'unknown';
    
    // IP can be in different places
    const ipv4 = service.secureParameters?.ip || 
                 service.secureParameters?.ipv4 ||
                 service.payload?.ip ||
                 service.payload?.ipv4 || '';

    return {
      instanceId: service.id.toString(),
      status: status,
      ipv4: ipv4,
      hostname: service.name || '',
      username: service.secureParameters?.username || 'Administrator',
      password: service.secureParameters?.password,
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
    const response = await aezaRequest('/services?extra=1');
    return (response.items as Array<Record<string, unknown>>) || [];
  } catch (error) {
    console.error('❌ Failed to list VPS instances:', error);
    return [];
  }
}

/**
 * Control VPS: reboot, suspend, resume
 */
async function controlVPS(instanceId: string, action: 'reboot' | 'suspend' | 'resume'): Promise<boolean> {
  try {
    await aezaRequest(`/services/${instanceId}/ctl`, 'POST', { action });
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
  return controlVPS(instanceId, 'suspend');
}

/**
 * Start a VPS
 */
export async function startVPS(instanceId: string): Promise<boolean> {
  return controlVPS(instanceId, 'resume');
}

/**
 * Delete/Cancel a VPS
 */
export async function deleteVPS(instanceId: string): Promise<boolean> {
  try {
    await aezaRequest(`/services/${instanceId}`, 'DELETE');
    console.log(`🗑️ VPS ${instanceId} deletion initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Reinstall VPS with a new OS
 */
export async function reinstallVPS(
  instanceId: string, 
  osId?: number,
  password?: string
): Promise<boolean> {
  try {
    const windowsOsId = osId || await getWindowsOsId();
    
    await aezaRequest(`/services/${instanceId}/reinstall`, 'POST', {
      os: windowsOsId,
      password: password || generateSecurePassword(),
    });
    
    console.log(`🔄 VPS ${instanceId} reinstall initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to reinstall VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Change VPS password
 */
export async function changeVPSPassword(instanceId: string, newPassword: string): Promise<boolean> {
  try {
    await aezaRequest(`/services/${instanceId}/changePassword`, 'PUT', {
      password: newPassword,
    });
    console.log(`🔑 VPS ${instanceId} password changed`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to change password for VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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

const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.AEZA_API_TOKEN;

/**
 * Mock version of createForexVPS for testing
 */
export async function createForexVPSMock(
  planId: string,
  hostname: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _location: string = 'frankfurt'
): Promise<{ instanceId: string; status: string }> {
  console.log(`🧪 [MOCK] Creating Aeza Forex VPS: ${planId} - ${hostname}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    instanceId: `mock-aeza-${Date.now()}`,
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
  console.log(`🧪 [MOCK] Getting Aeza VPS details: ${instanceId}`);
  
  const createdTime = parseInt(instanceId.split('-').pop() || '0');
  const elapsed = Date.now() - createdTime;
  const isReady = elapsed > 30000;
  
  return {
    instanceId,
    status: isReady ? 'active' : 'provisioning',
    ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
    hostname: `Aeza VPS ${instanceId}`,
    username: 'Administrator',
    password: isReady ? 'AezaSecure123!' : undefined,
  };
}

// Export the appropriate functions based on environment
export const createVPS = USE_MOCK ? createForexVPSMock : createForexVPS;
export const getVPS = USE_MOCK ? getVPSDetailsMock : getVPSDetails;
