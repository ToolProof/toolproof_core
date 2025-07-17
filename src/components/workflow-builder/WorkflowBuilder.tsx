'use client';
import { availableJobs, mockJobs } from './mockJobs';
import { Job, WorkflowStep, FakeStepInputs } from './types';
import WorkflowHeader from './WorkflowHeader';
import AvailableJobsPanel from './AvailableJobsPanel';
import WorkflowStepsPanel from './WorkflowStepsPanel';
import { Workflows } from '@/xr/worlds/workflows/Workflows';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function WorkflowBuilder() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [draggedJob, setDraggedJob] = useState<Job | null>(null);
    const [workflowName, setWorkflowName] = useState('');
    const [fakeStepInputs, setFakeStepInputs] = useState<FakeStepInputs>({});

    // Dummy file options for the fake step selector
    const availableFiles = {
        anchor: ['anchor_1.pdb', 'anchor_2.pdb', 'anchor_3.pdb'],
        target: ['target_1.pdb', 'target_2.pdb', 'target_3.pdb'],
        box: ['box_1.txt', 'box_2.txt', 'box_3.txt'],
        candidate: ['candidate_1.pdb', 'candidate_2.pdb'],
        docking: ['docking_1.dat', 'docking_2.dat'],
        pose: ['pose_1.pdb', 'pose_2.pdb']
    };

    useEffect(() => {
        let workflowsInstance: Workflows | null = null;

        const asyncWrapper = async () => {
            if (!containerRef.current) return;

            workflowsInstance = new Workflows(containerRef.current, workflowSteps);
            await workflowsInstance.init();
        }

        asyncWrapper();

        // Cleanup on unmount
        return () => {
            if (workflowsInstance) {
                workflowsInstance.cleanup();
            }
        };

    }, [workflowSteps]);

    // Calculate required initial inputs and update fake steps
    useEffect(() => {
        const realSteps = workflowSteps.filter(step => !step.isFakeStep);

        if (realSteps.length === 0) {
            // Remove fake step if no real steps
            setWorkflowSteps(prev => prev.filter(step => !step.isFakeStep));
            return;
        }

        // Get all inputs required by all steps
        const allRequiredInputs = new Set<string>();
        realSteps.forEach(step => {
            step.job.inputs.forEach(input => allRequiredInputs.add(input));
        });

        // Get all outputs produced by all steps
        const allProducedOutputs = new Set<string>();
        realSteps.forEach(step => {
            step.job.outputs.forEach(output => allProducedOutputs.add(output));
        });

        // Missing inputs are those required but not produced
        const missingInputs = Array.from(allRequiredInputs).filter(input => !allProducedOutputs.has(input));

        if (missingInputs.length > 0) {
            // Check if we already have a fake step
            const hasFakeStep = workflowSteps.some(step => step.isFakeStep);

            if (!hasFakeStep) {
                // Create a fake step with missing inputs
                const fakeStep: WorkflowStep = {
                    id: 'fake-step',
                    job: {
                        id: 'fake-job',
                        name: 'Initial Inputs',
                        description: 'Upload required input files for the workflow',
                        inputs: [],
                        outputs: missingInputs
                    },
                    position: 0,
                    isFakeStep: true
                };

                setWorkflowSteps(prev => [fakeStep, ...prev.filter(step => !step.isFakeStep).map((step, index) => ({ ...step, position: index + 1 }))]);
            } else {
                // Update existing fake step outputs if they changed
                const currentFakeStep = workflowSteps.find(step => step.isFakeStep);
                if (currentFakeStep && JSON.stringify(currentFakeStep.job.outputs.sort()) !== JSON.stringify(missingInputs.sort())) {
                    setWorkflowSteps(prev => prev.map(step =>
                        step.isFakeStep
                            ? { ...step, job: { ...step.job, outputs: missingInputs } }
                            : step
                    ));
                }
            }
        } else {
            // Remove fake step if no missing inputs
            setWorkflowSteps(prev => prev.filter(step => !step.isFakeStep).map((step, index) => ({ ...step, position: index })));
        }
    }, [workflowSteps]);

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
            const newStep: WorkflowStep = {
                id: `step-${Date.now()}`,
                job: draggedJob,
                position: workflowSteps.length
            };
            setWorkflowSteps(prev => [...prev, newStep]);
        }
        setDraggedJob(null);
    }, [draggedJob, workflowSteps.length]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeStep = (stepId: string) => {
        setWorkflowSteps(prev => prev.filter(step => step.id !== stepId && !step.isFakeStep).map((step, index) => ({ ...step, position: index })));
    };

    const moveStep = (stepId: string, direction: 'up' | 'down') => {
        setWorkflowSteps(prev => {
            const currentIndex = prev.findIndex(step => step.id === stepId);
            if (currentIndex === -1) return prev;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newSteps = [...prev];
            [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];

            return newSteps.map((step, index) => ({
                ...step,
                position: index
            }));
        });
    };

    const getWorkflowConnections = () => {
        const connections: { from: string; to: string; output: string; input: string }[] = [];

        for (let i = 0; i < workflowSteps.length - 1; i++) {
            const currentStep = workflowSteps[i];
            const nextStep = workflowSteps[i + 1];

            // Find matching outputs and inputs
            currentStep.job.outputs.forEach(output => {
                if (nextStep.job.inputs.includes(output)) { // ATTENTION: checking only next step inputs
                    connections.push({
                        from: currentStep.id,
                        to: nextStep.id,
                        output,
                        input: output
                    });
                }
            });
        }

        return connections;
    };

    const validateWorkflow = () => {
        const issues: string[] = [];
        const realSteps = workflowSteps.filter(step => !step.isFakeStep);

        if (realSteps.length === 0) {
            issues.push('Workflow is empty');
            return issues;
        }

        // Check if fake step has all required inputs selected
        const fakeStep = workflowSteps.find(step => step.isFakeStep);
        if (fakeStep) {
            const missingSelections = fakeStep.job.outputs.filter(output => !fakeStepInputs[output]);
            if (missingSelections.length > 0) {
                issues.push(`Please select files for: ${missingSelections.join(', ')}`);
            }
        }

        // Check connections between real steps
        for (let i = 1; i < realSteps.length; i++) {
            const prevStep = realSteps[i - 1];
            const currentStep = realSteps[i];

            const hasMatchingInputs = currentStep.job.inputs.some(input =>
                prevStep.job.outputs.includes(input)
            );

            if (!hasMatchingInputs) {
                const realStepIndex = workflowSteps.findIndex(step => step.id === currentStep.id);
                issues.push(`Step ${realStepIndex + 1} (${currentStep.job.name}) has no matching inputs from previous step`);
            }
        }

        return issues;
    };

    const exportWorkflow = () => {
        const workflow = {
            name: workflowName || 'Untitled Workflow',
            steps: workflowSteps,
            connections: getWorkflowConnections(),
            initialInputs: fakeStepInputs,
            createdAt: new Date().toISOString()
        };

        console.log('Workflow exported:', workflow);
        // You can add actual export functionality here
        alert('Workflow exported to console');
    };

    const validationIssues = validateWorkflow();

    const [show3D, setShow3D] = useState(false);

    return (
        <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col">
            <WorkflowHeader
                workflowName={workflowName}
                setWorkflowName={setWorkflowName}
                onExport={exportWorkflow}
                onView3D={() => setShow3D(true)}
                validationIssues={validationIssues}
            />

            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                <AvailableJobsPanel
                    jobs={availableJobs}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />

                <WorkflowStepsPanel
                    workflowSteps={workflowSteps}
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
                            style={{ maxWidth: '100vw', maxHeight: '100vh' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
