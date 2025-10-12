import { useState, useCallback } from 'react';

interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  handleChange: (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (event: React.FormEvent) => Promise<void>;
  reset: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Record<keyof T, (value: any) => string | null>
): UseFormReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T) => {
    if (!validationRules || !validationRules[field]) return;
    
    const error = validationRules[field](values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  }, [values, validationRules]);

  const validateForm = useCallback((): boolean => {
    if (!validationRules) return true;
    
    const newErrors: Record<string, string> = {};
    let isFormValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field as keyof T](values[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isFormValid = false;
      }
    });
    
    setErrors(newErrors);
    return isFormValid;
  }, [values, validationRules]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  const handleChange = useCallback((field: keyof T) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
    
    setValue(field, value);
  }, [setValue]);

  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => 
    async (event: React.FormEvent) => {
      event.preventDefault();
      
      if (!validateForm()) return;
      
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }, [values, validateForm]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.values(errors).every(error => !error);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    handleChange,
    handleSubmit,
    reset,
    validateField,
    validateForm
  };
};