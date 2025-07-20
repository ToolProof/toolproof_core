import { ResourceType } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Centralized registry for reusable semantic resource types.
 * Resource types are defined once and reused across all jobs and workflows.
 */
class ResourceTypeRegistry {
    private resourceTypes = new Map<string, ResourceType>();

    /**
     * Define a new resource type in the registry
     */
    define(
        displayName: string,
        description: string,
        format: string = 'json',
        schema: object | null = null,
        embedding: number[] = []
    ): ResourceType {
        if (this.resourceTypes.has(displayName)) {
            return this.resourceTypes.get(displayName)!;
        }

        const resourceType: ResourceType = {
            id: uuidv4(),
            displayName,
            semanticSpec: {
                description,
                embedding
            },
            syntacticSpec: {
                format,
                schema
            }
        };

        this.resourceTypes.set(displayName, resourceType);

        return resourceType;
    }

    /**
     * Get a resource type by display name
     */
    get(displayName: string): ResourceType {
        const resourceType = this.resourceTypes.get(displayName);
        if (!resourceType) {
            throw new Error(`ResourceType '${displayName}' not found in registry. Did you forget to define it?`);
        }
        return resourceType;
    }

    /**
     * Check if a resource type exists
     */
    has(displayName: string): boolean {
        return this.resourceTypes.has(displayName);
    }

    /**
     * Get all resource types
     */
    getAll(): ResourceType[] {
        return Array.from(this.resourceTypes.values());
    }

    /**
     * Find resource types by format
     */
    findByFormat(format: string): ResourceType[] {
        return this.getAll().filter(resourceType => resourceType.syntacticSpec.format === format);
    }

    /**
     * Find resource types by partial name match
     */
    findByDisplayName(partialName: string): ResourceType[] {
        return this.getAll().filter(resourceType =>
            resourceType.displayName.toLowerCase().includes(partialName.toLowerCase())
        );
    }

    /**
     * Bulk define resource types with a fluent API
     */
    defineMany(definitions: Array<{
        displayName: string;
        description: string;
        format?: string;
        schema?: object | null;
        embedding?: number[];
    }>): ResourceType[] {
        return definitions.map(def =>
            this.define(
                def.displayName,
                def.description,
                def.format || 'json',
                def.schema || null,
                def.embedding || []
            )
        );
    }
}

// Global resource type registry instance
export const resourceTypeRegistry = new ResourceTypeRegistry();

// Convenience function for getting resource types
export const RT = (displayName: string) => resourceTypeRegistry.get(displayName);

