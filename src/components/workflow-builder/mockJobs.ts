import { Job, WorkflowNode, Workflow, WorkflowEdge } from './types';
import { v4 as uuidv4 } from 'uuid';
import { RT } from './resourceTypeRegistry';


export const mockJobs_1: Job[] = [
    {
        id: uuidv4(),
        displayName: 'add_1',
        url: 'https://dummy-url.com/add_1',
        semanticSpec: {
            description: 'Initial data processing',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('number'), RT('number')],
            outputs: [RT('number')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_2',
        url: 'https://dummy-url.com/job_2',
        semanticSpec: {
            description: 'Transform gamma data',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('gamma')],
            outputs: [RT('delta'), RT('epsilon')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_3',
        url: 'https://dummy-url.com/job_3',
        semanticSpec: {
            description: 'Process delta stream',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('delta')],
            outputs: [RT('zeta')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_4',
        url: 'https://dummy-url.com/job_4',
        semanticSpec: {
            description: 'Process epsilon stream',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('epsilon')],
            outputs: [RT('eta'), RT('theta')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_5',
        url: 'https://dummy-url.com/job_5',
        semanticSpec: {
            description: 'Combine zeta and eta',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('zeta'), RT('eta')],
            outputs: [RT('iota')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_6',
        url: 'https://dummy-url.com/job_6',
        semanticSpec: {
            description: 'Transform theta data',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('theta')],
            outputs: [RT('kappa'), RT('lambda')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_7',
        url: 'https://dummy-url.com/job_7',
        semanticSpec: {
            description: 'Process iota with kappa',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('iota'), RT('kappa')],
            outputs: [RT('mu')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_8',
        url: 'https://dummy-url.com/job_8',
        semanticSpec: {
            description: 'Lambda transformation',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('lambda')],
            outputs: [RT('nu'), RT('xi')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_9',
        url: 'https://dummy-url.com/job_9',
        semanticSpec: {
            description: 'Mu analysis',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('mu')],
            outputs: [RT('omicron')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_10',
        url: 'https://dummy-url.com/job_10',
        semanticSpec: {
            description: 'Nu and xi combination',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('nu'), RT('xi')],
            outputs: [RT('pi'), RT('rho')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_11',
        url: 'https://dummy-url.com/job_11',
        semanticSpec: {
            description: 'Omicron processing',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('omicron')],
            outputs: [RT('sigma')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_12',
        url: 'https://dummy-url.com/job_12',
        semanticSpec: {
            description: 'Pi enhancement',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('pi')],
            outputs: [RT('tau')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_13',
        url: 'https://dummy-url.com/job_13',
        semanticSpec: {
            description: 'Rho transformation',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('rho')],
            outputs: [RT('upsilon')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_14',
        url: 'https://dummy-url.com/job_14',
        semanticSpec: {
            description: 'Sigma and tau merge',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('sigma'), RT('tau')],
            outputs: [RT('phi')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_15',
        url: 'https://dummy-url.com/job_15',
        semanticSpec: {
            description: 'Upsilon analysis',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('upsilon')],
            outputs: [RT('chi')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_16',
        url: 'https://dummy-url.com/job_16',
        semanticSpec: {
            description: 'Phi processing',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('phi')],
            outputs: [RT('psi')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_17',
        url: 'https://dummy-url.com/job_17',
        semanticSpec: {
            description: 'Chi and psi combination',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('chi'), RT('psi')],
            outputs: [RT('omega')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_18',
        url: 'https://dummy-url.com/job_18',
        semanticSpec: {
            description: 'Independent alpha generator',
            embedding: []
        },
        syntacticSpec: {
            inputs: [],
            outputs: [RT('alpha_prime')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_19',
        url: 'https://dummy-url.com/job_19',
        semanticSpec: {
            description: 'Alpha prime enhancement',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('alpha_prime')],
            outputs: [RT('beta_prime')]
        }
    },
    {
        id: uuidv4(),
        displayName: 'job_20',
        url: 'https://dummy-url.com/job_20',
        semanticSpec: {
            description: 'Final omega processing',
            embedding: []
        },
        syntacticSpec: {
            inputs: [RT('omega'), RT('beta_prime')],
            outputs: [RT('omega_prime')]
        }
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
    
    // Find all jobs that can start a workflow (no dependencies or all dependencies are external)
    const findStarterJobs = (remainingJobs: Job[]): Job[] => {
        return remainingJobs.filter(job => {
            // A job can start if none of its inputs are produced by any other remaining job
            const availableOutputs = new Set(
                remainingJobs.flatMap(j => j.syntacticSpec.outputs.map(o => o.displayName))
            );
            return job.syntacticSpec.inputs.every(input => !availableOutputs.has(input.displayName));
        });
    };
    
    // Build a single workflow starting from a given job
    const buildWorkflow = (startJob: Job, availableJobs: Job[]): Workflow => {
        const steps: WorkflowNode[] = [];
        const edges: WorkflowEdge[] = [];
        const stepMap = new Map<string, WorkflowNode>(); // jobId -> step
        const producedOutputs = new Set<string>();
        
        // Helper to create a fake step for missing inputs
        const createFakeStep = (inputName: string): WorkflowNode => {
            const step: WorkflowNode = {
                job: {
                    id: uuidv4(),
                    displayName: `load_${inputName}`,
                    url: 'https://dummy-url.com',
                    semanticSpec: {
                        description: `Load input file for ${inputName}`,
                        embedding: []
                    },
                    syntacticSpec: {
                        inputs: [],
                        outputs: [RT(inputName)]
                    }
                },
                isFakeStep: true
            };
            return step;
        };
        
        // Helper to create a regular step
        const createStep = (job: Job): WorkflowNode => {
            const step: WorkflowNode = {
                job: job,
                isFakeStep: false
            };
            return step;
        };
        
        // Process a job and add it to the workflow
        const processJob = (job: Job): WorkflowNode => {
            // Check for missing inputs and create fake steps
            for (const input of job.syntacticSpec.inputs) {
                if (!producedOutputs.has(input.displayName)) {
                    const fakeStep = createFakeStep(input.displayName);
                    steps.push(fakeStep);
                    stepMap.set(fakeStep.job.id, fakeStep);
                    producedOutputs.add(input.displayName);
                }
            }
            
            // Create the actual job step
            const step = createStep(job);
            steps.push(step);
            stepMap.set(job.id, step);
            
            // Create edges from producers to this step
            for (const input of job.syntacticSpec.inputs) {
                // Find the step that produces this input
                for (const [jobId, producerStep] of stepMap) {
                    if (producerStep.job.syntacticSpec.outputs.some(output => output.displayName === input.displayName)) {
                        const edge: WorkflowEdge = {
                            from: jobId,
                            to: job.id,
                            dataFlow: [input.displayName]
                        };
                        // Check if edge already exists and merge dataFlow
                        const existingEdge = edges.find(e => e.from === edge.from && e.to === edge.to);
                        if (existingEdge) {
                            if (!existingEdge.dataFlow.includes(input.displayName)) {
                                existingEdge.dataFlow.push(input.displayName);
                            }
                        } else {
                            edges.push(edge);
                        }
                        break;
                    }
                }
            }
            
            // Mark outputs as produced
            job.syntacticSpec.outputs.forEach(output => producedOutputs.add(output.displayName));
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
                const satisfiedInputs = job.syntacticSpec.inputs.filter(input => producedOutputs.has(input.displayName));
                const canChain = satisfiedInputs.length > 0 || job.syntacticSpec.inputs.length === 0;
                
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