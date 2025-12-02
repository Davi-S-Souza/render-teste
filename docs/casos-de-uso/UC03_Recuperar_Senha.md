# UC03 – Recuperar Senha

**Ator primário:** Usuário  
**Meta no contexto:** Permitir que um usuário recupere o acesso à sua conta.  

**Precondições:**  
- O usuário deve possuir uma conta cadastrada.  

**Disparador:** O usuário seleciona a opção “Esqueci minha senha”.  

**Cenário:**  
1. O usuário informa o e-mail cadastrado.  
2. O sistema envia um link de redefinição de senha.  
3. O usuário acessa o link e cria uma nova senha.  
4. O sistema confirma a redefinição e libera o acesso.  

**Exceções:**  
- E-mail não cadastrado → o sistema informa erro.  

**Prioridade:** Importante.  
**Quando disponível:** Incremento inicial.  
**Frequência de uso:** Ocasional.  
**Canal com o ator:** Interface web/mobile, e-mail.  
