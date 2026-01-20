/**
 * VPS Provider Abstraction Layer
 * 
 * This module provides a unified interface for VPS provisioning,
 * allowing easy switching between providers (Zomro, Aeza, Cloudzy)
 * without changing application code.
 * 
 * To switch providers:
 * 1. Set VPS_PROVIDER environment variable to 'zomro', 'aeza', or 'cloudzy'
 * 2. Ensure the corresponding API token is set
 * 
 * Default: Zomro (Windows + MT5 pre-installed = best for Forex traders)
 * 
 * Provider Comparison:
 * - Zomro: €6.48/mo, MT5 pre-installed, Windows ready → RECOMMENDED
 * - Aeza: €4.94/mo, Ryzen 9 power, manual MT5 install
 * - Cloudzy: $29/mo, MT5 pre-installed, expensive
 */

import * as Aeza from './aeza';
import * as Cloudzy from './cloudzy';
import * as Zomro from './zomro';

// ============================================
// PROVIDER CONFIGURATION
// ============================================

export type VPSProvider = 'zomro' | 'aeza' | 'cloudzy';

/**
 * Get the current VPS provider from environment
 * Default: zomro (Windows + MT5 pre-installed)
 */
export function getCurrentProvider(): VPSProvider {
  const provider = process.env.VPS_PROVIDER?.toLowerCase() as VPSProvider;
  
  if (provider === 'cloudzy') {
    console.log('📡 Using Cloudzy as VPS provider');
    return 'cloudzy';
  }
  
  if (provider === 'aeza') {
    console.log('📡 Using Aeza as VPS provider');
    return 'aeza';
  }
  
  // Default to Zomro (MT5 pre-installed!)
  console.log('📡 Using Zomro as VPS provider (default - MT5 pre-installed)');
  return 'zomro';
}

/**
 * Get provider-specific configuration
 */
export function getProviderConfig(provider?: VPSProvider) {
  const p = provider || getCurrentProvider();
  
  if (p === 'cloudzy') {
    return {
      name: 'Cloudzy',
      apiTokenEnvVar: 'CLOUDZY_API_TOKEN',
      planMapping: Cloudzy.PLAN_MAPPING,
      regionMapping: Cloudzy.REGION_MAPPING,
      defaultRegion: 'london',
      features: ['Windows + MT5 pre-installed', 'Forex optimized'],
      mt5Preinstalled: true,
    };
  }
  
  if (p === 'aeza') {
    return {
      name: 'Aeza',
      apiTokenEnvVar: 'AEZA_API_TOKEN',
      planMapping: Aeza.PLAN_MAPPING,
      regionMapping: Aeza.REGION_MAPPING,
      defaultRegion: 'frankfurt',
      features: ['AMD Ryzen 9 CPU', 'NVMe storage', 'Best pricing'],
      mt5Preinstalled: false,
    };
  }
  
  // Zomro (default)
  return {
    name: 'Zomro',
    apiTokenEnvVar: 'ZOMRO_API_TOKEN',
    planMapping: Zomro.PLAN_MAPPING,
    regionMapping: Zomro.REGION_MAPPING,
    defaultRegion: 'amsterdam',
    features: ['Windows + MT5 pre-installed', 'Cloud Forex optimized', 'TIER III datacenter'],
    mt5Preinstalled: true,
  };
}

// ============================================
// UNIFIED VPS INTERFACE
// ============================================

export interface VPSDetails {
  instanceId: string;
  status: string;
  ipv4: string;
  hostname: string;
  username: string;
  password?: string;
}

export interface VPSCreateResult {
  instanceId: string;
  status: string;
  orderId?: string;
  password?: string;
}

// ============================================
// PROVIDER-AGNOSTIC FUNCTIONS
// ============================================

/**
 * Create a Forex VPS with the current provider
 */
export async function createForexVPS(
  planId: string,
  hostname: string,
  location?: string
): Promise<VPSCreateResult> {
  const provider = getCurrentProvider();
  const config = getProviderConfig(provider);
  const region = location || config.defaultRegion;
  
  console.log(`🚀 Creating VPS via ${config.name}: ${planId} @ ${region}`);
  
  if (provider === 'cloudzy') {
    return Cloudzy.createForexVPS(planId, hostname, region);
  }
  
  if (provider === 'aeza') {
    return Aeza.createForexVPS(planId, hostname, region);
  }
  
  // Zomro (default)
  return Zomro.createForexVPS(planId, hostname, region);
}

/**
 * Get VPS details from the current provider
 */
export async function getVPSDetails(instanceId: string): Promise<VPSDetails | null> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.getVPSDetails(instanceId);
  }
  
  if (provider === 'aeza') {
    return Aeza.getVPSDetails(instanceId);
  }
  
  // Zomro (default)
  return Zomro.getVPSDetails(instanceId);
}

/**
 * List all VPS instances
 */
export async function listVPSInstances(): Promise<Array<Record<string, unknown>>> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.listVPSInstances();
  }
  
  if (provider === 'aeza') {
    return Aeza.listVPSInstances();
  }
  
  // Zomro (default)
  return Zomro.listVPSInstances();
}

/**
 * Reboot a VPS
 */
export async function rebootVPS(instanceId: string): Promise<boolean> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.rebootVPS(instanceId);
  }
  
  if (provider === 'aeza') {
    return Aeza.rebootVPS(instanceId);
  }
  
  // Zomro (default)
  return Zomro.rebootVPS(instanceId);
}

/**
 * Stop a VPS
 */
export async function stopVPS(instanceId: string): Promise<boolean> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.stopVPS(instanceId);
  }
  
  if (provider === 'aeza') {
    return Aeza.stopVPS(instanceId);
  }
  
  // Zomro (default)
  return Zomro.stopVPS(instanceId);
}

/**
 * Start a VPS
 */
export async function startVPS(instanceId: string): Promise<boolean> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.startVPS(instanceId);
  }
  
  if (provider === 'aeza') {
    return Aeza.startVPS(instanceId);
  }
  
  // Zomro (default)
  return Zomro.startVPS(instanceId);
}

/**
 * Delete/Cancel a VPS
 */
export async function deleteVPS(instanceId: string): Promise<boolean> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.deleteVPS(instanceId);
  }
  
  if (provider === 'aeza') {
    return Aeza.deleteVPS(instanceId);
  }
  
  // Zomro (default)
  return Zomro.deleteVPS(instanceId);
}

/**
 * Poll VPS status until active or timeout
 */
export async function pollUntilActive(
  instanceId: string,
  maxAttempts: number = 60,
  intervalMs: number = 15000
): Promise<VPSDetails | null> {
  const provider = getCurrentProvider();
  
  if (provider === 'cloudzy') {
    return Cloudzy.pollUntilActive(instanceId, maxAttempts, intervalMs);
  }
  
  if (provider === 'aeza') {
    return Aeza.pollUntilActive(instanceId, maxAttempts, intervalMs);
  }
  
  // Zomro (default)
  return Zomro.pollUntilActive(instanceId, maxAttempts, intervalMs);
}

// ============================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================

// These match the old cloudzy.ts exports for easy migration
export const createVPS = createForexVPS;
export const getVPS = getVPSDetails;

// Re-export provider-specific modules for advanced use cases
export { Aeza, Cloudzy, Zomro };
