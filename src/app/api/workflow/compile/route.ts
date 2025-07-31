import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Types for the frontend workflow
interface FrontendWorkflow {
    id: string;
    steps: FrontendWorkflowStep[];
}

interface FrontendWorkflowStep {
    id: string;
    jobId: string;
    inputBindings: Record<string, string>;
    outputBindings: Record<string, string>;
}

// Types for the compiled workflow
interface CompiledWorkflow {
    id: string;
    steps: CompiledWorkflowStep[];
}

interface CompiledWorkflowStep {
    id: string;
    jobId: string;
    inputBindings: Record<string, string>;
    outputBindings: Record<string, string>;
}

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

function compileWorkflow(frontendWorkflow: FrontendWorkflow): CompiledWorkflow {
    const compiledSteps: CompiledWorkflowStep[] = [];
    const availableOutputs: string[] = [];
    const outputCounters: Record<string, number> = {};
    let externalInputIndex = 0;

    frontendWorkflow.steps.forEach((step, stepIndex) => {
        const jobDef = JOB_DEFINITIONS[step.jobId];
        if (!jobDef) {
            throw new Error(`Unknown job: ${step.jobId}`);
        }

        const compiledStep: CompiledWorkflowStep = {
            id: step.id,
            jobId: step.jobId,
            inputBindings: {},
            outputBindings: {}
        };

        // Handle input bindings
        jobDef.inputs.forEach((inputName, inputIndex) => {
            let inputSource: string;

            // For the first step, use external inputs
            if (stepIndex === 0) {
                inputSource = EXTERNAL_INPUTS[externalInputIndex % EXTERNAL_INPUTS.length];
                externalInputIndex++;
            } else {
                // For subsequent steps, use a mix of previous outputs and external inputs
                if (inputIndex === 0 && availableOutputs.length > 0) {
                    // First input: prefer the most recent output from previous step
                    inputSource = availableOutputs[availableOutputs.length - 1];
                } else {
                    // Other inputs: use external inputs
                    inputSource = EXTERNAL_INPUTS[externalInputIndex % EXTERNAL_INPUTS.length];
                    externalInputIndex++;
                }
            }

            compiledStep.inputBindings[inputName] = inputSource;
        });

        // Handle output bindings and track available outputs
        jobDef.outputs.forEach((outputName) => {
            // Increment counter for this output type
            if (!outputCounters[outputName]) {
                outputCounters[outputName] = 0;
            }
            outputCounters[outputName]++;

            const outputKey = `${outputName}_${outputCounters[outputName]}`;
            compiledStep.outputBindings[outputName] = outputKey;
            availableOutputs.push(outputKey);
        });

        compiledSteps.push(compiledStep);
    });

    return {
        id: frontendWorkflow.id,
        steps: compiledSteps
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const frontendWorkflow: FrontendWorkflow = body.workflow;

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
