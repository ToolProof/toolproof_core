import { Job, WorkflowNode, Workflow, WorkflowEdge } from './types';
import { v4 as uuidv4 } from 'uuid';


export const mockJobs: Job[] = [
    {
        id: uuidv4(),
        name: 'job_1',
        description: 'Initial data processing',
        inputs: ['alpha', 'beta'],
        outputs: ['gamma'],
    },
    {
        id: uuidv4(),
        name: 'job_2',
        description: 'Transform gamma data',
        inputs: ['gamma'],
        outputs: ['delta', 'epsilon'],
    },
    {
        id: uuidv4(),
        name: 'job_3',
        description: 'Process delta stream',
        inputs: ['delta'],
        outputs: ['zeta'],
    },
    {
        id: uuidv4(),
        name: 'job_4',
        description: 'Process epsilon stream',
        inputs: ['epsilon'],
        outputs: ['eta', 'theta'],
    },
    {
        id: uuidv4(),
        name: 'job_5',
        description: 'Combine zeta and eta',
        inputs: ['zeta', 'eta'],
        outputs: ['iota'],
    },
    {
        id: uuidv4(),
        name: 'job_6',
        description: 'Transform theta data',
        inputs: ['theta'],
        outputs: ['kappa', 'lambda'],
    },
    {
        id: uuidv4(),
        name: 'job_7',
        description: 'Process iota with kappa',
        inputs: ['iota', 'kappa'],
        outputs: ['mu'],
    },
    {
        id: uuidv4(),
        name: 'job_8',
        description: 'Lambda transformation',
        inputs: ['lambda'],
        outputs: ['nu', 'xi'],
    },
    {
        id: uuidv4(),
        name: 'job_9',
        description: 'Mu analysis',
        inputs: ['mu'],
        outputs: ['omicron'],
    },
    {
        id: uuidv4(),
        name: 'job_10',
        description: 'Nu and xi combination',
        inputs: ['nu', 'xi'],
        outputs: ['pi', 'rho'],
    },
    {
        id: uuidv4(),
        name: 'job_11',
        description: 'Omicron processing',
        inputs: ['omicron'],
        outputs: ['sigma'],
    },
    {
        id: uuidv4(),
        name: 'job_12',
        description: 'Pi enhancement',
        inputs: ['pi'],
        outputs: ['tau'],
    },
    {
        id: uuidv4(),
        name: 'job_13',
        description: 'Rho transformation',
        inputs: ['rho'],
        outputs: ['upsilon'],
    },
    {
        id: uuidv4(),
        name: 'job_14',
        description: 'Sigma and tau merge',
        inputs: ['sigma', 'tau'],
        outputs: ['phi'],
    },
    {
        id: uuidv4(),
        name: 'job_15',
        description: 'Upsilon analysis',
        inputs: ['upsilon'],
        outputs: ['chi'],
    },
    {
        id: uuidv4(),
        name: 'job_16',
        description: 'Phi processing',
        inputs: ['phi'],
        outputs: ['psi'],
    },
    {
        id: uuidv4(),
        name: 'job_17',
        description: 'Chi and psi combination',
        inputs: ['chi', 'psi'],
        outputs: ['omega'],
    },
    {
        id: uuidv4(),
        name: 'job_18',
        description: 'Independent alpha generator',
        inputs: [],
        outputs: ['alpha_prime'],
    },
    {
        id: uuidv4(),
        name: 'job_19',
        description: 'Alpha prime enhancement',
        inputs: ['alpha_prime'],
        outputs: ['beta_prime'],
    },
    {
        id: uuidv4(),
        name: 'job_20',
        description: 'Final omega processing',
        inputs: ['omega', 'beta_prime'],
        outputs: ['final_result'],
    },
]

/**
 * Generates workflows from a list of jobs by finding chains of compatible jobs.
 * Jobs are chainable only if outputs of one job match inputs of another.
 * Automatically inserts fake steps for inputs that haven't been produced by earlier jobs.
 * 
 * @param jobs Array of jobs to create workflows from
 * @returns Array of workflows, where each workflow is a graph with steps and edges
 */
