# UC12 – Registrar Denúncia

**Ator primário:** Usuário
**Meta no contexto:** Permitir registrar problemas de infraestrutura urbana.

**Precondições:**
- O usuário deve estar autenticado.

**Disparador:** O usuário seleciona a opção “Nova Denúncia”.

**Cenário:**
1. O usuário preenche título, descrição e categoria.
2. O usuário informa ou confirma localização.
3. O usuário adiciona foto.
4. O sistema valida e registra a denúncia.
5. O sistema define status inicial como “Aberta”.

**Exceções:**
- Localização não detectada → usuário informa manualmente.
- Categoria não informada → sistema solicita.
- Outra denuncia cadastrada na mesma localizacao → Sistema pede pro usuario confirmar se nao e a mesma denuncia

**Prioridade:** Essencial.
**Quando disponível:** Primeiro incremento.
**Frequência de uso:** Frequente.
**Canal com o ator:** Interface web/mobile.