# UC09 – Reportar Postagem

**Ator primário:** Usuário  
**Meta no contexto:** Permitir que o usuário reporte conteúdo inadequado.  

**Precondições:** Deve existir uma denúncia publicada.  

**Disparador:** O usuário seleciona “Reportar”.  

**Cenário:**  
1. O sistema solicita motivo do reporte.  
2. O usuário informa motivo.  
3. O sistema registra reporte para análise.  

**Exceções:**  
- Reporte duplicado → sistema informa que já foi reportado.  

**Prioridade:** Media.  
**Quando disponível:** Incremento 2.  
**Frequência de uso:** Eventual.  
**Canal com o ator:** Interface web/mobile.  
