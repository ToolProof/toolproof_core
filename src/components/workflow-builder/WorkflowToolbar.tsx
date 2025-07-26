import React from 'react';
import { PlusIcon, PlayIcon, DocumentArrowDownIcon, CubeIcon } from '@heroicons/react/24/outline';

interface ValidationResult {
    isValid: boolean;
    initialInputs: string[];
}

interface WorkflowToolbarProps {
    workflowName: string;
    onWorkflowNameChange: (name: string) => void;
    onAddParallel: () => void;
    onAddConditional: () => void;
    onExport: () => void;
    onView3D?: () => void;
    validationResult: ValidationResult | null;
}

export default function WorkflowToolbar({
    workflowName,
    onWorkflowNameChange,
    onAddParallel,
    onAddConditional,
    onExport,
    onView3D,
    validationResult
}: WorkflowToolbarProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => onWorkflowNameChange(e.target.value)}
                        className="text-xl font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                        placeholder="Workflow Name"
                    />
                    
                    {validationResult && (
                        <div className={`px-3 py-1 rounded-full text-sm ${
                            validationResult.isValid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {validationResult.isValid ? '✓ Valid' : '⚠ Invalid'}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={onAddParallel}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Parallel</span>
                    </button>

                    <button
                        onClick={onAddConditional}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Conditional</span>
                    </button>

                    {onView3D && (
                        <button
                            onClick={onView3D}
                            className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <CubeIcon className="w-4 h-4" />
                            <span>3D View</span>
                        </button>
                    )}

                    <button
                        onClick={onExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        disabled={!validationResult?.isValid}
                    >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {validationResult && !validationResult.isValid && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                        Please fix validation issues before exporting.
                    </p>
                    {validationResult.initialInputs.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                            Required initial inputs: {validationResult.initialInputs.join(', ')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