export function generateWorkflows(jobs: Job[]): Workflow[] {
    const workflows: Workflow[] = [];
    const usedJobs = new Set<string>();
    
    // Helper to check if two jobs are chainable (outputs of first match inputs of second)
    const areChainable = (fromJob: Job, toJob: Job): string[] => {
        const matchingOutputs: string[] = [];
        for (const input of toJob.inputs) {
            if (fromJob.outputs.includes(input)) {
                matchingOutputs.push(input);
            }
        }
        return matchingOutputs;
    };
    
    // Find all jobs that can start a workflow (no dependencies or all dependencies are external)
    const findStarterJobs = (remainingJobs: Job[]): Job[] => {
        return remainingJobs.filter(job => {
            // A job can start if none of its inputs are produced by any other remaining job
            const availableOutputs = new Set(
                remainingJobs.flatMap(j => j.outputs)
            );
            return job.inputs.every(input => !availableOutputs.has(input));
        });
    };
    
    // Build a single workflow starting from a given job
    const buildWorkflow = (startJob: Job, availableJobs: Job[]): Workflow => {
        const steps: WorkflowNode[] = [];
        const edges: WorkflowEdge[] = [];
        const stepMap = new Map<string, WorkflowNode>(); // jobId -> step
        const producedOutputs = new Set<string>();
        let position = 0;
        
        // Helper to create a fake step for missing inputs
        const createFakeStep = (inputName: string): WorkflowNode => {
            const step: WorkflowNode = {
                id: uuidv4(),
                job: {
                    id: uuidv4(),
                    name: `load_${inputName}`,
                    description: `Load input file for ${inputName}`,
                    inputs: [],
                    outputs: [inputName]
                },
                position: position++,
                isFakeStep: true
            };
            return step;
        };
        
        // Helper to create a regular step
        const createStep = (job: Job): WorkflowNode => {
            const step: WorkflowNode = {
                id: uuidv4(),
                job: job,
                position: position++,
                isFakeStep: false
            };
            return step;
        };
        
        // Process a job and add it to the workflow
        const processJob = (job: Job): WorkflowNode => {
            // Check for missing inputs and create fake steps
            for (const input of job.inputs) {
                if (!producedOutputs.has(input)) {
                    const fakeStep = createFakeStep(input);
                    steps.push(fakeStep);
                    stepMap.set(fakeStep.job.id, fakeStep);
                    producedOutputs.add(input);
                }
            }
            
            // Create the actual job step
            const step = createStep(job);
            steps.push(step);
            stepMap.set(job.id, step);
            
            // Create edges from producers to this step
            for (const input of job.inputs) {
                // Find the step that produces this input
                for (const [jobId, producerStep] of stepMap) {
                    if (producerStep.job.outputs.includes(input)) {
                        const edge: WorkflowEdge = {
                            from: producerStep.id,
                            to: step.id,
                            dataFlow: [input]
                        };
                        // Check if edge already exists and merge dataFlow
                        const existingEdge = edges.find(e => e.from === edge.from && e.to === edge.to);
                        if (existingEdge) {
                            if (!existingEdge.dataFlow.includes(input)) {
                                existingEdge.dataFlow.push(input);
                            }
                        } else {
                            edges.push(edge);
                        }
                        break;
                    }
                }
            }
            
            // Mark outputs as produced
            job.outputs.forEach(output => producedOutputs.add(output));
            usedJobs.add(job.id);
            
            return step;
        };
        
        // Start with the initial job
        processJob(startJob);
        
        // Continue finding jobs that can be chained
        let foundChainableJob = true;
        const remainingJobs = availableJobs.filter(j => j.id !== startJob.id);
        
        while (foundChainableJob) {
            foundChainableJob = false;
            
            // Find a job that can be chained (has at least one input satisfied)
            for (let i = 0; i < remainingJobs.length; i++) {
                const job = remainingJobs[i];
                
                if (usedJobs.has(job.id)) continue;
                
                // Check if any of the job's inputs are satisfied by current outputs
                const satisfiedInputs = job.inputs.filter(input => producedOutputs.has(input));
                const canChain = satisfiedInputs.length > 0 || job.inputs.length === 0;
                
                if (canChain) {
                    processJob(job);
                    foundChainableJob = true;
                    break;
                }
            }
        }
        
        return {
            nodes: steps,
            edges
        };
    };
    
    // Create workflows by finding starter jobs and building chains
    const remainingJobs = [...jobs];
    
    while (remainingJobs.length > 0) {
        const unusedJobs = remainingJobs.filter(job => !usedJobs.has(job.id));
        if (unusedJobs.length === 0) break;
        
        const starterJobs = findStarterJobs(unusedJobs);
        
        if (starterJobs.length === 0) {
            // If no clear starter, pick the first unused job
            const firstUnused = unusedJobs[0];
            const workflow = buildWorkflow(firstUnused, unusedJobs);
            workflows.push(workflow);
        } else {
            // Build workflows from each starter job
            for (const starterJob of starterJobs) {
                if (!usedJobs.has(starterJob.id)) {
                    const workflow = buildWorkflow(starterJob, unusedJobs);
                    workflows.push(workflow);
                }
            }
        }
        
        // Safety check to prevent infinite loop
        const currentUsedCount = usedJobs.size;
        if (currentUsedCount === 0) {
            // Force use at least one job to prevent infinite loop
            const firstUnused = unusedJobs[0];
            if (firstUnused) {
                usedJobs.add(firstUnused.id);
            }
        }
    }
    
    return workflows;
}