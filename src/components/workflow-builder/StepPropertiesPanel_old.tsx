import React, { useState, useEffect } from 'react';
import { Job, Workflow, WorkflowStep } from 'updohilo/dist/types/typesWF';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

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
                sourceOutput: '',
                targetJobId: localStep.step.jobId,
                targetInput: ''
            };
            setLocalStep({
                ...localStep,
                step: {
                    ...localStep.step,
                    dataExchanges: [...localStep.step.dataExchanges, newExchange]
                }
            });
        };

        const removeDataExchange = (index: number) => {
            const newExchanges = localStep.step.dataExchanges.filter((_, i) => i !== index);
            setLocalStep({
                ...localStep,
                step: {
                    ...localStep.step,
                    dataExchanges: newExchanges
                }
            });
        };

        const updateResultBinding = (outputRole: string, alias: string) => {
            const newBindings = { ...localStep.step.resultBindings };
            if (alias) {
                newBindings[outputRole] = alias;
            } else {
                delete newBindings[outputRole];
            }
            setLocalStep({
                ...localStep,
                step: {
                    ...localStep.step,
                    resultBindings: newBindings
                }
            });
        };

        // Get available source jobs and their outputs
        const availableSourceJobs = workflow.steps
            .filter(s => s.type === 'simple' && s.step.id !== localStep.step.id)
            .map(s => s.type === 'simple' ? s.step : null)
            .filter(Boolean);

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{job.name}</h3>
                    <p className="text-sm text-gray-600">{job.semanticSpec.description}</p>
                </div>

                {/* Data Exchanges */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-800">Input Connections</h4>
                        <button
                            onClick={addDataExchange}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {localStep.step.dataExchanges.map((exchange, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3 mb-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Source Job
                                    </label>
                                    <select
                                        value={exchange.sourceJobId}
                                        onChange={(e) => updateDataExchange(index, 'sourceJobId', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="">Select source...</option>
                                        <option value="start_job">start_job (Initial inputs)</option>
                                        {availableSourceJobs.map(sourceStep => {
                                            const sourceJob = availableJobs.find(j => j.id === sourceStep?.jobId);
                                            return sourceJob ? (
                                                <option key={sourceStep?.id} value={sourceJob.id}>
                                                    {sourceJob.name}
                                                </option>
                                            ) : null;
                                        })}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Source Output
                                    </label>
                                    <input
                                        type="text"
                                        value={exchange.sourceOutput}
                                        onChange={(e) => updateDataExchange(index, 'sourceOutput', e.target.value)}
                                        placeholder="Output name..."
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Target Input
                                    </label>
                                    <select
                                        value={exchange.targetInput}
                                        onChange={(e) => updateDataExchange(index, 'targetInput', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="">Select input...</option>
                                        {job.syntacticSpec.inputs.map(input => (
                                            <option key={input.role.id} value={input.role.name}>
                                                {input.role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-end">
                                    <button
                                        onClick={() => removeDataExchange(index)}
                                        className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {localStep.step.dataExchanges.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                            No input connections configured
                        </div>
                    )}
                </div>

                {/* Result Bindings */}
                <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Output Aliases</h4>
                    
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
                                    value={localStep.step.resultBindings[output.role.name] || ''}
                                    onChange={(e) => updateResultBinding(output.role.name, e.target.value)}
                                    placeholder="Alias for this output..."
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
            </div>
        );
    };

    const renderParallelStepProperties = () => null; // Removed for new type system
    const renderConditionalStepProperties = () => null; // Removed for new type system

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
