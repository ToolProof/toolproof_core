import React, { useRef, useCallback } from 'react';
import { Job, Workflow, WorkflowStepUnion } from 'updohilo/dist/types/typesWF';
import StepNode from './StepNode';
import ConnectionLines from './ConnectionLines';

interface WorkflowCanvasProps {
    workflow: Workflow;
    selectedStep: WorkflowStepUnion | null;
    onStepClick: (step: WorkflowStepUnion) => void;
    onCanvasClick: () => void;
    onDeleteStep: (step: WorkflowStepUnion) => void;
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

    const renderStep = (step: WorkflowStepUnion, index: number, depth: number = 0) => {
        const baseY = 100 + index * 200;
        const baseX = 50 + depth * 300;

        switch (step.type) {
            case 'simple':
                return (
                    <StepNode
                        key={`${step.step.id}-${index}`}
                        step={step}
                        position={{ x: baseX, y: baseY }}
                        isSelected={selectedStep === step}
                        onClick={() => onStepClick(step)}
                        onDelete={() => onDeleteStep(step)}
                        availableJobs={availableJobs}
                    />
                );

            case 'parallel':
                return (
                    <div key={`parallel-${index}`} className="relative">
                        <div
                            className={`absolute border-2 border-dashed rounded-lg p-4 ${
                                selectedStep === step ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            style={{
                                left: baseX,
                                top: baseY,
                                width: 280 * step.branches.length,
                                minHeight: 150
                            }}
                            onClick={() => onStepClick(step)}
                        >
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                                Parallel Execution
                            </div>
                            <div className="flex space-x-4">
                                {step.branches.map((branch, branchIndex) => (
                                    <div
                                        key={branchIndex}
                                        className="border border-gray-200 rounded p-2 bg-white min-w-[250px]"
                                    >
                                        <div className="text-xs text-gray-500 mb-2">
                                            Branch {branchIndex + 1}
                                        </div>
                                        {branch.map((branchStep, stepIndex) => 
                                            renderStep(branchStep, stepIndex, depth + 1)
                                        )}
                                        {branch.length === 0 && (
                                            <div className="text-xs text-gray-400 italic">
                                                Empty branch
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'conditional':
                return (
                    <div key={`conditional-${index}`} className="relative">
                        <div
                            className={`absolute border-2 border-dashed rounded-lg p-4 ${
                                selectedStep === step ? 'border-purple-500 bg-purple-50' : 'border-purple-300 bg-purple-50'
                            }`}
                            style={{
                                left: baseX,
                                top: baseY,
                                width: 300,
                                minHeight: 150
                            }}
                            onClick={() => onStepClick(step)}
                        >
                            <div className="text-sm font-semibold text-purple-700 mb-2">
                                Conditional Step
                            </div>
                            {step.branches.map((branch, branchIndex) => (
                                <div key={branchIndex} className="border border-purple-200 rounded p-2 bg-white mb-2">
                                    <div className="text-xs text-purple-600 mb-1">
                                        Condition: {branch.condition.op}
                                    </div>
                                    {branch.steps.map((condStep, stepIndex) =>
                                        renderStep(condStep, stepIndex, depth + 1)
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'while':
                return (
                    <div key={`while-${index}`} className="relative">
                        <div
                            className={`absolute border-2 border-dashed rounded-lg p-4 ${
                                selectedStep === step ? 'border-orange-500 bg-orange-50' : 'border-orange-300 bg-orange-50'
                            }`}
                            style={{
                                left: baseX,
                                top: baseY,
                                width: 300,
                                minHeight: 150
                            }}
                            onClick={() => onStepClick(step)}
                        >
                            <div className="text-sm font-semibold text-orange-700 mb-2">
                                While Loop
                            </div>
                            <div className="text-xs text-orange-600 mb-2">
                                Condition: {step.condition}
                            </div>
                            <div className="border border-orange-200 rounded p-2 bg-white">
                                {step.body.map((bodyStep, stepIndex) =>
                                    renderStep(bodyStep, stepIndex, depth + 1)
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'for':
                return (
                    <div key={`for-${index}`} className="relative">
                        <div
                            className={`absolute border-2 border-dashed rounded-lg p-4 ${
                                selectedStep === step ? 'border-green-500 bg-green-50' : 'border-green-300 bg-green-50'
                            }`}
                            style={{
                                left: baseX,
                                top: baseY,
                                width: 300,
                                minHeight: 150
                            }}
                            onClick={() => onStepClick(step)}
                        >
                            <div className="text-sm font-semibold text-green-700 mb-2">
                                For Loop
                            </div>
                            <div className="text-xs text-green-600 mb-2">
                                Iterations: {step.iterations}
                            </div>
                            <div className="border border-green-200 rounded p-2 bg-white">
                                {step.body.map((bodyStep, stepIndex) =>
                                    renderStep(bodyStep, stepIndex, depth + 1)
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
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
