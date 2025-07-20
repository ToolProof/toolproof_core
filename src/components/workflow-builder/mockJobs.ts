import { Job, WorkflowNode, Workflow, WorkflowEdge } from './types';
import { v4 as uuidv4 } from 'uuid';


export const mockJobs_1: Job[] = [
    {
        id: uuidv4(),
        name: 'job_1',
        description: 'Initial data processing',
        inputs: ['alpha', 'beta'],
        outputs: ['gamma'],
    },
    {
        id: uuidv4(),
        name: 'job_2',
        description: 'Transform gamma data',
        inputs: ['gamma'],
        outputs: ['delta', 'epsilon'],
    },
    {
        id: uuidv4(),
        name: 'job_3',
        description: 'Process delta stream',
        inputs: ['delta'],
        outputs: ['zeta'],
    },
    {
        id: uuidv4(),
        name: 'job_4',
        description: 'Process epsilon stream',
        inputs: ['epsilon'],
        outputs: ['eta', 'theta'],
    },
    {
        id: uuidv4(),
        name: 'job_5',
        description: 'Combine zeta and eta',
        inputs: ['zeta', 'eta'],
        outputs: ['iota'],
    },
    {
        id: uuidv4(),
        name: 'job_6',
        description: 'Transform theta data',
        inputs: ['theta'],
        outputs: ['kappa', 'lambda'],
    },
    {
        id: uuidv4(),
        name: 'job_7',
        description: 'Process iota with kappa',
        inputs: ['iota', 'kappa'],
        outputs: ['mu'],
    },
    {
        id: uuidv4(),
        name: 'job_8',
        description: 'Lambda transformation',
        inputs: ['lambda'],
        outputs: ['nu', 'xi'],
    },
    {
        id: uuidv4(),
        name: 'job_9',
        description: 'Mu analysis',
        inputs: ['mu'],
        outputs: ['omicron'],
    },
    {
        id: uuidv4(),
        name: 'job_10',
        description: 'Nu and xi combination',
        inputs: ['nu', 'xi'],
        outputs: ['pi', 'rho'],
    },
    {
        id: uuidv4(),
        name: 'job_11',
        description: 'Omicron processing',
        inputs: ['omicron'],
        outputs: ['sigma'],
    },
    {
        id: uuidv4(),
        name: 'job_12',
        description: 'Pi enhancement',
        inputs: ['pi'],
        outputs: ['tau'],
    },
    {
        id: uuidv4(),
        name: 'job_13',
        description: 'Rho transformation',
        inputs: ['rho'],
        outputs: ['upsilon'],
    },
    {
        id: uuidv4(),
        name: 'job_14',
        description: 'Sigma and tau merge',
        inputs: ['sigma', 'tau'],
        outputs: ['phi'],
    },
    {
        id: uuidv4(),
        name: 'job_15',
        description: 'Upsilon analysis',
        inputs: ['upsilon'],
        outputs: ['chi'],
    },
    {
        id: uuidv4(),
        name: 'job_16',
        description: 'Phi processing',
        inputs: ['phi'],
        outputs: ['psi'],
    },
    {
        id: uuidv4(),
        name: 'job_17',
        description: 'Chi and psi combination',
        inputs: ['chi', 'psi'],
        outputs: ['omega'],
    },
    {
        id: uuidv4(),
        name: 'job_18',
        description: 'Independent alpha generator',
        inputs: [],
        outputs: ['alpha_prime'],
    },
    {
        id: uuidv4(),
        name: 'job_19',
        description: 'Alpha prime enhancement',
        inputs: ['alpha_prime'],
        outputs: ['beta_prime'],
    },
    {
        id: uuidv4(),
        name: 'job_20',
        description: 'Final omega processing',
        inputs: ['omega', 'beta_prime'],
        outputs: ['final_result'],
    },
]

