export interface Job {
    id: string;
    name: string;
    description: string;
    inputs: string[];
    outputs: string[];
}

export interface WorkflowStep {
    id: string;
    job: Job;
    position: number;
    isFakeStep?: boolean;
}

export interface FakeStepInputs {
    [key: string]: string; // Maps input name to selected file name
}
