
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
    isFakeStep?: boolean;
}

export interface FakeStepInputs {
    [key: string]: string; // Maps input name to selected file name
}

export interface WorkflowEdge {
    from: string; // WorkflowNode id
    to: string;   // WorkflowNode id
    dataFlow: string[]; // The specific outputs from 'from' that become inputs to 'to'
}

// ATTENTION_RONAK: This is the shape of a workflow
// Can you try to generata a graph (like Ligandokreado.ts) that uses NodeHigh for each job?
// Also, can you see if you can upgrade NodeHigh (in TS) to support parallel execution?
export interface Workflow {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
