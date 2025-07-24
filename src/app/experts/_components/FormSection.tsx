// src/app/experts/_components/FormSection.tsx
import React from 'react';

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  indicator?: boolean;
};

export default function FormSection({ title, description, children, actions, indicator = false }: FormSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center space-x-2">
            {actions}
            {indicator && <div className="w-3 h-3 rounded-full bg-green-500" />}
        </div>
      </div>
      {children}
    </div>
  );
}