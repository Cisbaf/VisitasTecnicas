import { useState, useEffect, useCallback } from 'react';
import { FormCategory } from '@/components/types';
import { PREDEFINED_SUMMARIES } from '@/components/types';

export function useForms(onFormUpdate?: () => void) {
    const [forms, setForms] = useState<FormCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<FormCategory | undefined>();

    const fetchForms = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/form`);
            if (!response.ok) throw new Error('Falha ao carregar formulários');
            const data = await response.json();
            setForms(data);
        } catch (err) {
            setError('Erro ao carregar: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleSaveForm = async (formData: { id?: number; categoria: string; summaryId: number; campos: any[]; tipoForm: string }) => {
        const uri = editingForm ? `/api/form/${formData.id}` : '/api/form/saveForm';
        const method = editingForm ? 'PUT' : 'POST';

        try {
            const response = await fetch(uri, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Falha ao salvar formulário');

            await fetchForms();
            setModalOpen(false);
            setEditingForm(undefined);
            onFormUpdate?.();
        } catch (err) {
            setError('Erro ao salvar: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleDeleteForm = async (id: number) => {
        try {
            const response = await fetch(`/api/form/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir formulário');
            await fetchForms();
        } catch (err) {
            setError('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleOpenModal = (form?: FormCategory) => {
        setEditingForm(form);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingForm(undefined);
    };

    return {
        forms,
        loading,
        error,
        setError,
        modalOpen,
        editingForm,
        fetchForms,
        handleSaveForm,
        handleDeleteForm,
        handleOpenModal,
        handleCloseModal,
        summaries: PREDEFINED_SUMMARIES,

    };
}