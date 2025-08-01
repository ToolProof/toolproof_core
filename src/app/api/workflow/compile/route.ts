import { NextRequest, NextResponse } from 'next/server';
import { Workflow, WorkflowSpec, WorkflowStep, ResourceMap } from 'updohilo/dist/types/typesWF';
import { calculatorJobs } from 'updohilo/dist/mocks/calculator';

// Job definitions for input/output mapping
const JOB_DEFINITIONS: Record<string, { inputs: string[], outputs: string[] }> = {
    'add_numbers': {
        inputs: ['addend_1', 'addend_2'],
        outputs: ['sum']
    },
    'multiply_numbers': {
        inputs: ['multiplicand', 'multiplier'],
        outputs: ['product']
    },
    'subtract_numbers': {
        inputs: ['minuend', 'subtrahend'],
        outputs: ['difference']
    },
    'divide_numbers': {
        inputs: ['dividend', 'divisor'],
        outputs: ['quotient']
    }
};

// External input names for the workflow
const EXTERNAL_INPUTS = ['num_alpha', 'num_beta', 'num_gamma', 'num_delta', 'num_epsilon'];

function compileWorkflow(frontendWorkflow: Workflow): WorkflowSpec {
    const compiledSteps: WorkflowStep[] = [];
    const resourceMaps: ResourceMap = {};

    frontendWorkflow.steps.forEach((step, stepIndex) => {
        const jobDef = JOB_DEFINITIONS[step.jobId];
        if (!jobDef) {
            throw new Error(`Unknown job: ${step.jobId}`);
        }

        const compiledStep: WorkflowStep = {
            id: step.id,
            jobId: step.jobId,
            inputBindings: step.inputBindings || {},
            outputBindings: step.outputBindings || {}
        };

        // If no input bindings are provided by user, auto-generate them
        if (Object.keys(compiledStep.inputBindings).length === 0) {
            jobDef.inputs.forEach((inputName, inputIndex) => {
                const externalInputKey = EXTERNAL_INPUTS[inputIndex % EXTERNAL_INPUTS.length];
                compiledStep.inputBindings[inputName] = externalInputKey;

                // Add to resourceMaps if it's an external input
                if (!resourceMaps[externalInputKey]) {
                    resourceMaps[externalInputKey] = {
                        path: `calculator/_inputs/${externalInputKey}.json`
                    };
                }
            });
        } else {
            // Process user-defined input bindings
            Object.entries(compiledStep.inputBindings).forEach(([inputRole, inputValue]) => {
                if (typeof inputValue === 'string') {
                    let resourceKey: string;
                    let resourcePath: string;

                    if (inputValue.includes('/')) {
                        // It's a file path like "calculator/_inputs/num_1.json"
                        // Extract the filename without extension to use as key
                        const filename = inputValue.split('/').pop() || inputValue;
                        resourceKey = filename.replace('.json', '');
                        resourcePath = inputValue;

                        // Update the input binding to use the simple key
                        compiledStep.inputBindings[inputRole] = resourceKey;
                    } else if (inputValue.startsWith('num_') || inputValue.includes('_')) {
                        // It's an external input like "num_alpha" or output like "sum_1"
                        if (inputValue.startsWith('num_')) {
                            resourceKey = inputValue;
                            resourcePath = `calculator/_inputs/${inputValue}.json`;
                        } else {
                            // It's a reference to a previous step output, don't add to resourceMaps
                            return;
                        }
                    } else {
                        // Default case
                        resourceKey = inputValue;
                        resourcePath = `calculator/_inputs/${inputValue}.json`;
                    }

                    if (!resourceMaps[resourceKey]) {
                        resourceMaps[resourceKey] = {
                            path: resourcePath
                        };
                    }
                }
            });
        }

        // If no output bindings are provided by user, auto-generate them
        if (Object.keys(compiledStep.outputBindings).length === 0) {
            jobDef.outputs.forEach((outputName) => {
                const outputKey = `${outputName}_${stepIndex + 1}`;
                compiledStep.outputBindings[outputName] = outputKey;
            });
        }

        compiledSteps.push(compiledStep);
    });

    return {
        workflow: {
            id: frontendWorkflow.id,
            steps: compiledSteps
        },
        resourceMaps: [resourceMaps],
        counter: 0
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const frontendWorkflow: Workflow = body.workflow;

        if (!frontendWorkflow || !frontendWorkflow.steps) {
            return NextResponse.json(
                { error: 'Invalid workflow data' },
                { status: 400 }
            );
        }

        const compiledWorkflow = compileWorkflow(frontendWorkflow);

        return NextResponse.json({
            success: true,
            compiledWorkflow
        });

    } catch (error) {
        console.error('Error compiling workflow:', error);
        return NextResponse.json(
            { error: 'Failed to compile workflow' },
            { status: 500 }
        );
    }
}
