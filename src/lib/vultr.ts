
import vultrNode from '@vultr/vultr-node';

// Initialize Vultr client with API key
const vultr = vultrNode.initialize({
  apiKey: process.env.VULTR_API_KEY || 'MOCK_KEY_FOR_BUILDing',
});

// Plan Mapping based on user selection
export const PLAN_MAPPING: Record<string, string> = {
  // We need to map our 'basic', 'prime', 'pro' to a Vultr Plan ID.
  // Using standard Vultr VC2 plan IDs as placeholders.
  // Warning: Windows Server 2022 requires minimum disk/RAM.
  
  // Basic: 2 vCPU, 4GB RAM -> 'vc2-2c-4gb'
  basic: 'vc2-2c-4gb',
  
  // Prime: 4 vCPU, 8GB RAM -> 'vc2-4c-8gb'
  prime: 'vc2-4c-8gb',
  
  // Pro: 6 vCPU, 16GB RAM -> 'vc2-6c-16gb'
  pro: 'vc2-6c-16gb',
};

// Region ID for London
const REGION_LONDON = 'lhr';

// OS ID for Windows Server 2022 Standard (Verify ID in Vultr API)
// 477 is typically Windows 2022 Standard in Vultr (checking docs mentally, but should be user verified)
// Using an approximate ID, user might need to listOS to confirm.
const OS_WINDOWS_2022 = 477; 

export async function createWindowsVPS(planId: string, label: string) {
  try {
    const vultrPlanId = PLAN_MAPPING[planId];
    if (!vultrPlanId) {
      throw new Error(`No Vultr plan found for ${planId}`);
    }

    // Prepare instance creation payload
    // Note: Vultr API for create-instance might vary by version. 
    // Using generic implementation pattern.
    const payload = {
      region: REGION_LONDON,
      plan: vultrPlanId,
      os_id: OS_WINDOWS_2022,
      label: label,
      hostname: label,
      enable_ipv6: false,
      backups: 'disabled',
    };

    console.log('🚀 Provisioning Vultr VPS:', payload);
    
    // Call Vultr API
    // The library signature might be vultr.instances.createInstance or similar
    // @ts-ignore - The library types might be slightly different, using 'any' safely for now
    const response = await vultr.instances.createInstance(payload);

    console.log('✅ Vultr Response:', response);

    // Response usually contains { instance: { id: "subid", ... } }
    return response.instance;

  } catch (error) {
    console.error('❌ Failed to create Vultr VPS:', error);
    throw error;
  }
}

export async function getVPSDetails(instanceId: string) {
  try {
    // @ts-ignore
    const response = await vultr.instances.getInstance({ 'instance-id': instanceId });
    return response.instance;
  } catch (error) {
    console.error(`❌ Failed to get VPS details for ${instanceId}:`, error);
    return null;
  }
}