export const mockJobs_2: Job[] = [
    // Data ingestion layer
    {
        id: uuidv4(),
        name: 'data_collector_A',
        description: 'Collect raw data from source A',
        inputs: [],
        outputs: ['raw_data_a', 'metadata_a'],
    },
    {
        id: uuidv4(),
        name: 'data_collector_B',
        description: 'Collect raw data from source B',
        inputs: [],
        outputs: ['raw_data_b', 'metadata_b'],
    },
    {
        id: uuidv4(),
        name: 'data_collector_C',
        description: 'Collect raw data from source C',
        inputs: [],
        outputs: ['raw_data_c', 'metadata_c'],
    },
    
    // Data preprocessing layer
    {
        id: uuidv4(),
        name: 'preprocessor_A',
        description: 'Clean and preprocess data A',
        inputs: ['raw_data_a', 'metadata_a'],
        outputs: ['clean_data_a', 'quality_score_a'],
    },
    {
        id: uuidv4(),
        name: 'preprocessor_B',
        description: 'Clean and preprocess data B',
        inputs: ['raw_data_b', 'metadata_b'],
        outputs: ['clean_data_b', 'quality_score_b'],
    },
    {
        id: uuidv4(),
        name: 'preprocessor_C',
        description: 'Clean and preprocess data C',
        inputs: ['raw_data_c', 'metadata_c'],
        outputs: ['clean_data_c', 'quality_score_c'],
    },
    
    // Feature extraction layer (creates crossing scenarios)
    {
        id: uuidv4(),
        name: 'feature_extractor_1',
        description: 'Extract features from A and C',
        inputs: ['clean_data_a', 'clean_data_c'],
        outputs: ['features_ac', 'correlation_ac'],
    },
    {
        id: uuidv4(),
        name: 'feature_extractor_2',
        description: 'Extract features from B',
        inputs: ['clean_data_b'],
        outputs: ['features_b', 'variance_b'],
    },
    {
        id: uuidv4(),
        name: 'quality_analyzer',
        description: 'Analyze quality scores from all sources',
        inputs: ['quality_score_a', 'quality_score_b', 'quality_score_c'],
        outputs: ['overall_quality', 'quality_report'],
    },
    
    // Data transformation layer
    {
        id: uuidv4(),
        name: 'normalizer_AC',
        description: 'Normalize AC features',
        inputs: ['features_ac', 'overall_quality'],
        outputs: ['normalized_ac'],
    },
    {
        id: uuidv4(),
        name: 'normalizer_B',
        description: 'Normalize B features',
        inputs: ['features_b', 'variance_b'],
        outputs: ['normalized_b'],
    },
    {
        id: uuidv4(),
        name: 'correlation_processor',
        description: 'Process correlation data',
        inputs: ['correlation_ac', 'quality_report'],
        outputs: ['correlation_matrix', 'significance_scores'],
    },
    
    // Machine learning layer (complex convergence)
    {
        id: uuidv4(),
        name: 'model_trainer_1',
        description: 'Train model on AC data',
        inputs: ['normalized_ac', 'correlation_matrix'],
        outputs: ['model_ac', 'accuracy_ac'],
    },
    {
        id: uuidv4(),
        name: 'model_trainer_2',
        description: 'Train model on B data',
        inputs: ['normalized_b', 'significance_scores'],
        outputs: ['model_b', 'accuracy_b'],
    },
    
    // Ensemble layer (multiple inputs from different levels)
    {
        id: uuidv4(),
        name: 'ensemble_combiner',
        description: 'Combine models into ensemble',
        inputs: ['model_ac', 'model_b', 'accuracy_ac', 'accuracy_b'],
        outputs: ['ensemble_model', 'ensemble_weights'],
    },
    
    // Validation layer
    {
        id: uuidv4(),
        name: 'cross_validator',
        description: 'Perform cross validation',
        inputs: ['ensemble_model', 'normalized_ac', 'normalized_b'],
        outputs: ['cv_scores', 'validation_metrics'],
    },
    
    // Output layer (multiple final outputs)
    {
        id: uuidv4(),
        name: 'performance_reporter',
        description: 'Generate performance report',
        inputs: ['cv_scores', 'ensemble_weights', 'validation_metrics'],
        outputs: ['performance_report', 'confidence_intervals'],
    },
    {
        id: uuidv4(),
        name: 'model_exporter',
        description: 'Export final model',
        inputs: ['ensemble_model', 'performance_report'],
        outputs: ['exported_model', 'model_metadata'],
    },
    
    // Independent monitoring pipeline (creates long-distance connections)
    {
        id: uuidv4(),
        name: 'monitoring_collector',
        description: 'Collect monitoring data',
        inputs: [],
        outputs: ['system_metrics', 'resource_usage'],
    },
    {
        id: uuidv4(),
        name: 'alert_processor',
        description: 'Process alerts from monitoring',
        inputs: ['system_metrics', 'resource_usage'],
        outputs: ['alert_status', 'health_score'],
    },
    {
        id: uuidv4(),
        name: 'final_aggregator',
        description: 'Aggregate all results with monitoring',
        inputs: ['exported_model', 'model_metadata', 'confidence_intervals', 'alert_status', 'health_score'],
        outputs: ['final_output', 'deployment_ready'],
    },
]

