/**
 * Contabo API Client
 * 
 * Contabo uses OAuth2 authentication instead of simple API keys.
 * This client handles token management and VPS provisioning.
 * 
 * Required environment variables:
 * - CONTABO_CLIENT_ID
 * - CONTABO_CLIENT_SECRET
 * - CONTABO_API_USER (your email)
 * - CONTABO_API_PASSWORD (API-specific password from Customer Control Panel)
 * 
 * @see https://api.contabo.com/ for full API documentation
 */

import { randomUUID } from 'crypto';

const CONTABO_AUTH_URL = 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token';
const CONTABO_API_URL = 'https://api.contabo.com/v1';

/**
 * Plan Mapping: Our plan IDs to Contabo product IDs
 * 
 * IMPORTANT: Windows Server requires VDS, not VPS!
 * VPS products (V91-V107) do NOT support Windows images.
 * 
 * VDS Products that support Windows:
 * - V8:  VDS S  (4 vCPU, 12GB RAM, 180 GB NVMe)  ~$13.99/month
 * - V9:  VDS M  (6 vCPU, 16GB RAM, 240 GB NVMe)  ~$19.99/month
 * - V10: VDS L  (8 vCPU, 24GB RAM, 360 GB NVMe)  ~$29.99/month
 * - V11: VDS XL (10 vCPU, 40GB RAM, 480 GB NVMe) ~$49.99/month
 * - V16: VDS XXL (12 vCPU, 60GB RAM, 720 GB NVMe) ~$79.99/month
 */
export const PLAN_MAPPING: Record<string, string> = {
  // Basic: 4 vCPU, 12GB RAM -> VDS S
  basic: 'V8',
  
  // Prime: 6 vCPU, 16GB RAM -> VDS M
  prime: 'V9',
  
  // Pro: 8 vCPU, 24GB RAM -> VDS L
  pro: 'V10',
};

/**
 * Region mapping: Our location IDs to Contabo region codes
 * Available regions: EU, US-central, US-east, US-west, SIN, UK, AUS, JPN, IND
 */
export const REGION_MAPPING: Record<string, string> = {
  london: 'UK',        // London, UK
  germany: 'EU',       // Nuremberg, Germany
  usa: 'US-central',   // St. Louis, USA
  singapore: 'SIN',    // Singapore
  australia: 'AUS',    // Australia
  japan: 'JPN',        // Japan
};

// Token cache to avoid re-authenticating on every request
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generate a UUID for x-request-id header (required by Contabo API)
 */
function generateRequestId(): string {
  return randomUUID();
}

