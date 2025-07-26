import React from 'react';
import { Job, WorkflowStepUnion } from 'updohilo/dist/types/typesWF';
import { TrashIcon, CubeIcon } from '@heroicons/react/24/outline';

interface StepNodeProps {
    step: WorkflowStepUnion;
    position: { x: number; y: number };
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
    availableJobs: Job[];
}

export default function StepNode({
    step,
    position,
    isSelected,
    onClick,
    onDelete,
    availableJobs
}: StepNodeProps) {
    if (step.type !== 'simple') {
        return null; // This component only handles simple steps
    }

    const job = availableJobs.find(j => j.id === step.step.jobId);
    
    if (!job) {
        return (
            <div
                className="absolute bg-red-100 border-2 border-red-300 rounded-lg p-3 cursor-pointer"
                style={{ left: position.x, top: position.y, width: 200 }}
                onClick={onClick}
            >
                <div className="text-red-700 text-sm font-medium">
                    Job not found: {step.step.jobId}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`absolute bg-white border-2 rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
            }`}
            style={{ left: position.x, top: position.y, width: 220 }}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <CubeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {job.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {job.semanticSpec.description}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Inputs */}
            <div className="mt-3 space-y-1">
                <div className="text-xs font-medium text-gray-700">Inputs:</div>
                {job.syntacticSpec.inputs.length > 0 ? (
                    job.syntacticSpec.inputs.map((input, index) => (
                        <div key={index} className="text-xs text-gray-600 pl-2">
                            • {input.role.name} ({input.type.name})
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-gray-400 pl-2 italic">None</div>
                )}
            </div>

            {/* Outputs */}
            <div className="mt-2 space-y-1">
                <div className="text-xs font-medium text-gray-700">Outputs:</div>
                {job.syntacticSpec.outputs.length > 0 ? (
                    job.syntacticSpec.outputs.map((output, index) => (
                        <div key={index} className="text-xs text-gray-600 pl-2">
                            • {output.role.name} ({output.type.name})
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-gray-400 pl-2 italic">None</div>
                )}
            </div>

            {/* Data Exchanges indicator */}
            {step.step.dataExchanges.length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                    ✓ {step.step.dataExchanges.length} connection(s)
                </div>
            )}

            {/* Result Bindings indicator */}
            {Object.keys(step.step.resultBindings).length > 0 && (
                <div className="mt-1 text-xs text-blue-600">
                    → {Object.keys(step.step.resultBindings).length} output binding(s)
                </div>
            )}
        </div>
    );
}