export const mockJobs_3: Job[] = [
    // === DATA INGESTION LAYER ===
    {
        id: uuidv4(),
        name: 'web_scraper',
        description: 'Scrape data from web sources',
        inputs: [],
        outputs: ['raw_web_data', 'web_metadata', 'scrape_logs'],
    },
    {
        id: uuidv4(),
        name: 'api_collector',
        description: 'Collect data from REST APIs',
        inputs: [],
        outputs: ['api_data', 'api_headers', 'rate_limits'],
    },
    {
        id: uuidv4(),
        name: 'database_extractor',
        description: 'Extract data from databases',
        inputs: [],
        outputs: ['db_data', 'schema_info', 'query_stats'],
    },
    {
        id: uuidv4(),
        name: 'file_reader',
        description: 'Read data from files',
        inputs: [],
        outputs: ['file_data', 'file_metadata', 'encoding_info'],
    },
    {
        id: uuidv4(),
        name: 'stream_processor',
        description: 'Process real-time data streams',
        inputs: [],
        outputs: ['stream_data', 'stream_metrics', 'latency_info'],
    },

    // === DATA VALIDATION LAYER ===
    {
        id: uuidv4(),
        name: 'web_validator',
        description: 'Validate web scraped data',
        inputs: ['raw_web_data', 'web_metadata'],
        outputs: ['clean_web_data', 'web_quality_score', 'web_errors'],
    },
    {
        id: uuidv4(),
        name: 'api_validator',
        description: 'Validate API data',
        inputs: ['api_data', 'api_headers'],
        outputs: ['clean_api_data', 'api_quality_score', 'api_errors'],
    },
    {
        id: uuidv4(),
        name: 'db_validator',
        description: 'Validate database data',
        inputs: ['db_data', 'schema_info'],
        outputs: ['clean_db_data', 'db_quality_score', 'db_errors'],
    },
    {
        id: uuidv4(),
        name: 'file_validator',
        description: 'Validate file data',
        inputs: ['file_data', 'file_metadata'],
        outputs: ['clean_file_data', 'file_quality_score', 'file_errors'],
    },
    {
        id: uuidv4(),
        name: 'stream_validator',
        description: 'Validate stream data',
        inputs: ['stream_data', 'stream_metrics'],
        outputs: ['clean_stream_data', 'stream_quality_score', 'stream_errors'],
    },

    // === DATA PREPROCESSING LAYER ===
    {
        id: uuidv4(),
        name: 'text_preprocessor',
        description: 'Preprocess text data from web and files',
        inputs: ['clean_web_data', 'clean_file_data'],
        outputs: ['processed_text', 'text_features', 'vocabulary'],
    },
    {
        id: uuidv4(),
        name: 'numeric_preprocessor',
        description: 'Preprocess numeric data from API and DB',
        inputs: ['clean_api_data', 'clean_db_data'],
        outputs: ['processed_numeric', 'numeric_stats', 'outlier_info'],
    },
    {
        id: uuidv4(),
        name: 'time_series_preprocessor',
        description: 'Preprocess time series from streams',
        inputs: ['clean_stream_data', 'latency_info'],
        outputs: ['processed_timeseries', 'trend_data', 'seasonality'],
    },
    {
        id: uuidv4(),
        name: 'quality_aggregator',
        description: 'Aggregate all quality scores',
        inputs: ['web_quality_score', 'api_quality_score', 'db_quality_score', 'file_quality_score', 'stream_quality_score'],
        outputs: ['overall_quality', 'quality_report', 'data_health'],
    },

    // === FEATURE ENGINEERING LAYER ===
    {
        id: uuidv4(),
        name: 'nlp_feature_extractor',
        description: 'Extract NLP features from text',
        inputs: ['processed_text', 'vocabulary'],
        outputs: ['text_embeddings', 'sentiment_scores', 'entity_data'],
    },
    {
        id: uuidv4(),
        name: 'statistical_feature_extractor',
        description: 'Extract statistical features from numeric data',
        inputs: ['processed_numeric', 'numeric_stats'],
        outputs: ['stat_features', 'correlation_matrix', 'distribution_params'],
    },
    {
        id: uuidv4(),
        name: 'temporal_feature_extractor',
        description: 'Extract temporal features from time series',
        inputs: ['processed_timeseries', 'trend_data', 'seasonality'],
        outputs: ['temporal_features', 'fourier_components', 'wavelet_coeffs'],
    },
    {
        id: uuidv4(),
        name: 'cross_modal_feature_extractor',
        description: 'Extract cross-modal features',
        inputs: ['text_embeddings', 'stat_features', 'temporal_features'],
        outputs: ['cross_features', 'interaction_terms', 'composite_metrics'],
    },

    // === DATA TRANSFORMATION LAYER ===
    {
        id: uuidv4(),
        name: 'text_transformer',
        description: 'Transform text features',
        inputs: ['text_embeddings', 'sentiment_scores', 'overall_quality'],
        outputs: ['transformed_text', 'text_variance'],
    },
    {
        id: uuidv4(),
        name: 'numeric_transformer',
        description: 'Transform numeric features',
        inputs: ['stat_features', 'correlation_matrix', 'data_health'],
        outputs: ['transformed_numeric', 'numeric_variance'],
    },
    {
        id: uuidv4(),
        name: 'temporal_transformer',
        description: 'Transform temporal features',
        inputs: ['temporal_features', 'fourier_components', 'quality_report'],
        outputs: ['transformed_temporal', 'temporal_variance'],
    },
    {
        id: uuidv4(),
        name: 'feature_selector',
        description: 'Select best features across modalities',
        inputs: ['cross_features', 'interaction_terms', 'composite_metrics'],
        outputs: ['selected_features', 'feature_importance', 'selection_rationale'],
    },

    // === NORMALIZATION LAYER ===
    {
        id: uuidv4(),
        name: 'text_normalizer',
        description: 'Normalize text features',
        inputs: ['transformed_text', 'text_variance'],
        outputs: ['normalized_text'],
    },
    {
        id: uuidv4(),
        name: 'numeric_normalizer',
        description: 'Normalize numeric features',
        inputs: ['transformed_numeric', 'numeric_variance'],
        outputs: ['normalized_numeric'],
    },
    {
        id: uuidv4(),
        name: 'temporal_normalizer',
        description: 'Normalize temporal features',
        inputs: ['transformed_temporal', 'temporal_variance'],
        outputs: ['normalized_temporal'],
    },
    {
        id: uuidv4(),
        name: 'feature_combiner',
        description: 'Combine selected and normalized features',
        inputs: ['selected_features', 'normalized_text', 'normalized_numeric', 'normalized_temporal'],
        outputs: ['combined_features', 'feature_map'],
    },

    // === MODEL TRAINING LAYER ===
    {
        id: uuidv4(),
        name: 'text_model_trainer',
        description: 'Train text-specific models',
        inputs: ['normalized_text', 'entity_data'],
        outputs: ['text_model', 'text_accuracy', 'text_metrics'],
    },
    {
        id: uuidv4(),
        name: 'numeric_model_trainer',
        description: 'Train numeric-specific models',
        inputs: ['normalized_numeric', 'distribution_params'],
        outputs: ['numeric_model', 'numeric_accuracy', 'numeric_metrics'],
    },
    {
        id: uuidv4(),
        name: 'temporal_model_trainer',
        description: 'Train temporal-specific models',
        inputs: ['normalized_temporal', 'wavelet_coeffs'],
        outputs: ['temporal_model', 'temporal_accuracy', 'temporal_metrics'],
    },
    {
        id: uuidv4(),
        name: 'ensemble_trainer',
        description: 'Train ensemble model on combined features',
        inputs: ['combined_features', 'feature_importance'],
        outputs: ['ensemble_model', 'ensemble_accuracy', 'ensemble_metrics'],
    },

    // === MODEL OPTIMIZATION LAYER ===
    {
        id: uuidv4(),
        name: 'hyperparameter_optimizer',
        description: 'Optimize hyperparameters across all models',
        inputs: ['text_model', 'numeric_model', 'temporal_model', 'ensemble_model'],
        outputs: ['optimized_models', 'best_params', 'optimization_history'],
    },
    {
        id: uuidv4(),
        name: 'feature_importance_analyzer',
        description: 'Analyze feature importance across models',
        inputs: ['optimized_models', 'feature_map', 'selection_rationale'],
        outputs: ['importance_rankings', 'feature_contributions', 'model_explanations'],
    },

    // === VALIDATION LAYER ===
    {
        id: uuidv4(),
        name: 'cross_validator',
        description: 'Perform cross-validation',
        inputs: ['optimized_models', 'combined_features'],
        outputs: ['cv_scores', 'cv_std', 'fold_results'],
    },
    {
        id: uuidv4(),
        name: 'holdout_validator',
        description: 'Validate on holdout set',
        inputs: ['optimized_models', 'normalized_text', 'normalized_numeric', 'normalized_temporal'],
        outputs: ['holdout_scores', 'confusion_matrices', 'prediction_intervals'],
    },
    {
        id: uuidv4(),
        name: 'performance_aggregator',
        description: 'Aggregate all performance metrics',
        inputs: ['text_accuracy', 'numeric_accuracy', 'temporal_accuracy', 'ensemble_accuracy', 'cv_scores', 'holdout_scores'],
        outputs: ['aggregate_performance', 'model_rankings', 'performance_summary'],
    },

    // === MODEL SELECTION LAYER ===
    {
        id: uuidv4(),
        name: 'model_selector',
        description: 'Select best performing model',
        inputs: ['optimized_models', 'aggregate_performance', 'model_rankings'],
        outputs: ['selected_model', 'selection_criteria', 'model_confidence'],
    },
    {
        id: uuidv4(),
        name: 'ensemble_optimizer',
        description: 'Optimize ensemble weights',
        inputs: ['selected_model', 'importance_rankings', 'performance_summary'],
        outputs: ['final_ensemble', 'ensemble_weights', 'weight_rationale'],
    },

    // === TESTING AND EVALUATION LAYER ===
    {
        id: uuidv4(),
        name: 'bias_tester',
        description: 'Test for model bias',
        inputs: ['final_ensemble', 'entity_data', 'distribution_params'],
        outputs: ['bias_report', 'fairness_metrics', 'bias_mitigation'],
    },
    {
        id: uuidv4(),
        name: 'robustness_tester',
        description: 'Test model robustness',
        inputs: ['final_ensemble', 'outlier_info', 'web_errors', 'api_errors'],
        outputs: ['robustness_report', 'stress_test_results', 'failure_modes'],
    },
    {
        id: uuidv4(),
        name: 'interpretability_analyzer',
        description: 'Analyze model interpretability',
        inputs: ['final_ensemble', 'feature_contributions', 'model_explanations'],
        outputs: ['interpretability_report', 'shap_values', 'lime_explanations'],
    },

    // === DEPLOYMENT PREPARATION LAYER ===
    {
        id: uuidv4(),
        name: 'model_packager',
        description: 'Package model for deployment',
        inputs: ['final_ensemble', 'ensemble_weights', 'feature_map'],
        outputs: ['deployment_package', 'model_artifacts', 'dependency_list'],
    },
    {
        id: uuidv4(),
        name: 'api_generator',
        description: 'Generate API endpoints',
        inputs: ['deployment_package', 'interpretability_report'],
        outputs: ['api_specification', 'endpoint_code', 'api_documentation'],
    },
    {
        id: uuidv4(),
        name: 'monitoring_setup',
        description: 'Set up model monitoring',
        inputs: ['model_artifacts', 'bias_report', 'robustness_report'],
        outputs: ['monitoring_config', 'alert_rules', 'dashboard_spec'],
    },

    // === QUALITY ASSURANCE LAYER ===
    {
        id: uuidv4(),
        name: 'integration_tester',
        description: 'Test integration components',
        inputs: ['api_specification', 'endpoint_code', 'monitoring_config'],
        outputs: ['integration_results', 'performance_benchmarks', 'load_test_results'],
    },
    {
        id: uuidv4(),
        name: 'security_auditor',
        description: 'Audit security aspects',
        inputs: ['deployment_package', 'api_documentation', 'alert_rules'],
        outputs: ['security_report', 'vulnerability_assessment', 'security_recommendations'],
    },

    // === DOCUMENTATION AND REPORTING LAYER ===
    {
        id: uuidv4(),
        name: 'technical_documenter',
        description: 'Generate technical documentation',
        inputs: ['model_confidence', 'weight_rationale', 'optimization_history', 'selection_criteria'],
        outputs: ['technical_docs', 'architecture_diagrams', 'implementation_guide'],
    },
    {
        id: uuidv4(),
        name: 'business_reporter',
        description: 'Generate business reports',
        inputs: ['aggregate_performance', 'bias_mitigation', 'failure_modes', 'performance_benchmarks'],
        outputs: ['business_report', 'roi_analysis', 'risk_assessment'],
    },
    {
        id: uuidv4(),
        name: 'compliance_checker',
        description: 'Check regulatory compliance',
        inputs: ['fairness_metrics', 'shap_values', 'lime_explanations', 'vulnerability_assessment'],
        outputs: ['compliance_report', 'audit_trail', 'regulatory_documentation'],
    },

    // === FINAL INTEGRATION LAYER ===
    {
        id: uuidv4(),
        name: 'deployment_orchestrator',
        description: 'Orchestrate final deployment',
        inputs: ['integration_results', 'security_recommendations', 'dashboard_spec', 'load_test_results'],
        outputs: ['deployment_plan', 'rollback_strategy', 'deployment_status'],
    },
    {
        id: uuidv4(),
        name: 'release_manager',
        description: 'Manage release process',
        inputs: ['technical_docs', 'business_report', 'compliance_report', 'deployment_plan'],
        outputs: ['release_notes', 'deployment_checklist', 'stakeholder_communication'],
    },
    {
        id: uuidv4(),
        name: 'final_validator',
        description: 'Final validation and sign-off',
        inputs: ['deployment_status', 'audit_trail', 'risk_assessment', 'rollback_strategy'],
        outputs: ['production_ready', 'validation_certificate', 'go_live_approval'],
    },

    // === INDEPENDENT MONITORING PIPELINES ===
    {
        id: uuidv4(),
        name: 'performance_monitor',
        description: 'Monitor system performance',
        inputs: [],
        outputs: ['cpu_metrics', 'memory_metrics', 'disk_io'],
    },
    {
        id: uuidv4(),
        name: 'data_drift_monitor',
        description: 'Monitor for data drift',
        inputs: [],
        outputs: ['drift_metrics', 'distribution_changes', 'drift_alerts'],
    },
    {
        id: uuidv4(),
        name: 'model_performance_monitor',
        description: 'Monitor model performance in production',
        inputs: [],
        outputs: ['accuracy_trends', 'prediction_confidence', 'model_health'],
    },
    {
        id: uuidv4(),
        name: 'business_metrics_monitor',
        description: 'Monitor business impact metrics',
        inputs: [],
        outputs: ['business_kpis', 'revenue_impact', 'user_satisfaction'],
    },

    // === FINAL AGGREGATION ===
    {
        id: uuidv4(),
        name: 'master_aggregator',
        description: 'Aggregate all final outputs and monitoring',
        inputs: ['production_ready', 'validation_certificate', 'go_live_approval', 'release_notes', 
                'cpu_metrics', 'memory_metrics', 'drift_metrics', 'accuracy_trends', 'business_kpis'],
        outputs: ['master_dashboard', 'executive_summary', 'operational_status'],
    },
]

