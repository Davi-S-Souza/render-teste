# UC02 – Cadastro

**Ator primário:** Usuário  
**Meta no contexto:** Permitir que um novo usuário crie uma conta no sistema.  

**Precondições:**    
- O usuário deve fornecer dados válidos.  

**Disparador:** O usuário seleciona a opção “Cadastrar-se”.  

**Cenário:**  
1. O usuário informa nome completo, e-mail, cpf, numero celular e senha.  
2. O usuário confirma a senha.  
3. O usuário aceita os termos de uso.  
4. O sistema valida os dados.  
5. O sistema cria a conta e exibe mensagem de sucesso.  

**Exceções:**  
- E-mail já cadastrado → o sistema sugere redefinição de senha.  
- Dados inválidos ou incompletos → o sistema solicita correção antes de prosseguir.  
- Senhas não coincidem → o sistema pede para corrigir.  

**Prioridade:** Essencial.  
**Quando disponível:** Primeiro incremento.  
**Frequência de uso:** Apenas uma vez por usuário.  
**Canal com o ator:** Interface web/mobile.  
