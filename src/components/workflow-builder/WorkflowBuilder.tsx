'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Job, Workflow, WorkflowStepUnion, SimpleWorkflowStep } from 'updohilo/dist/types/typesWF';
import { numericalJobs } from 'updohilo/dist/mocks/mocks';
import { validateWorkflow } from 'updohilo/dist/utils';
import WorkflowCanvas from './WorkflowCanvas';
import JobLibrary from './JobLibrary';
import StepPropertiesPanel from './StepPropertiesPanel';
import WorkflowToolbar from './WorkflowToolbar';
import WorkflowVisualizer from '@/xr/worlds/workflowVisualizer/WorkflowVisualizer';
import { v4 as uuidv4 } from 'uuid';

interface ValidationResult {
    isValid: boolean;
    initialInputs: string[];
}

export default function WorkflowBuilder() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [workflow, setWorkflow] = useState<Workflow>({
        id: uuidv4(),
        steps: []
    });
    
    const [selectedStep, setSelectedStep] = useState<WorkflowStepUnion | null>(null);
    const [availableJobs] = useState<Job[]>(Array.from(numericalJobs.values()));
    const [draggedJob, setDraggedJob] = useState<Job | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [workflowName, setWorkflowName] = useState('Untitled Workflow');
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
    const [show3D, setShow3D] = useState(false);

    // Validate workflow whenever it changes
    useEffect(() => {
        if (workflow.steps.length > 0) {
            const result = validateWorkflow(availableJobs, workflow);
            setValidationResult(result);
        } else {
            setValidationResult(null);
        }
    }, [workflow, availableJobs]);

    // 3D Visualization effect
    useEffect(() => {
        let workflowVisualizer: WorkflowVisualizer | null = null;

        const asyncWrapper = async () => {
            // Only initialize when the 3D overlay is shown and container is available
            if (!show3D || !containerRef.current || workflow.steps.length === 0) return;

            workflowVisualizer = new WorkflowVisualizer(containerRef.current, workflow, availableJobs);
            await workflowVisualizer.init();
        }

        asyncWrapper();

        // Cleanup on unmount or when overlay closes
        return () => {
            if (workflowVisualizer) {
                workflowVisualizer.cleanup();
            }
        };

    }, [workflow, show3D, availableJobs]);

    const handleAddSimpleStep = useCallback((job: Job, position?: { x: number; y: number }) => {
        const newStep: SimpleWorkflowStep = {
            type: 'simple',
            step: {
                id: uuidv4(),
                jobId: job.id,
                dataExchanges: [],
                resultBindings: {}
            }
        };

        setWorkflow(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));

        setSelectedStep(newStep);
        setShowPropertiesPanel(true);
    }, []);

    const handleAddParallelStep = useCallback(() => {
        const newStep: WorkflowStepUnion = {
            type: 'parallel',
            branches: [[], []] // Start with two empty branches
        };

        setWorkflow(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));

        setSelectedStep(newStep);
    }, []);

    const handleAddConditionalStep = useCallback(() => {
        const newStep: WorkflowStepUnion = {
            type: 'conditional',
            branches: [{
                condition: { op: 'always' },
                steps: []
            }]
        };

        setWorkflow(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));

        setSelectedStep(newStep);
    }, []);

    const handleUpdateStep = useCallback((updatedStep: WorkflowStepUnion) => {
        setWorkflow(prev => ({
            ...prev,
            steps: prev.steps.map(step => 
                step === selectedStep ? updatedStep : step
            )
        }));
        setSelectedStep(updatedStep);
    }, [selectedStep]);

    const handleDeleteStep = useCallback((stepToDelete: WorkflowStepUnion) => {
        setWorkflow(prev => ({
            ...prev,
            steps: prev.steps.filter(step => step !== stepToDelete)
        }));
        
        if (selectedStep === stepToDelete) {
            setSelectedStep(null);
            setShowPropertiesPanel(false);
        }
    }, [selectedStep]);

    const handleStepClick = useCallback((step: WorkflowStepUnion) => {
        setSelectedStep(step);
        setShowPropertiesPanel(true);
    }, []);

    const handleCanvasClick = useCallback(() => {
        setSelectedStep(null);
        setShowPropertiesPanel(false);
    }, []);

    const handleExportWorkflow = useCallback(() => {
        const exportData = {
            workflow,
            name: workflowName,
            createdAt: new Date().toISOString(),
            validation: validationResult
        };
        
        console.log('Exported Workflow:', exportData);
        
        // Create downloadable JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${workflowName.replace(/\s+/g, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }, [workflow, workflowName, validationResult]);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Toolbar */}
            <WorkflowToolbar
                workflowName={workflowName}
                onWorkflowNameChange={setWorkflowName}
                onAddParallel={handleAddParallelStep}
                onAddConditional={handleAddConditionalStep}
                onExport={handleExportWorkflow}
                onView3D={() => setShow3D(!show3D)}
                validationResult={validationResult}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Job Library Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <JobLibrary
                        jobs={availableJobs}
                        onJobSelect={handleAddSimpleStep}
                        draggedJob={draggedJob}
                        onDragStart={setDraggedJob}
                        onDragEnd={() => setDraggedJob(null)}
                    />
                </div>

                {/* Main Canvas */}
                <div className="flex-1 relative">
                    <WorkflowCanvas
                        workflow={workflow}
                        selectedStep={selectedStep}
                        onStepClick={handleStepClick}
                        onCanvasClick={handleCanvasClick}
                        onDeleteStep={handleDeleteStep}
                        onAddJob={handleAddSimpleStep}
                        draggedJob={draggedJob}
                        onDragEnd={() => setDraggedJob(null)}
                        availableJobs={availableJobs}
                    />
                </div>

                {/* Properties Panel */}
                {showPropertiesPanel && selectedStep && (
                    <div className="w-96 bg-white border-l border-gray-200">
                        <StepPropertiesPanel
                            step={selectedStep}
                            availableJobs={availableJobs}
                            workflow={workflow}
                            onUpdateStep={handleUpdateStep}
                            onClose={() => setShowPropertiesPanel(false)}
                        />
                    </div>
                )}
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
