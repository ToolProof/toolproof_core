
export interface Tool {
    id: string;
    displayName: string;
}

export interface Concept extends Tool {
    semanticSpec: {
        description: string;
        embedding: number[];
    }
}

export interface ResourceType extends Concept {
    syntacticSpec: {
        format: string; // ATTENTION: prefer a set of predefined formats
        schema: object | null; // JSON schema for validation
    }
}

export interface Job extends Concept {
    url: string;
    syntacticSpec: {
        inputs: ResourceType[];
        outputs: ResourceType[];
    }
}

export interface WorkflowNode {
    job: Job;
    isFakeStep: boolean;
}

export interface WorkflowEdge {
    from: string; // WorkflowNode id
    to: string;   // WorkflowNode id
    dataFlow: string[]; // The specific outputs from 'from' that become inputs to 'to'
}

export interface Workflow {
    workflowNodes: WorkflowNode[];
    workflowEdges: WorkflowEdge[];
}
