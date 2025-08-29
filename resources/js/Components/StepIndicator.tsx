interface Step {
    name: string;
    description: string;
    icon: React.ReactNode;
}

interface StepIndicatorProps {
    steps?: Step[];
    currentStep: number;
    className?: string;
}

const defaultSteps: Step[] = [
    {
        name: 'Information',
        description: 'Student details',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
    {
        name: 'Tracks',
        description: 'Select preferences',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        )
    },
    {
        name: 'Preview',
        description: 'Review & submit',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export default function StepIndicator({ steps = defaultSteps, currentStep, className = '' }: StepIndicatorProps) {
    return (
        <div className={`mb-8 ${className}`}>
            <nav aria-label="Progress">
                <ol className="flex items-center justify-center">
                    {steps.map((step, stepIndex) => (
                        <li key={step.name} className={`relative ${stepIndex !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                            {/* Connector Line */}
                            {stepIndex !== steps.length - 1 && (
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className={`h-0.5 w-full ${
                                        stepIndex < currentStep 
                                            ? 'bg-indigo-600' 
                                            : 'bg-gray-200 dark:bg-gray-600'
                                    }`} />
                                </div>
                            )}
                            
                            {/* Step Circle */}
                            <div className="relative flex items-center justify-center">
                                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                                    stepIndex < currentStep 
                                        ? 'bg-indigo-600 border-indigo-600' 
                                        : stepIndex === currentStep 
                                            ? 'border-indigo-600 bg-white dark:bg-gray-800' 
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                }`}>
                                    {stepIndex < currentStep ? (
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <div className={`text-sm font-semibold ${
                                            stepIndex === currentStep 
                                                ? 'text-indigo-600' 
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {stepIndex + 1}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Step Label */}
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
                                <div className={`text-sm font-medium ${
                                    stepIndex <= currentStep 
                                        ? 'text-indigo-600 dark:text-indigo-400' 
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {step.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
                                    {step.description}
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
}