/**
 * Generates workflows from a list of jobs by finding chains of compatible jobs.
 * Jobs are chainable only if outputs of one job match inputs of another.
 * Automatically inserts fake steps for inputs that haven't been produced by earlier jobs.
 * 
 * @param jobs Array of jobs to create workflows from
 * @returns Array of workflows, where each workflow is a graph with steps and edges
 */
export function generateWorkflows(jobs: Job[]): Workflow[] {
    const workflows: Workflow[] = [];
    const usedJobs = new Set<string>();
    
    // Helper to check if two jobs are chainable (outputs of first match inputs of second)
    const areChainable = (fromJob: Job, toJob: Job): string[] => {
        const matchingOutputs: string[] = [];
        for (const input of toJob.inputs) {
            if (fromJob.outputs.includes(input)) {
                matchingOutputs.push(input);
            }
        }
        return matchingOutputs;
    };
    
    // Find all jobs that can start a workflow (no dependencies or all dependencies are external)
    const findStarterJobs = (remainingJobs: Job[]): Job[] => {
        return remainingJobs.filter(job => {
            // A job can start if none of its inputs are produced by any other remaining job
            const availableOutputs = new Set(
                remainingJobs.flatMap(j => j.outputs)
            );
            return job.inputs.every(input => !availableOutputs.has(input));
        });
    };
    
    // Build a single workflow starting from a given job
    const buildWorkflow = (startJob: Job, availableJobs: Job[]): Workflow => {
        const steps: WorkflowNode[] = [];
        const edges: WorkflowEdge[] = [];
        const stepMap = new Map<string, WorkflowNode>(); // jobId -> step
        const producedOutputs = new Set<string>();
        let position = 0;
        
        // Helper to create a fake step for missing inputs
        const createFakeStep = (inputName: string): WorkflowNode => {
            const step: WorkflowNode = {
                id: uuidv4(),
                job: {
                    id: uuidv4(),
                    name: `load_${inputName}`,
                    description: `Load input file for ${inputName}`,
                    inputs: [],
                    outputs: [inputName]
                },
                position: position++,
                isFakeStep: true
            };
            return step;
        };
        
        // Helper to create a regular step
        const createStep = (job: Job): WorkflowNode => {
            const step: WorkflowNode = {
                id: uuidv4(),
                job: job,
                position: position++,
                isFakeStep: false
            };
            return step;
        };
        
        // Process a job and add it to the workflow
        const processJob = (job: Job): WorkflowNode => {
            // Check for missing inputs and create fake steps
            for (const input of job.inputs) {
                if (!producedOutputs.has(input)) {
                    const fakeStep = createFakeStep(input);
                    steps.push(fakeStep);
                    stepMap.set(fakeStep.job.id, fakeStep);
                    producedOutputs.add(input);
                }
            }
            
            // Create the actual job step
            const step = createStep(job);
            steps.push(step);
            stepMap.set(job.id, step);
            
            // Create edges from producers to this step
            for (const input of job.inputs) {
                // Find the step that produces this input
                for (const [jobId, producerStep] of stepMap) {
                    if (producerStep.job.outputs.includes(input)) {
                        const edge: WorkflowEdge = {
                            from: producerStep.id,
                            to: step.id,
                            dataFlow: [input]
                        };
                        // Check if edge already exists and merge dataFlow
                        const existingEdge = edges.find(e => e.from === edge.from && e.to === edge.to);
                        if (existingEdge) {
                            if (!existingEdge.dataFlow.includes(input)) {
                                existingEdge.dataFlow.push(input);
                            }
                        } else {
                            edges.push(edge);
                        }
                        break;
                    }
                }
            }
            
            // Mark outputs as produced
            job.outputs.forEach(output => producedOutputs.add(output));
            usedJobs.add(job.id);
            
            return step;
        };
        
        // Start with the initial job
        processJob(startJob);
        
        // Continue finding jobs that can be chained
        let foundChainableJob = true;
        const remainingJobs = availableJobs.filter(j => j.id !== startJob.id);
        
        while (foundChainableJob) {
            foundChainableJob = false;
            
            // Find a job that can be chained (has at least one input satisfied)
            for (let i = 0; i < remainingJobs.length; i++) {
                const job = remainingJobs[i];
                
                if (usedJobs.has(job.id)) continue;
                
                // Check if any of the job's inputs are satisfied by current outputs
                const satisfiedInputs = job.inputs.filter(input => producedOutputs.has(input));
                const canChain = satisfiedInputs.length > 0 || job.inputs.length === 0;
                
                if (canChain) {
                    processJob(job);
                    foundChainableJob = true;
                    break;
                }
            }
        }
        
        return {
            nodes: steps,
            edges
        };
    };
    
    // Create workflows by finding starter jobs and building chains
    const remainingJobs = [...jobs];
    
    while (remainingJobs.length > 0) {
        const unusedJobs = remainingJobs.filter(job => !usedJobs.has(job.id));
        if (unusedJobs.length === 0) break;
        
        const starterJobs = findStarterJobs(unusedJobs);
        
        if (starterJobs.length === 0) {
            // If no clear starter, pick the first unused job
            const firstUnused = unusedJobs[0];
            const workflow = buildWorkflow(firstUnused, unusedJobs);
            workflows.push(workflow);
        } else {
            // Build workflows from each starter job
            for (const starterJob of starterJobs) {
                if (!usedJobs.has(starterJob.id)) {
                    const workflow = buildWorkflow(starterJob, unusedJobs);
                    workflows.push(workflow);
                }
            }
        }
        
        // Safety check to prevent infinite loop
        const currentUsedCount = usedJobs.size;
        if (currentUsedCount === 0) {
            // Force use at least one job to prevent infinite loop
            const firstUnused = unusedJobs[0];
            if (firstUnused) {
                usedJobs.add(firstUnused.id);
            }
        }
    }
    
    return workflows;
}