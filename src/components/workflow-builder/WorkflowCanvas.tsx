import React, { useRef, useCallback } from 'react';
import { Job, Workflow, WorkflowStep } from 'updohilo/dist/types/typesWF';
import StepNode from './StepNode';
import ConnectionLines from './ConnectionLines';

interface WorkflowCanvasProps {
    workflow: Workflow;
    selectedStep: WorkflowStep | null;
    onStepClick: (step: WorkflowStep) => void;
    onCanvasClick: () => void;
    onDeleteStep: (step: WorkflowStep) => void;
    onAddJob: (job: Job, position?: { x: number; y: number }) => void;
    draggedJob: Job | null;
    onDragEnd: () => void;
    availableJobs: Job[];
}

export default function WorkflowCanvas({
    workflow,
    selectedStep,
    onStepClick,
    onCanvasClick,
    onDeleteStep,
    onAddJob,
    draggedJob,
    onDragEnd,
    availableJobs
}: WorkflowCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCanvasClick();
        }
    }, [onCanvasClick]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (draggedJob && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            onAddJob(draggedJob, position);
        }
        onDragEnd();
    }, [draggedJob, onAddJob, onDragEnd]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const renderStep = (step: WorkflowStep, index: number) => {
        const baseY = 100 + index * 200;
        const baseX = 50;

        return (
            <StepNode
                key={`${step.id}-${index}`}
                step={step}
                position={{ x: baseX, y: baseY }}
                isSelected={selectedStep === step}
                onClick={() => onStepClick(step)}
                onDelete={() => onDeleteStep(step)}
                availableJobs={availableJobs}
            />
        );
    };

    return (
        <div
            ref={canvasRef}
            className="h-full w-full bg-gray-100 relative overflow-auto"
            onClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {/* Grid background */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Connection lines */}
            <ConnectionLines workflow={workflow} />

            {/* Steps */}
            {workflow.steps.map((step, index) => renderStep(step, index))}

            {/* Empty state */}
            {workflow.steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">⚡</div>
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                            Start Building Your Workflow
                        </h3>
                        <p className="text-gray-400">
                            Drag jobs from the library or use the toolbar to add workflow steps
                        </p>
                    </div>
                </div>
            )}

            {/* Drop indicator */}
            {draggedJob && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 flex items-center justify-center">
                    <div className="text-blue-600 font-medium">
                        Drop to add &quot;{draggedJob.name}&quot; step
                    </div>
                </div>
            )}
        </div>
    );
}
