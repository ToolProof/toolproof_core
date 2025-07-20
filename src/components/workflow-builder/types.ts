
interface Concept {
    id: string;
    path: string;
    name: string;
    description: string;
    tags: string[];
}

export interface Job {
    id: string;
    name: string;
    description?: string;
    inputs: string[];
    outputs: string[];
}

export interface WorkflowNode {
    id: string;
    job: Job;
    position: number;
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

export interface Workflow {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
