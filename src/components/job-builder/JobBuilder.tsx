
'use client';

export default function JobBuilder() {
    const handleCreateJob = () => {
        // TODO: Implement create job functionality
        console.log('Create Job clicked');
    };

    const handleRegisterJob = () => {
        // TODO: Implement register job functionality
        console.log('Register Job clicked');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Builder</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Job Section */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                            🔧 Create Job
                        </h2>
                        <p className="text-sm text-blue-700 italic mb-4">
                            &ldquo;Fork a ToolProof template on GitHub to start a new job.&rdquo;
                        </p>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            This step lets you create a new ToolProof-compatible job by forking one of our 
                            official GitHub job template repositories. You&rsquo;ll choose your preferred language or 
                            environment, and GitHub will create a new repository under your account with the 
                            necessary file structure and metadata. You can then develop your job in that repo 
                            at your own pace.
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleCreateJob}
                            title="Fork a ToolProof template on GitHub to start a new job."
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium w-full sm:w-auto"
                        >
                            Create Job
                        </button>
                    </div>
                </div>

                {/* Register Job Section */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-green-900 mb-2">
                            📝 Register Job
                        </h2>
                        <p className="text-sm text-green-700 italic mb-4">
                            &ldquo;Create a GitHub pull request to submit your job for review.&rdquo;
                        </p>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            When your job is ready, this step lets you submit it to the ToolProof job registry 
                            by creating a GitHub pull request. You&rsquo;ll fill in metadata and link to your 
                            repository. ToolProof will then review your submission. If accepted, your 
                            repository will be transferred into the ToolProof GitHub organization, and the 
                            job will become part of the official ecosystem.
                        </p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleRegisterJob}
                            title="Create a GitHub pull request to submit your job for review."
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium w-full sm:w-auto"
                        >
                            Register Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
