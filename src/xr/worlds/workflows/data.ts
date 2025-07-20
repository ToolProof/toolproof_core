import { mockJobs } from '@/components/workflow-builder/mockJobs';
import { Job, WorkflowNode } from '@/components/workflow-builder/types';

export type { Job, WorkflowNode };

export const getData = () => {

    return mockJobs;
}