// Pre-define common reusable resource types
resourceTypeRegistry.defineMany([
    // Greek letter resource types for mockJobs_1
    { displayName: 'alpha', description: 'Initial input parameter alpha', format: 'txt' },
    { displayName: 'beta', description: 'Initial input parameter beta', format: 'txt' },
    { displayName: 'gamma', description: 'Processed gamma data', format: 'txt' },
    { displayName: 'delta', description: 'Delta stream data', format: 'txt' },
    { displayName: 'epsilon', description: 'Epsilon stream data', format: 'txt' },
    { displayName: 'zeta', description: 'Processed zeta result', format: 'txt' },
    { displayName: 'eta', description: 'Eta processing result', format: 'txt' },
    { displayName: 'theta', description: 'Theta transformation output', format: 'txt' },
    { displayName: 'iota', description: 'Combined iota result', format: 'txt' },
    { displayName: 'kappa', description: 'Kappa transformation output', format: 'txt' },
    { displayName: 'lambda', description: 'Lambda transformation output', format: 'txt' },
    { displayName: 'mu', description: 'Mu analysis result', format: 'txt' },
    { displayName: 'nu', description: 'Nu processing output', format: 'txt' },
    { displayName: 'xi', description: 'Xi processing output', format: 'txt' },
    { displayName: 'omicron', description: 'Omicron analysis result', format: 'txt' },
    { displayName: 'pi', description: 'Pi enhancement result', format: 'txt' },
    { displayName: 'rho', description: 'Rho transformation result', format: 'txt' },
    { displayName: 'sigma', description: 'Sigma processing result', format: 'txt' },
    { displayName: 'tau', description: 'Tau enhancement result', format: 'txt' },
    { displayName: 'upsilon', description: 'Upsilon analysis result', format: 'txt' },
    { displayName: 'phi', description: 'Phi merge result', format: 'txt' },
    { displayName: 'chi', description: 'Chi analysis result', format: 'txt' },
    { displayName: 'psi', description: 'Psi processing result', format: 'txt' },
    { displayName: 'omega', description: 'Omega combination result', format: 'txt' },
    { displayName: 'alpha_prime', description: 'Enhanced alpha prime', format: 'txt' },
    { displayName: 'beta_prime', description: 'Enhanced beta prime', format: 'txt' },
    { displayName: 'gamma_prime', description: 'Enhanced gamma prime', format: 'txt' },
    { displayName: 'delta_prime', description: 'Enhanced delta prime', format: 'txt' },
    { displayName: 'epsilon_prime', description: 'Enhanced epsilon prime', format: 'txt' },
    { displayName: 'zeta_prime', description: 'Enhanced zeta prime', format: 'txt' },
    { displayName: 'eta_prime', description: 'Enhanced eta prime', format: 'txt' },
    { displayName: 'theta_prime', description: 'Enhanced theta prime', format: 'txt' },
    { displayName: 'iota_prime', description: 'Enhanced iota prime', format: 'txt' },
    { displayName: 'kappa_prime', description: 'Enhanced kappa prime', format: 'txt' },
    { displayName: 'lambda_prime', description: 'Enhanced lambda prime', format: 'txt' },
    { displayName: 'mu_prime', description: 'Enhanced mu prime', format: 'txt' },
    { displayName: 'nu_prime', description: 'Enhanced nu prime', format: 'txt' },
    { displayName: 'xi_prime', description: 'Enhanced xi prime', format: 'txt' },
    { displayName: 'omicron_prime', description: 'Enhanced omicron prime', format: 'txt' },
    { displayName: 'pi_prime', description: 'Enhanced pi prime', format: 'txt' },
    { displayName: 'rho_prime', description: 'Enhanced rho prime', format: 'txt' },
    { displayName: 'sigma_prime', description: 'Enhanced sigma prime', format: 'txt' },
    { displayName: 'tau_prime', description: 'Enhanced tau prime', format: 'txt' },
    { displayName: 'upsilon_prime', description: 'Enhanced upsilon prime', format: 'txt' },
    { displayName: 'phi_prime', description: 'Enhanced phi prime', format: 'txt' },
    { displayName: 'chi_prime', description: 'Enhanced chi prime', format: 'txt' },
    { displayName: 'psi_prime', description: 'Enhanced psi prime', format: 'txt' },
    { displayName: 'omega_prime', description: 'Enhanced omega prime', format: 'txt' },

    // Double variants for complex processing
    { displayName: 'alpha_double', description: 'Double-processed alpha', format: 'txt' },
    { displayName: 'beta_double', description: 'Double-processed beta', format: 'txt' },
    { displayName: 'gamma_double', description: 'Double-processed gamma', format: 'txt' },
    { displayName: 'delta_double', description: 'Double-processed delta', format: 'txt' },
    { displayName: 'epsilon_double', description: 'Double-processed epsilon', format: 'txt' },
    { displayName: 'zeta_double', description: 'Double-processed zeta', format: 'txt' },
    { displayName: 'eta_double', description: 'Double-processed eta', format: 'txt' },
    { displayName: 'theta_double', description: 'Double-processed theta', format: 'txt' },
    { displayName: 'iota_double', description: 'Double-processed iota', format: 'txt' },
    { displayName: 'kappa_double', description: 'Double-processed kappa', format: 'txt' },
    { displayName: 'lambda_double', description: 'Double-processed lambda', format: 'txt' },
    { displayName: 'mu_double', description: 'Double-processed mu', format: 'txt' },
    { displayName: 'nu_double', description: 'Double-processed nu', format: 'txt' },
    { displayName: 'xi_double', description: 'Double-processed xi', format: 'txt' },
    { displayName: 'omicron_double', description: 'Double-processed omicron', format: 'txt' },
    { displayName: 'pi_double', description: 'Double-processed pi', format: 'txt' },
    { displayName: 'rho_double', description: 'Double-processed rho', format: 'txt' },
    { displayName: 'sigma_double', description: 'Double-processed sigma', format: 'txt' },
    { displayName: 'tau_double', description: 'Double-processed tau', format: 'txt' },
    { displayName: 'upsilon_double', description: 'Double-processed upsilon', format: 'txt' },
    { displayName: 'phi_double', description: 'Double-processed phi', format: 'txt' },
    { displayName: 'chi_double', description: 'Double-processed chi', format: 'txt' },
    { displayName: 'psi_double', description: 'Double-processed psi', format: 'txt' },
    { displayName: 'omega_double', description: 'Double-processed omega', format: 'txt' },

    // Triple variants for advanced processing
    { displayName: 'alpha_triple', description: 'Triple-processed alpha', format: 'txt' },
    { displayName: 'beta_triple', description: 'Triple-processed beta', format: 'txt' },
    { displayName: 'gamma_triple', description: 'Triple-processed gamma', format: 'txt' },
    { displayName: 'delta_triple', description: 'Triple-processed delta', format: 'txt' },
    { displayName: 'epsilon_triple', description: 'Triple-processed epsilon', format: 'txt' },
    { displayName: 'zeta_triple', description: 'Triple-processed zeta', format: 'txt' },
    { displayName: 'eta_triple', description: 'Triple-processed eta', format: 'txt' },
    { displayName: 'theta_triple', description: 'Triple-processed theta', format: 'txt' },
    { displayName: 'iota_triple', description: 'Triple-processed iota', format: 'txt' },
    { displayName: 'kappa_triple', description: 'Triple-processed kappa', format: 'txt' },
    { displayName: 'lambda_triple', description: 'Triple-processed lambda', format: 'txt' },
    { displayName: 'mu_triple', description: 'Triple-processed mu', format: 'txt' },
    { displayName: 'nu_triple', description: 'Triple-processed nu', format: 'txt' },
    { displayName: 'xi_triple', description: 'Triple-processed xi', format: 'txt' },
    { displayName: 'omicron_triple', description: 'Triple-processed omicron', format: 'txt' },
    { displayName: 'pi_triple', description: 'Triple-processed pi', format: 'txt' },
    { displayName: 'rho_triple', description: 'Triple-processed rho', format: 'txt' },
    { displayName: 'sigma_triple', description: 'Triple-processed sigma', format: 'txt' },
    { displayName: 'tau_triple', description: 'Triple-processed tau', format: 'txt' },
    { displayName: 'upsilon_triple', description: 'Triple-processed upsilon', format: 'txt' },
    { displayName: 'phi_triple', description: 'Triple-processed phi', format: 'txt' },
    { displayName: 'chi_triple', description: 'Triple-processed chi', format: 'txt' },
    { displayName: 'psi_triple', description: 'Triple-processed psi', format: 'txt' },
    { displayName: 'omega_triple', description: 'Triple-processed omega', format: 'txt' },

    // Quad variants for complex integration
    { displayName: 'alpha_quad', description: 'Quad-processed alpha', format: 'txt' },
    { displayName: 'beta_quad', description: 'Quad-processed beta', format: 'txt' },
    { displayName: 'gamma_quad', description: 'Quad-processed gamma', format: 'txt' },
    { displayName: 'delta_quad', description: 'Quad-processed delta', format: 'txt' },
    { displayName: 'epsilon_quad', description: 'Quad-processed epsilon', format: 'txt' },
    { displayName: 'zeta_quad', description: 'Quad-processed zeta', format: 'txt' },
    { displayName: 'eta_quad', description: 'Quad-processed eta', format: 'txt' },
    { displayName: 'theta_quad', description: 'Quad-processed theta', format: 'txt' },
    { displayName: 'iota_quad', description: 'Quad-processed iota', format: 'txt' },
    { displayName: 'kappa_quad', description: 'Quad-processed kappa', format: 'txt' },
    { displayName: 'lambda_quad', description: 'Quad-processed lambda', format: 'txt' },
    { displayName: 'mu_quad', description: 'Quad-processed mu', format: 'txt' },
    { displayName: 'nu_quad', description: 'Quad-processed nu', format: 'txt' },
    { displayName: 'xi_quad', description: 'Quad-processed xi', format: 'txt' },
    { displayName: 'omicron_quad', description: 'Quad-processed omicron', format: 'txt' },
    { displayName: 'pi_quad', description: 'Quad-processed pi', format: 'txt' },
    { displayName: 'rho_quad', description: 'Quad-processed rho', format: 'txt' },
    { displayName: 'sigma_quad', description: 'Quad-processed sigma', format: 'txt' },
    { displayName: 'tau_quad', description: 'Quad-processed tau', format: 'txt' },
    { displayName: 'upsilon_quad', description: 'Quad-processed upsilon', format: 'txt' },
    { displayName: 'phi_quad', description: 'Quad-processed phi', format: 'txt' },
    { displayName: 'chi_quad', description: 'Quad-processed chi', format: 'txt' },
    { displayName: 'psi_quad', description: 'Quad-processed psi', format: 'txt' },
    { displayName: 'omega_quad', description: 'Quad-processed omega', format: 'txt' },

    // Penta variants for advanced integration
    { displayName: 'alpha_penta', description: 'Penta-processed alpha', format: 'txt' },
    { displayName: 'beta_penta', description: 'Penta-processed beta', format: 'txt' },
    { displayName: 'gamma_penta', description: 'Penta-processed gamma', format: 'txt' },
    { displayName: 'delta_penta', description: 'Penta-processed delta', format: 'txt' },
    { displayName: 'epsilon_penta', description: 'Penta-processed epsilon', format: 'txt' },
    { displayName: 'zeta_penta', description: 'Penta-processed zeta', format: 'txt' },
    { displayName: 'eta_penta', description: 'Penta-processed eta', format: 'txt' },
    { displayName: 'theta_penta', description: 'Penta-processed theta', format: 'txt' },
    { displayName: 'iota_penta', description: 'Penta-processed iota', format: 'txt' },
    { displayName: 'kappa_penta', description: 'Penta-processed kappa', format: 'txt' },
    { displayName: 'lambda_penta', description: 'Penta-processed lambda', format: 'txt' },
    { displayName: 'mu_penta', description: 'Penta-processed mu', format: 'txt' },
    { displayName: 'nu_penta', description: 'Penta-processed nu', format: 'txt' },
    { displayName: 'xi_penta', description: 'Penta-processed xi', format: 'txt' },
    { displayName: 'omicron_penta', description: 'Penta-processed omicron', format: 'txt' },
    { displayName: 'pi_penta', description: 'Penta-processed pi', format: 'txt' },
    { displayName: 'rho_penta', description: 'Penta-processed rho', format: 'txt' },
    { displayName: 'sigma_penta', description: 'Penta-processed sigma', format: 'txt' },
    { displayName: 'tau_penta', description: 'Penta-processed tau', format: 'txt' },
    { displayName: 'upsilon_penta', description: 'Penta-processed upsilon', format: 'txt' },
    { displayName: 'phi_penta', description: 'Penta-processed phi', format: 'txt' },
    { displayName: 'chi_penta', description: 'Penta-processed chi', format: 'txt' },
    { displayName: 'psi_penta', description: 'Penta-processed psi', format: 'txt' },
    { displayName: 'omega_penta', description: 'Penta-processed omega', format: 'txt' },

    // Hexa variants for monitoring systems
    { displayName: 'alpha_hexa', description: 'Hexa-processed alpha', format: 'txt' },
    { displayName: 'beta_hexa', description: 'Hexa-processed beta', format: 'txt' },
    { displayName: 'gamma_hexa', description: 'Hexa-processed gamma', format: 'txt' },
    { displayName: 'delta_hexa', description: 'Hexa-processed delta', format: 'txt' },
    { displayName: 'epsilon_hexa', description: 'Hexa-processed epsilon', format: 'txt' },
    { displayName: 'zeta_hexa', description: 'Hexa-processed zeta', format: 'txt' },
    { displayName: 'eta_hexa', description: 'Hexa-processed eta', format: 'txt' },
    { displayName: 'theta_hexa', description: 'Hexa-processed theta', format: 'txt' },
    { displayName: 'iota_hexa', description: 'Hexa-processed iota', format: 'txt' },
    { displayName: 'kappa_hexa', description: 'Hexa-processed kappa', format: 'txt' },
    { displayName: 'lambda_hexa', description: 'Hexa-processed lambda', format: 'txt' },
    { displayName: 'mu_hexa', description: 'Hexa-processed mu', format: 'txt' },
    { displayName: 'nu_hexa', description: 'Hexa-processed nu', format: 'txt' },
    { displayName: 'xi_hexa', description: 'Hexa-processed xi', format: 'txt' },
]);

export { ResourceTypeRegistry };

// For backward compatibility, also export with old names
export const conceptRegistry = resourceTypeRegistry;
export const C = RT;