/**
 * Generate a secure random password for Windows VPS
 * Contabo requires: min 8 chars, uppercase, lowercase, numbers, special chars
 * Pattern: At least one upper, one lower, and either (1 number + 2 special) or (3 numbers + 1 special)
 * 
 * Example valid passwords:
 * - Abc123!@# (1 upper, 1 lower, 3 numbers, 2 special)
 * - Test789#! (1 upper, 3 lower, 3 numbers, 2 special)
 */
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$?_';
  
  // Build password with guaranteed pattern:
  // 2 uppercase + 4 lowercase + 4 numbers + 2 special = 12 chars minimum
  let password = '';
  
  // 2 uppercase
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  
  // 4 lowercase
  for (let i = 0; i < 4; i++) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  
  // 4 numbers
  for (let i = 0; i < 4; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  // 2 special
  password += special[Math.floor(Math.random() * special.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Shuffle the password to make it less predictable
  const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
  
  console.log('🔐 Generated password length:', shuffled.length);
  return shuffled;
}

/**
 * Get OAuth2 access token from Contabo
 * Token is cached and reused until expiration
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientId = process.env.CONTABO_CLIENT_ID;
  const clientSecret = process.env.CONTABO_CLIENT_SECRET;
  const apiUser = process.env.CONTABO_API_USER;
  const apiPassword = process.env.CONTABO_API_PASSWORD;

  if (!clientId || !clientSecret || !apiUser || !apiPassword) {
    throw new Error('Missing Contabo API credentials. Please set CONTABO_CLIENT_ID, CONTABO_CLIENT_SECRET, CONTABO_API_USER, and CONTABO_API_PASSWORD environment variables.');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('username', apiUser);
  params.append('password', apiPassword);

  console.log('🔑 Requesting Contabo access token...');

  const response = await fetch(CONTABO_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Contabo auth failed:', error);
    throw new Error(`Contabo authentication failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the token (expires_in is in seconds, we subtract 60s as buffer)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  console.log('✅ Contabo access token obtained');
  return data.access_token;
}

/**
 * Make an authenticated request to Contabo API
 */
async function contaboRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: object
): Promise<Record<string, unknown>> {
  const token = await getAccessToken();

  const response = await fetch(`${CONTABO_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-request-id': generateRequestId(), // Required by Contabo
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Contabo API error (${endpoint}):`, error);
    throw new Error(`Contabo API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a secret (password) in Contabo's Secret Management
 * This is required because the rootPassword field expects a secretId, not the actual password
 * 
 * @param password - The actual password to store
 * @param name - A unique name for this secret
 * @returns The secretId to use in instance creation
 */
async function createPasswordSecret(password: string, name: string): Promise<number> {
  console.log('🔐 Creating password secret in Contabo...');
  
  const response = await contaboRequest('/secrets', 'POST', {
    name: name,
    value: password,
    type: 'password',
  });

  const secretId = (response.data as Array<{ secretId: number }>)?.[0]?.secretId;
  
  if (!secretId) {
    throw new Error('Failed to create password secret: No secretId returned');
  }

  console.log('✅ Password secret created with ID:', secretId);
  return secretId;
}

/**
 * Get the Windows Server image ID from Contabo
 * 
 * Known Windows images (as of Jan 2026):
 * - 5af826e8-0e9d-4cec-9728-0966f98b4565: Windows Server 2025 Standard (English)
 * - ef27e2fa-188f-4767-964b-7543fea74968: Windows Server 2025 Standard (German)
 */
async function getWindowsImageId(): Promise<string> {
  // Use the known Windows Server 2025 Standard English image ID
  const WINDOWS_2025_EN = '5af826e8-0e9d-4cec-9728-0966f98b4565';
  
  console.log('🖥️ Using Windows Server 2025 Standard (English)');
  console.log('   Image ID:', WINDOWS_2025_EN);
  
  return WINDOWS_2025_EN;
}

/**
 * Create a Windows VPS on Contabo
 * 
 * Flow:
 * 1. Generate a secure password
 * 2. Create a secret in Contabo with this password
 * 3. Get the Windows image ID
 * 4. Create the instance using the secretId
 * 
 * @param planId - Our internal plan ID (basic, prime, pro)
 * @param label - Server label/hostname
 * @param location - Location ID (default: london)
 * @returns Object with instance ID, status, and generated password
 */
export async function createWindowsVPS(
  planId: string,
  label: string,
  location: string = 'london'
): Promise<{ id: string; status: string; password: string }> {
  try {
    const contaboPlanId = PLAN_MAPPING[planId];
    if (!contaboPlanId) {
      throw new Error(`No Contabo plan found for ${planId}`);
    }

    const region = REGION_MAPPING[location] || 'UK';
    
    // Step 1: Generate a secure password
    const generatedPassword = generateSecurePassword();
    
    // Step 2: Create a secret with this password
    const secretName = `vps-${label}-${Date.now()}`;
    const secretId = await createPasswordSecret(generatedPassword, secretName);
    
    // Step 3: Get Windows image ID
    const imageId = await getWindowsImageId();

    // Step 4: Create the instance
    const payload = {
      imageId: imageId,
      productId: contaboPlanId,
      region: region,
      rootPassword: secretId, // This is the secretId, not the password!
      period: 1, // Monthly
      displayName: label,
      defaultUser: 'administrator', // For Windows
    };

    console.log('🚀 Provisioning Contabo VPS:', { ...payload, rootPassword: `secretId:${secretId}` });

    const response = await contaboRequest('/compute/instances', 'POST', payload);

    console.log('✅ Contabo VPS created:', response);

    // Contabo returns the instance data
    const instanceData = (response.data as Array<{ instanceId: number }>)?.[0];
    
    return {
      id: String(instanceData?.instanceId || response.instanceId),
      status: 'provisioning',
      password: generatedPassword, // Return the actual password for storage
    };

  } catch (error) {
    console.error('❌ Failed to create Contabo VPS:', error);
    throw error;
  }
}

/**
 * Get VPS details from Contabo
 * 
 * @param instanceId - The Contabo instance ID (must be numeric)
 */
export async function getVPSDetails(instanceId: string): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  name: string;
} | null> {
  // Skip mock IDs - they start with "mock-" and are not real Contabo instances
  if (instanceId.startsWith('mock-')) {
    console.log(`🧪 [MOCK] Skipping mock instance: ${instanceId}`);
    // Simulate provisioning completion after 30 seconds
    const createdTime = parseInt(instanceId.split('-').pop() || '0');
    const elapsed = Date.now() - createdTime;
    const isReady = elapsed > 30000;
    
    return {
      instanceId,
      status: isReady ? 'running' : 'provisioning',
      ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
      name: `Mock VPS`,
    };
  }

  // Validate that instanceId is numeric (Contabo requirement)
  if (!/^\d+$/.test(instanceId)) {
    console.warn(`⚠️ Invalid Contabo instance ID format: ${instanceId}`);
    return null;
  }

  try {
    const response = await contaboRequest(`/compute/instances/${instanceId}`);
    
    const instance = (response.data as Array<{
      instanceId: number;
      status: string;
      ipConfig: { v4: { ip: string } };
      displayName: string;
      name: string;
    }>)?.[0];

    if (!instance) return null;

    return {
      instanceId: String(instance.instanceId),
      status: instance.status, // 'running', 'stopped', 'provisioning', etc.
      ipv4: instance.ipConfig?.v4?.ip || '',
      name: instance.displayName || instance.name,
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
    const response = await contaboRequest('/compute/instances');
    return (response.data as Array<Record<string, unknown>>) || [];
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
    await contaboRequest(`/compute/instances/${instanceId}/actions/restart`, 'POST');
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
    await contaboRequest(`/compute/instances/${instanceId}/actions/stop`, 'POST');
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
    await contaboRequest(`/compute/instances/${instanceId}/actions/start`, 'POST');
    console.log(`▶️ VPS ${instanceId} start initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to start VPS ${instanceId}:`, error);
    return false;
  }
}

/**
 * Cancel/Delete a VPS
 */
export async function cancelVPS(instanceId: string): Promise<boolean> {
  try {
    await contaboRequest(`/compute/instances/${instanceId}/cancel`, 'POST', {});
    console.log(`🗑️ VPS ${instanceId} cancellation initiated`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to cancel VPS ${instanceId}:`, error);
    return false;
  }
}

