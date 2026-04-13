import { useState, useCallback, useEffect } from 'react';

export interface UserResponse {
    id: number;
    user: string;
    role: string;
    password: string;
    baseId: number | null;
}

export interface UserRequest {
    user: string;
    password?: string;
    role: string;
    baseId: number | null;
}

export interface Base {
    id: number;
    nome: string;
}

export const useUserManagement = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [bases, setBases] = useState<Base[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`/api/auth/user`);
            if (!res.ok) {
                if (res.status === 404 || res.status === 204) {
                    setUsers([]);
                    return;
                }
                throw new Error("Falha ao carregar funcionários");
            }
            const data: UserResponse[] = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
            setUsers([]);
        }
    }, []);

    const fetchBases = useCallback(async () => {
        try {
            const response = await fetch(`/api/base`);
            if (!response.ok) throw new Error('Falha ao carregar as bases');
            const data = await response.json();
            setBases(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar bases';
            setError(prev => prev ? `${prev}\n${message}` : message);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchBases()]);
            setLoading(false);
        };
        loadData();
    }, [fetchUsers, fetchBases]);

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAddUser = async (userData: UserRequest) => {
        try {
            const res = await fetch('/api/auth/user/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!res.ok) throw new Error("Falha ao criar usuário");
            showSnackbar("Funcionário criado com sucesso!");
            fetchUsers();
            return true;
        } catch (err: any) {
            showSnackbar(err.message, 'error');
            return false;
        }
    };

    const handleUpdateUser = async (userData: Partial<UserRequest>) => {
        if (!currentUser) return false;

        try {
            const requestBody: Partial<UserRequest> = {
                user: currentUser.user,
                role: userData.role || currentUser.role,
                baseId: userData.baseId !== undefined ? Number(userData.baseId) : currentUser.baseId,
                password: userData.password ? userData.password : undefined
            };
            console.log(requestBody);


            const res = await fetch(`/api/auth/user/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) throw new Error("Falha ao atualizar usuário");
            showSnackbar("Funcionário atualizado com sucesso!");
            fetchUsers();
            return true;
        } catch (err: any) {
            showSnackbar(err.message, 'error');
            return false;
        }
    };

    const handleChangePassword = async (newPassword: string) => {
        if (!currentUser) return false;

        try {
            const requestBody: UserRequest = {
                user: currentUser.user,
                password: newPassword,
                role: currentUser.role,
                baseId: currentUser.baseId
            };

            const res = await fetch(`/api/auth/user/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) throw new Error("Falha ao alterar a senha");
            showSnackbar("Senha alterada com sucesso!");
            return true;
        } catch (err: any) {
            showSnackbar(err.message, 'error');
            return false;
        }
    };

    const handleDeleteUser = async () => {
        if (!currentUser) return false;

        try {
            const res = await fetch(`/api/auth/user/${currentUser.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Falha ao excluir usuário");
            showSnackbar("Funcionário excluído com sucesso!");
            fetchUsers();
            return true;
        } catch (err: any) {
            showSnackbar(err.message, 'error');
            return false;
        }
    };

    return {
        users,
        bases,
        loading,
        error,
        searchTerm,
        currentUser,
        snackbar,
        setSearchTerm,
        setCurrentUser,
        setSnackbar,
        fetchUsers,
        showSnackbar,
        handleAddUser,
        handleUpdateUser,
        handleChangePassword,
        handleDeleteUser
    };
};