import React from 'react';
import { Job } from 'updohilo/dist/types/typesWF';
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/react/24/outline';

interface JobLibraryProps {
    jobs: Job[];
    onJobSelect: (job: Job) => void;
    draggedJob: Job | null;
    onDragStart: (job: Job) => void;
    onDragEnd: () => void;
}

export default function JobLibrary({
    jobs,
    onJobSelect,
    draggedJob,
    onDragStart,
    onDragEnd
}: JobLibraryProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    
    const filteredJobs = jobs.filter(job =>
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.semanticSpec.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, job: Job) => {
        onDragStart(job);
        e.dataTransfer.setData('application/json', JSON.stringify(job));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Library</h2>
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredJobs.map((job) => (
                    <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job)}
                        onDragEnd={onDragEnd}
                        onClick={() => onJobSelect(job)}
                        className={`p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${
                            draggedJob?.id === job.id ? 'opacity-50' : ''
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            <CubeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {job.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {job.semanticSpec.description}
                                </p>
                                
                                <div className="mt-2 space-y-1">
                                    <div className="text-xs">
                                        <span className="text-gray-500">Inputs:</span>
                                        <span className="ml-1 text-gray-700">
                                            {job.syntacticSpec.inputs.map(input => input.role.name).join(', ') || 'None'}
                                        </span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-gray-500">Outputs:</span>
                                        <span className="ml-1 text-gray-700">
                                            {job.syntacticSpec.outputs.map(output => output.role.name).join(', ') || 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <CubeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No jobs found</p>
                        {searchTerm && (
                            <p className="text-sm mt-1">Try adjusting your search</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