// ============================================
// MOCK MODE FOR DEVELOPMENT/TESTING
// ============================================

const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.CONTABO_CLIENT_ID;

/**
 * Mock version of createWindowsVPS for testing without real API
 */
export async function createWindowsVPSMock(
  planId: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  location: string = 'london'
): Promise<{ id: string; status: string; password: string }> {
  console.log(`🧪 [MOCK] Creating VPS: ${planId} - ${label}`);
  
  // Generate a mock password
  const mockPassword = `Mock${Math.random().toString(36).substring(2, 10)}!123`;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: `mock-vps-${Date.now()}`,
    status: 'provisioning',
    password: mockPassword,
  };
}

/**
 * Mock version of getVPSDetails
 */
export async function getVPSDetailsMock(instanceId: string): Promise<{
  instanceId: string;
  status: string;
  ipv4: string;
  name: string;
  default_password?: string;
} | null> {
  console.log(`🧪 [MOCK] Getting VPS details: ${instanceId}`);
  
  // Simulate provisioning time (after 30 seconds, return as "running")
  const createdTime = parseInt(instanceId.split('-').pop() || '0');
  const elapsed = Date.now() - createdTime;
  const isReady = elapsed > 30000; // 30 seconds
  
  return {
    instanceId,
    status: isReady ? 'running' : 'provisioning',
    ipv4: isReady ? `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '',
    name: `Mock VPS ${instanceId}`,
    default_password: isReady ? 'MockPassword123!' : undefined,
  };
}

// Export the appropriate functions based on environment
export const createVPS = USE_MOCK ? createWindowsVPSMock : createWindowsVPS;
export const getVPS = USE_MOCK ? getVPSDetailsMock : getVPSDetails;
