// src/app/experts/_components/TemplatesSection.tsx
'use client';

import FormSection from './FormSection';
import { expertTemplates } from './expert-constructor.logic';

type Props = {
    applyGlobalTemplate: (key: string) => void;
}

export default function TemplatesSection({ applyGlobalTemplate }: Props) {
    return (
        <FormSection
            title="Готовые Шаблоны"
            description="Выберите готовую конфигурацию в один клик."
        >
             <div className="flex flex-wrap gap-3">
                {Object.entries(expertTemplates).map(([key, template]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => applyGlobalTemplate(key)}
                        className="flex-grow px-4 py-2 text-sm font-medium text-center text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-lg hover:bg-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {template.name}
                    </button>
                ))}
            </div>
        </FormSection>
    );
}