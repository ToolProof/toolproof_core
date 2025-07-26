import { Job } from 'updohilo/dist/types/typesWF';

interface RegularStepComponentProps {
    job: Job;
    stepNumber: number;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}

export default function RegularStepComponent({ 
    job, 
    stepNumber, 
    canMoveUp, 
    canMoveDown, 
    onMoveUp, 
    onMoveDown, 
    onRemove 
}: RegularStepComponentProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {stepNumber}
                    </span>
                    <div>
                        <h3 className="font-medium text-gray-900">{job.name}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canMoveUp && (
                        <button
                            onClick={onMoveUp}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move up"
                        >
                            ↑
                        </button>
                    )}
                    {canMoveDown && (
                        <button
                            onClick={onMoveDown}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move down"
                        >
                            ↓
                        </button>
                    )}
                    <button
                        onClick={onRemove}
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
    );
}
