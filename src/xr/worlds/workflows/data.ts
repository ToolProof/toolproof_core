import { mockJobs } from '@/components/workflow-builder/mockJobs';
import { Job, WorkflowStep } from '@/components/workflow-builder/types';

export type { Job, WorkflowStep };

export const getData = () => {

    return mockJobs;
}
