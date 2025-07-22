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
        embedding: number[] = [],
        format: string = 'json',
        schema: object | null = null,
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
        description?: string;
        embedding?: number[];
        format?: string;
        schema?: object | null;
    }>): ResourceType[] {
        return definitions.map(def =>
            this.define(
                def.displayName,
                def.description || '',
                def.embedding || [],
                def.format || 'json',
                def.schema || null,
            )
        );
    }
}

// Global resource type registry instance
const resourceTypeRegistry = new ResourceTypeRegistry();

// Convenience function for getting resource types
const RT = (displayName: string) => resourceTypeRegistry.get(displayName);

// Pre-define common reusable resource types
resourceTypeRegistry.defineMany([
    { displayName: 'number' },
    { displayName: 'character' },
]);

export { ResourceTypeRegistry, resourceTypeRegistry, RT };
