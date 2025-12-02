'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Role } from '@/@types/user';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as Role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as Role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não são iguais');
      return;
    }

    if (!/^\d{11}$/.test(formData.cpf)) {
      setError('CPF deve conter 11 dígitos');
      return;
    }

    if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      setError('Número de telefone deve conter 10 ou 11 dígitos');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md pt-8">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>Registre-se para começar a usar o Corrige Aqui</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Linus Torvald"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="linustorvald@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              type="text"
              placeholder="12345678901"
              value={formData.cpf}
              onChange={handleChange}
              required
              disabled={loading}
              maxLength={11}
              pattern="\d{11}"
            />
            <p className="text-xs text-gray-500">11 dígitos, apenas números</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Telefone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              placeholder="11987654321"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              disabled={loading}
              maxLength={11}
              pattern="\d{10,11}"
            />
            <p className="text-xs text-gray-500">10-11 dígitos, apenas números</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário</SelectItem>
                <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Digite a senha"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirme a Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirme a senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-8 flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
          
          <p className="text-sm text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
