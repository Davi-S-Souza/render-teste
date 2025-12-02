# UC12 – Gerar Relatórios e Métricas

**Ator primário:** Funcionário, Administrador do Sistema  
**Meta no contexto:** Permitir gerar relatórios e estatísticas sobre denúncias.  

**Precondições:** O sistema deve conter dados registrados.  

**Disparador:** O ator solicita a geração de relatório.  

**Cenário:**  
1. O sistema solicita parâmetros de filtro.  
2. O ator define filtros (período, região, categoria).  
3. O sistema gera relatório e exibe gráficos.  

**Exceções:**  
- Nenhum dado encontrado → relatório vazio.  

**Prioridade:** Importante.  
**Quando disponível:** Incremento 3.  
**Frequência de uso:** Eventual.  
**Canal com o ator:** Interface web.  
