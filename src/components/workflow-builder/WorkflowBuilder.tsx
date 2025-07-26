'use client';
import { numericalJobs } from 'updohilo/dist/mocks/mocks';
import { validateWorkflow } from 'updohilo/dist/utils';
import { Workflow, Job } from 'updohilo/dist/types/typesWF';
import WorkflowHeader from './WorkflowHeader';
import AvailableJobsPanel from './AvailableJobsPanel';
import WorkflowStepsPanel from './WorkflowStepsPanel';
import WorkflowVisualizer from '@/xr/worlds/workflowVisualizer/WorkflowVisualizer';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function WorkflowBuilder() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
    const [draggedJob, setDraggedJob] = useState<Job | null>(null);
    const [workflowName, setWorkflowName] = useState('');
    const [fakeStepInputs, setFakeStepInputs] = useState<FakeStepInputs>({});
    const [show3D, setShow3D] = useState(false);

    const getWorkflowConnections = useCallback(() => {
        const connections: { from: string; to: string; output: string; input: string }[] = [];

        for (let i = 0; i < workflowNodes.length - 1; i++) {
            const currentStep = workflowNodes[i];
            const nextStep = workflowNodes[i + 1];

            // Find matching outputs and inputs
            currentStep.job.syntacticSpec.outputs.forEach(output => {
                if (nextStep.job.syntacticSpec.inputs.some(input => input.displayName === output.displayName)) {
                    connections.push({
                        from: currentStep.job.id,
                        to: nextStep.job.id,
                        output: output.displayName,
                        input: output.displayName
                    });
                }
            });
        }

        return connections;
    }, [workflowNodes]);

    useEffect(() => {
        let workflowsInstance: Workflows | null = null;

        const asyncWrapper = async () => {
            // Only initialize when the 3D overlay is shown and container is available
            if (!show3D || !containerRef.current || workflowNodes.length === 0) return;

            // Create workflow structure with edges based on connections
            const workflow = {
                nodes: workflowNodes,
                edges: getWorkflowConnections().map(connection => ({
                    from: connection.from,
                    to: connection.to,
                    dataFlow: [connection.output]
                }))
            };

            workflowsInstance = new Workflows(containerRef.current, workflow);
            await workflowsInstance.init();
        }

        asyncWrapper();

        // Cleanup on unmount or when overlay closes
        return () => {
            if (workflowsInstance) {
                workflowsInstance.cleanup();
            }
        };

    }, [workflowNodes, show3D, getWorkflowConnections]); // Add show3D as dependency

    // Calculate required initial inputs and update fake steps
    useEffect(() => {
        const realSteps = workflowNodes.filter(step => !step.isFakeStep);

        if (realSteps.length === 0) {
            // Remove fake step if no real steps
            setWorkflowNodes(prev => prev.filter(step => !step.isFakeStep));
            return;
        }

        // Get all inputs required by all steps
        const allRequiredInputs = new Set<string>();
        realSteps.forEach(step => {
            step.job.syntacticSpec.inputs.forEach(input => allRequiredInputs.add(input.displayName));
        });

        // Get all outputs produced by all steps
        const allProducedOutputs = new Set<string>();
        realSteps.forEach(step => {
            step.job.syntacticSpec.outputs.forEach(output => allProducedOutputs.add(output.displayName));
        });

        // Missing inputs are those required but not produced
        const missingInputs = Array.from(allRequiredInputs).filter(input => !allProducedOutputs.has(input));

        if (missingInputs.length > 0) {
            // Check if we already have a fake step
            const hasFakeStep = workflowNodes.some(step => step.isFakeStep);

            if (!hasFakeStep) {
                // Create a fake step with missing inputs
                const fakeStep: WorkflowNode = {
                    job: {
                        id: 'fake-job',
                        displayName: 'Initial Inputs',
                        semanticSpec: {
                            description: 'Upload required input files for the workflow',
                            embedding: []
                        },
                        syntacticSpec: {
                            inputs: [],
                            outputs: missingInputs.map(input => ({
                                id: `fake-${input}`,
                                displayName: input,
                                semanticSpec: {
                                    description: `Input file for ${input}`,
                                    embedding: []
                                },
                                syntacticSpec: {
                                    format: 'file',
                                    schema: null
                                }
                            }))
                        }
                    },
                    isFakeStep: true
                };

                setWorkflowNodes(prev => [fakeStep, ...prev.filter(step => !step.isFakeStep)]);
            } else {
                // Update existing fake step outputs if they changed
                const currentFakeStep = workflowNodes.find(step => step.isFakeStep);
                if (currentFakeStep && JSON.stringify(currentFakeStep.job.syntacticSpec.outputs.map(o => o.displayName).sort()) !== JSON.stringify(missingInputs.sort())) {
                    setWorkflowNodes(prev => prev.map(step =>
                        step.isFakeStep
                            ? {
                                ...step,
                                job: {
                                    ...step.job,
                                    syntacticSpec: {
                                        ...step.job.syntacticSpec,
                                        outputs: missingInputs.map(input => ({
                                            id: `fake-${input}`,
                                            displayName: input,
                                            semanticSpec: {
                                                description: `Input file for ${input}`,
                                                embedding: []
                                            },
                                            syntacticSpec: {
                                                format: 'file',
                                                schema: null
                                            }
                                        }))
                                    }
                                }
                            }
                            : step
                    ));
                }
            }
        } else {
            // Remove fake step if no missing inputs
            setWorkflowNodes(prev => prev.filter(step => !step.isFakeStep));
        }
    }, [workflowNodes]);

    const handleFakeStepInputChange = (inputName: string, fileName: string) => {
        setFakeStepInputs(prev => ({
            ...prev,
            [inputName]: fileName
        }));
    };

    const handleDragStart = (job: Job) => {
        setDraggedJob(job);
    };

    const handleDragEnd = () => {
        setDraggedJob(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (draggedJob) {
            const newStep: WorkflowNode = {
                job: draggedJob
            };
            setWorkflowNodes(prev => [...prev, newStep]);
        }
        setDraggedJob(null);
    }, [draggedJob]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeStep = (jobId: string) => {
        setWorkflowNodes(prev => prev.filter(step => step.job.id !== jobId && !step.isFakeStep));
    };

    const moveStep = (jobId: string, direction: 'up' | 'down') => {
        setWorkflowNodes(prev => {
            const currentIndex = prev.findIndex(step => step.job.id === jobId);
            if (currentIndex === -1) return prev;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newSteps = [...prev];
            [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];

            return newSteps;
        });
    };

    const validateWorkflow = () => {
        const issues: string[] = [];
        const realSteps = workflowNodes.filter(step => !step.isFakeStep);

        if (realSteps.length === 0) {
            issues.push('Workflow is empty');
            return issues;
        }

        // Check if fake step has all required inputs selected
        const fakeStep = workflowNodes.find(step => step.isFakeStep);
        if (fakeStep) {
            const missingSelections = fakeStep.job.syntacticSpec.outputs.filter(output => !fakeStepInputs[output.displayName]);
            if (missingSelections.length > 0) {
                issues.push(`Please select files for: ${missingSelections.map(o => o.displayName).join(', ')}`);
            }
        }

        // Check connections between real steps
        for (let i = 1; i < realSteps.length; i++) {
            const prevStep = realSteps[i - 1];
            const currentStep = realSteps[i];

            const hasMatchingInputs = currentStep.job.syntacticSpec.inputs.some(input =>
                prevStep.job.syntacticSpec.outputs.some(output => output.displayName === input.displayName)
            );

            if (!hasMatchingInputs) {
                const realStepIndex = workflowNodes.findIndex(step => step.job.id === currentStep.job.id);
                issues.push(`Step ${realStepIndex + 1} (${currentStep.job.displayName}) has no matching inputs from previous step`);
            }
        }

        return issues;
    };

    const exportWorkflow = () => {
        const workflow = {
            name: workflowName || 'Untitled Workflow',
            steps: workflowNodes,
            connections: getWorkflowConnections(),
            initialInputs: fakeStepInputs,
            createdAt: new Date().toISOString()
        };

        console.log('Workflow exported:', workflow);
        // You can add actual export functionality here
        alert('Workflow exported to console');
    };

    const validationIssues = validateWorkflow();

    return (
        <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col">
            <WorkflowHeader
                workflowName={workflowName}
                setWorkflowName={setWorkflowName}
                onExport={exportWorkflow}
                onView3D={() => setShow3D(!show3D)}
                validationIssues={validationIssues}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <AvailableJobsPanel
                    jobs={mockJobs_1}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />

                <WorkflowStepsPanel
                    workflowNodes={workflowNodes}
                    fakeStepInputs={fakeStepInputs}
                    availableFiles={availableFiles}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onFakeStepInputChange={handleFakeStepInputChange}
                    onMoveStep={moveStep}
                    onRemoveStep={removeStep}
                />
            </div>
            {/* Fullscreen 3D overlay */}
            {show3D && (
                <div
                    className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90"
                    style={{ backdropFilter: 'blur(2px)' }}
                >
                    <button
                        className="absolute top-4 right-4 z-60 px-4 py-2 bg-white text-gray-800 rounded shadow hover:bg-gray-200"
                        onClick={() => setShow3D(false)}
                        aria-label="Close 3D scene"
                    >
                        ×
                    </button>
                    <div className="flex-1 flex items-center justify-center">
                        <div
                            ref={containerRef}
                            className="w-full h-full"
                            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
