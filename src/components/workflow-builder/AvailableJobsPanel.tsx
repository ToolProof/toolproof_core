import { Job } from 'updohilo/dist/types/typesWF';

interface AvailableJobsPanelProps {
    jobs: Job[];
    onDragStart: (job: Job) => void;
    onDragEnd: () => void;
}

export default function AvailableJobsPanel({ jobs, onDragStart, onDragEnd }: AvailableJobsPanelProps) {
    return (
        <div className="lg:col-span-1 flex flex-col min-h-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex-shrink-0">Available Jobs</h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 min-h-0">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        draggable
                        onDragStart={() => onDragStart(job)}
                        onDragEnd={onDragEnd}
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
    );
}
