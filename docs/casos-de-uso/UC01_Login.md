# UC01 – Login

**Ator primário:** Usuário  
**Meta no contexto:** Permitir que um usuário acesse o sistema com suas credenciais.  

**Precondições:**  
- O usuário já deve estar cadastrado.  

**Disparador:** O usuário tenta acessar sua conta.  

**Cenário:**  
1. O usuário insere e-mail e senha.  
2. O sistema valida as credenciais.  
3. O usuário é autenticado e direcionado para a tela inicial.  

**Exceções:**  
- Credenciais inválidas → o sistema informa erro e solicita nova tentativa.  
- Conta inexistente → o sistema informa que não há cadastro e oferece a opção de registrar-se.  
- Senha incorreta 3 vezes → o sistema bloqueia novas tentativas por 5 minutos.  

**Prioridade:** Essencial.  
**Quando disponível:** Primeiro incremento.  
**Frequência de uso:** Várias vezes ao dia.  
**Canal com o ator:** Interface web/mobile.  