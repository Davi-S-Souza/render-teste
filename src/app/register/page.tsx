'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para aplicar máscara no CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  // Função para aplicar máscara no telefone
  const formatPhone = (value: string) => {
    const numbers = value. replace(/\D/g, '');
    if (numbers.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else if (numbers.length <= 11) {
      // Formato: (XX) XXXXX-XXXX
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  // Função para remover máscara (apenas números)
  const removeMask = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Função para validar senha forte
  const validateStrongPassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/. test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?  ]/.test(password);

    if (!minLength) {
      return 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (!hasUpperCase) {
      return 'A senha deve conter pelo menos uma letra maiúscula.';
    }
    if (!hasLowerCase) {
      return 'A senha deve conter pelo menos uma letra minúscula. ';
    }
    if (! hasNumber) {
      return 'A senha deve conter pelo menos um número.';
    }
    if (!hasSpecialChar) {
      return 'A senha deve conter pelo menos um caractere especial (! @#$%^&*). ';
    }
    return null;
  };

  const handleChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phoneNumber') {
      formattedValue = formatPhone(value);
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação de senha forte
    const passwordError = validateStrongPassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }

    const cpfNumbers = removeMask(formData.cpf);
    if (!/^\d{11}$/.test(cpfNumbers)) {
      setError('CPF deve conter 11 dígitos.');
      return;
    }

    const phoneNumbers = removeMask(formData.phoneNumber);
    if (!/^\d{10,11}$/.test(phoneNumbers)) {
      setError('Número de telefone deve conter 10 ou 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      // Envia os dados sem máscara para o backend
      await authService.register({
        ... formData,
        cpf: cpfNumbers,
        phoneNumber: phoneNumbers
      });
      
      //voltei pro login automatico
      await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      //vai pra home com sucesso
      router.push('/home?registered=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registro falhou');
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    router.push('/maps');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* foto */}
        <div className="lg:col-span-2 ml-10 hidden lg:block space-y-3">
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
              Faça sua parte com a sociedade e contribua
            </h1>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
              em nossa plataforma!  
            </h1>
          </div>

          <div className="relative w-full">
            <Image 
              src="/imagemTotal.png" 
              alt="Mapa da cidade com marcadores"
              width={500}
              height={350}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* cards */}
        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <div className="border border-gray-300 rounded-lg p-8 lg:p-10 bg-white shadow-xl w-full mx-auto max-w-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              {/* Logo */}
              <div className="flex items-center justify-center py-1">
                <Image 
                  src="/logoatVerde2.png" 
                  alt="Logo Corrige Aqui"
                  width={180} 
                  height={180}
                />
              </div>

              {error && (
                <div className="p-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* inputs */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={3}
                  maxLength={100}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  placeholder="Sobrenome"
                  // value={formData.surname}
                  // onChange={handleChange}
                  // required
                  disabled={loading}
                  minLength={3}
                  maxLength={100}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />
                
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="CPF (111.222.333-44)"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={14}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Telefone ((XX) XXXXX-XXXX)"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={15}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Senha (min.  8 caracteres)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={8}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar Senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-5 text-gray-600 text-sm"
                />

                {/* Dica de senha */}
                <div className="text-xs text-gray-500 px-2">
                  A senha deve conter: letra maiúscula, minúscula, número e caractere especial. 
                </div>

                {/* registro */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-base font-semibold mt-4"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>

              {/* ou */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    ou
                  </span>
                </div>
              </div>

              {/* visitante */}
              <Button
                type="button"
                onClick={handleGuestAccess}
                variant="outline"
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full py-6 text-base font-semibold"
              >
                Entrar como Visitante
              </Button>
            </div>

            {/* footer do card */}
            <div className="space-y-3 text-center pt-6">
              <p className="text-sm text-gray-600">
                Já tem uma conta?   {' '}
                <a href="/" className="text-blue-800 hover:underline"><strong>Faça Login</strong></a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}