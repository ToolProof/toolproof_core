interface WorkflowHeaderProps {
    workflowName: string;
    setWorkflowName: (name: string) => void;
    onExport: () => void;
    validationIssues: string[];
}

export default function WorkflowHeader({ 
    workflowName, 
    setWorkflowName, 
    onExport, 
    validationIssues 
}: WorkflowHeaderProps) {
    return (
        <div className="mb-8 flex-shrink-0">
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
                    onClick={onExport}
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
    );
}
