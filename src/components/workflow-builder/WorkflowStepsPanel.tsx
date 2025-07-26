import FakeStepComponent from './FakeStepComponent';
import RegularStepComponent from './RegularStepComponent';
import { Job } from 'updohilo/dist/types/typesWF';

interface WorkflowNodesPanelProps {
    workflowNodes: WorkflowNode[];
    fakeStepInputs: FakeStepInputs;
    availableFiles: Record<string, string[]>;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onFakeStepInputChange: (inputName: string, fileName: string) => void;
    onMoveStep: (stepId: string, direction: 'up' | 'down') => void;
    onRemoveStep: (stepId: string) => void;
}

export default function WorkflowNodesPanel({
    workflowNodes,
    fakeStepInputs,
    availableFiles,
    onDrop,
    onDragOver,
    onFakeStepInputChange,
    onMoveStep,
    onRemoveStep
}: WorkflowNodesPanelProps) {
    return (
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex-shrink-0">Workflow Steps</h2>
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 overflow-y-auto flex-1 min-h-0"
            >
                {workflowNodes.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <p className="text-lg mb-2">Drop jobs here to build your workflow</p>
                        <p className="text-sm">Drag jobs from the left panel to create a sequence</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflowNodes.map((step, index) => (
                            <div key={step.job.id} className="relative">
                                {step.isFakeStep ? (
                                    <FakeStepComponent
                                        job={step.job}
                                        fakeStepInputs={fakeStepInputs}
                                        onInputChange={onFakeStepInputChange}
                                        availableFiles={availableFiles}
                                    />
                                ) : (
                                    <RegularStepComponent
                                        job={step.job}
                                        stepNumber={index + 1}
                                        canMoveUp={index > 1}
                                        canMoveDown={index < workflowNodes.length - 1}
                                        onMoveUp={() => onMoveStep(step.job.id, 'up')}
                                        onMoveDown={() => onMoveStep(step.job.id, 'down')}
                                        onRemove={() => onRemoveStep(step.job.id)}
                                    />
                                )}

                                {/* Connection arrow */}
                                {index < workflowNodes.length - 1 && (
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
    );
}
