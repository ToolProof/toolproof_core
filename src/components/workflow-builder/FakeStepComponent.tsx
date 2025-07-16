import { Job, FakeStepInputs } from './types';

interface FakeStepComponentProps {
    job: Job;
    fakeStepInputs: FakeStepInputs;
    onInputChange: (inputName: string, fileName: string) => void;
    availableFiles: Record<string, string[]>;
}

export default function FakeStepComponent({ 
    job, 
    fakeStepInputs, 
    onInputChange, 
    availableFiles 
}: FakeStepComponentProps) {
    return (
        <div className="border border-orange-300 bg-orange-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        📁
                    </span>
                    <div>
                        <h3 className="font-medium text-gray-900">{job.name}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="text-sm font-medium text-orange-700 mb-2">
                    Select input files for the workflow:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.outputs.map((output) => (
                        <div key={output} className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                {output}:
                            </label>
                            <select
                                value={fakeStepInputs[output] || ''}
                                onChange={(e) => onInputChange(output, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            >
                                <option value="">Select a file...</option>
                                {(availableFiles[output] || []).map((fileName) => (
                                    <option key={fileName} value={fileName}>
                                        {fileName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-3">
                    <span className="font-medium text-orange-700">Provides:</span>
                    <div className="mt-1">
                        {job.outputs.map((output) => (
                            <span 
                                key={output} 
                                className={`inline-block px-2 py-1 rounded mr-1 mb-1 text-xs ${
                                    fakeStepInputs[output] 
                                        ? 'bg-orange-200 text-orange-800' 
                                        : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                                {output} {fakeStepInputs[output] ? `(${fakeStepInputs[output]})` : '(not selected)'}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
