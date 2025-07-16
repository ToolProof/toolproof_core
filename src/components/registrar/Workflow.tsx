'use client';

import React, { useState, useCallback } from 'react';
import { _twoObjects as availableJobs } from '@/xr/worlds/toolproof/data';

interface Job { // ATTENTION: duplicated
    id: string;
    name: string;
    description: string;
    inputs: string[];
    outputs: string[];
}

interface WorkflowStep {
    id: string;
    job: Job;
    position: number;
}

export default function Workflow() {
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [draggedJob, setDraggedJob] = useState<Job | null>(null);
    const [workflowName, setWorkflowName] = useState('');

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
        setWorkflowSteps(prev => prev.filter(step => step.id !== stepId));
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
        
        if (workflowSteps.length === 0) {
            issues.push('Workflow is empty');
        }
        
        for (let i = 1; i < workflowSteps.length; i++) {
            const prevStep = workflowSteps[i - 1];
            const currentStep = workflowSteps[i];
            
            const hasMatchingInputs = currentStep.job.inputs.some(input =>
                prevStep.job.outputs.includes(input)
            );
            
            if (!hasMatchingInputs) {
                issues.push(`Step ${i + 1} (${currentStep.job.name}) has no matching inputs from previous step`);
            }
        }
        
        return issues;
    };

    const exportWorkflow = () => {
        const workflow = {
            name: workflowName || 'Untitled Workflow',
            steps: workflowSteps,
            connections: getWorkflowConnections(),
            createdAt: new Date().toISOString()
        };
        
        console.log('Workflow exported:', workflow);
        // You can add actual export functionality here
        alert('Workflow exported to console');
    };

    const validationIssues = validateWorkflow();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Workflow Builder</h1>
                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Enter workflow name..."
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={exportWorkflow}
                        disabled={validationIssues.length > 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Export Workflow
                    </button>
                </div>
                
                {validationIssues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <h3 className="text-red-800 font-medium mb-2">Validation Issues:</h3>
                        <ul className="text-red-700 text-sm list-disc list-inside">
                            {validationIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Jobs Panel */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Jobs</h2>
                    <div className="space-y-3">
                        {availableJobs.map((job) => (
                            <div
                                key={job.id}
                                draggable
                                onDragStart={() => handleDragStart(job)}
                                onDragEnd={handleDragEnd}
                                className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                            >
                                <h3 className="font-medium text-gray-900 mb-2">{job.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="font-medium text-green-700">Inputs:</span>
                                        <div className="mt-1">
                                            {job.inputs.map((input) => (
                                                <span key={input} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">
                                                    {input}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700">Outputs:</span>
                                        <div className="mt-1">
                                            {job.outputs.map((output) => (
                                                <span key={output} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                                                    {output}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Builder Panel */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Steps</h2>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="min-h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6"
                    >
                        {workflowSteps.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <p className="text-lg mb-2">Drop jobs here to build your workflow</p>
                                <p className="text-sm">Drag jobs from the left panel to create a sequence</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {workflowSteps.map((step, index) => (
                                    <div key={step.id} className="relative">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{step.job.name}</h3>
                                                        <p className="text-sm text-gray-600">{step.job.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {index > 0 && (
                                                        <button
                                                            onClick={() => moveStep(step.id, 'up')}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                            title="Move up"
                                                        >
                                                            ↑
                                                        </button>
                                                    )}
                                                    {index < workflowSteps.length - 1 && (
                                                        <button
                                                            onClick={() => moveStep(step.id, 'down')}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                            title="Move down"
                                                        >
                                                            ↓
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeStep(step.id)}
                                                        className="p-1 text-red-400 hover:text-red-600"
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="font-medium text-green-700">Inputs:</span>
                                                    <div className="mt-1">
                                                        {step.job.inputs.map((input) => (
                                                            <span key={input} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">
                                                                {input}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-blue-700">Outputs:</span>
                                                    <div className="mt-1">
                                                        {step.job.outputs.map((output) => (
                                                            <span key={output} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                                                                {output}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Connection arrow */}
                                        {index < workflowSteps.length - 1 && (
                                            <div className="flex justify-center py-2">
                                                <div className="text-gray-400">↓</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
