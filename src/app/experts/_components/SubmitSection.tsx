'use client';

import { type ValidationErrors } from "./expert-constructor.logic";
import { Button } from '@/components/ui/Button'; // Импортируем нашу новую кнопку!
import { AlertTriangle } from "lucide-react";

type Props = {
  isSaving: boolean;
  isFormValid: boolean;
  // expertId: string | undefined; // УДАЛЯЕМ ЭТУ СТРОКУ
  isCreateMode: boolean;
  clearDraft: () => void;
  validationErrors: ValidationErrors;
  formName: string;
};

// --- Новый стильный блок для ошибок ---
const ValidationErrorBlock = ({ errors }: { errors: ValidationErrors }) => {
  const errorMessages = Object.values(errors).filter(Boolean);
  if (errorMessages.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
        <div>
          <h3 className="font-pixel text-base text-amber-400">Not all fields are filled correctly:</h3>
          <ul className="mt-1 list-disc pl-5 font-sans text-sm text-text-secondary">
            {errorMessages.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};


export default function SubmitSection({ isSaving, isFormValid, /* expertId, */ isCreateMode, clearDraft, validationErrors, formName }: Props) { // УДАЛЯЕМ expertId ИЗ ДЕСТРУКТУРИЗАЦИИ
  return (
    <div className="border-t border-bg-surface pt-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="submit"
          disabled={!isFormValid}
          isLoading={isSaving}
          className="flex-1" // Растягиваем на всю ширину
        >
          {isSaving ? 'Saving...' : (isCreateMode ? 'Create Expert' : 'Update Expert')}
        </Button>

        {isCreateMode && (
          <Button
            type="button"
            onClick={clearDraft}
            variant="destructive" // Используем ДЕСТРУКТИВНЫЙ стиль
          >
            Clear
          </Button>
        )}
      </div>

      {!isFormValid && formName.trim().length > 0 && (
        <ValidationErrorBlock errors={validationErrors} />
      )}
    </div>
  );
}