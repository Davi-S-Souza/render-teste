'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import Image from 'next/image';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Detecta se veio do registro
  useEffect(() => {
    if (searchParams.get('registered') === 'success') {
      setShowSuccessDialog(true);
      // Limpa o parâmetro da URL sem recarregar a página
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService. login(loginData);
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err. message : 'Login falhou');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* card imagem */}
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

        {/* card login*/}
        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <div className="border border-gray-300 rounded-lg p-8 lg:p-10 bg-white shadow-xl w-full mx-auto max-w-[400px] min-h-[720px] flex flex-col justify-between">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-6">
                {/* logo */}
                <div className="flex items-center justify-center py-4">
                  <Image 
                    src="/logoatVerde2.png" 
                    alt="Logo Corrige Aqui"
                    width={230} 
                    height={230}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {/* inputs */}
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-6 text-gray-600 text-base"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ... loginData, password: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full border-2 border-gray-300 rounded-full px-5 py-6 text-gray-600 text-base"
                />

                {/* login */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-7 text-lg font-semibold"
                >
                  {loading ? 'Entrando.. .' : 'Entrar'}
                </Button>

                {/* ou */}
                <div className="relative my-6">
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
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full py-7 text-lg font-semibold"
                >
                  Entrar como Visitante
                </Button>
              </div>
            </form>

            {/* footer do card */}
            <div className="space-y-3 text-center pt-8">
              <p className="text-sm text-gray-600">
                <a href="#" className="hover:underline"><strong>Esqueceu sua senha? </strong></a>
              </p>
              <p className="text-sm text-gray-600">
                Não tenho uma conta. {' '}
                <a href="/register/" className="text-blue-800 hover:underline"><strong>Cadastre-se</strong></a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Sucesso */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Cadastro realizado com sucesso!"
        message="Sua conta foi criada com sucesso.  Faça login para acessar a plataforma."
        buttonText="Ok"
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}