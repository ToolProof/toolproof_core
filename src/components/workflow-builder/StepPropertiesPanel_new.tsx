import React, { useState, useEffect } from 'react';
import { Job, Workflow, WorkflowStep } from 'updohilo/dist/types/typesWF';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface StepPropertiesPanelProps {
    step: WorkflowStep;
    availableJobs: Job[];
    workflow: Workflow;
    onUpdateStep: (step: WorkflowStep) => void;
    onClose: () => void;
}

export default function StepPropertiesPanel({
    step,
    availableJobs,
    workflow,
    onUpdateStep,
    onClose
}: StepPropertiesPanelProps) {
    const [localStep, setLocalStep] = useState<WorkflowStep>(step);

    useEffect(() => {
        setLocalStep(step);
    }, [step]);

    const handleSave = () => {
        onUpdateStep(localStep);
    };

    const renderStepProperties = () => {
        const job = availableJobs.find(j => j.id === localStep.jobId);
        if (!job) return <div className="text-red-600">Job not found</div>;

        const updateInputBinding = (role: string, binding: string) => {
            const newBindings = { ...localStep.inputBindings };
            if (binding) {
                newBindings[role] = binding;
            } else {
                delete newBindings[role];
            }
            setLocalStep({
                ...localStep,
                inputBindings: newBindings
            });
        };

        const updateOutputBinding = (role: string, binding: string) => {
            const newBindings = { ...localStep.outputBindings };
            if (binding) {
                newBindings[role] = binding;
            } else {
                delete newBindings[role];
            }
            setLocalStep({
                ...localStep,
                outputBindings: newBindings
            });
        };

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{job.name}</h3>
                    <p className="text-sm text-gray-600">{job.semanticSpec.description}</p>
                </div>

                {/* Input Bindings */}
                <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Input Bindings</h4>
                    {job.syntacticSpec.inputs.map(input => (
                        <div key={input.role.id} className="flex items-center space-x-3 mb-2">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700">
                                    {input.role.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {input.type.name}
                                </div>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={localStep.inputBindings[input.role.name] || ''}
                                    onChange={(e) => updateInputBinding(input.role.name, e.target.value)}
                                    placeholder="Resource name or alias..."
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                />
                            </div>
                        </div>
                    ))}
                    {job.syntacticSpec.inputs.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                            This job has no inputs
                        </div>
                    )}
                </div>

                {/* Output Bindings */}
                <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Output Bindings</h4>
                    {job.syntacticSpec.outputs.map(output => (
                        <div key={output.role.id} className="flex items-center space-x-3 mb-2">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700">
                                    {output.role.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {output.type.name}
                                </div>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={localStep.outputBindings[output.role.name] || ''}
                                    onChange={(e) => updateOutputBinding(output.role.name, e.target.value)}
                                    placeholder="Resource name or alias..."
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                />
                            </div>
                        </div>
                    ))}
                    {job.syntacticSpec.outputs.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                            This job produces no outputs
                        </div>
                    )}
                </div>

                {/* Control Flow Options */}
                {(localStep.branchingCondition || localStep.whileLoopCondition || localStep.forLoopIterations) && (
                    <div>
                        <h4 className="text-md font-medium text-gray-800 mb-3">Control Flow</h4>
                        {localStep.branchingCondition && (
                            <div className="text-xs text-gray-600">
                                Branching condition: {localStep.branchingCondition.op}
                            </div>
                        )}
                        {localStep.whileLoopCondition && (
                            <div className="text-xs text-gray-600">
                                While loop condition: {localStep.whileLoopCondition.op}
                            </div>
                        )}
                        {localStep.forLoopIterations && (
                            <div className="text-xs text-gray-600">
                                For loop iterations: {localStep.forLoopIterations}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Step Properties</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {renderStepProperties()}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
