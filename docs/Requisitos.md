# Requisitos

## Requisitos Funcionais (RF)

- **RF01** – Login e Cadastro de usuários.  
- **RF02** – Recuperação de senha.  
- **RF03** – Sistema de mérito da conta (gamificação).  
- **RF04** – Registro de denúncias.  
- **RF05** – Visualização de denúncias.  
- **RF06** – Visualização de perfil do usuário.  
- **RF07** – Implementação de mapa com localização.  
- **RF08** – Integração do mapa com denúncias.  
- **RF09** – Sistema de upvotes em denúncias.  
- **RF10** – Reportar postagens inadequadas.  
- **RF11** – Acompanhamento do status de resolução.  
- **RF12** – Filtragem de problemas por tipo.  
- **RF13** – Filtragem de problemas por região.  

---

## Requisitos Não Funcionais (RNF)

- **RNF01 – Responsividade**: a interface deve ser responsiva.  
- **RNF02 – Segurança**: dados de usuários devem ser criptografados em repouso e em trânsito.  
- **RNF03 – Compatibilidade**: o sistema deve funcionar em navegadores modernos e em dispositivos móveis Android.  
- **RNF04 – Acessibilidade**: a interface deve ter recursos diversos para acessibilidade geral.  

---

# Regras de Negócio (RN)

- **RN01 – Validação de Usuário**  
  Apenas usuários cadastrados e autenticados podem registrar denúncias ou interagir com denúncias existentes (upvotes, comentários, reportar).  

- **RN02 – Limite de Denúncias por Usuário**  
  Existira um limite fixo de envios de post diarios por usuario, evitando sobrecarga ou spam.  

- **RN03 – Denúncias Geolocalizadas**  
  Toda denúncia deve conter localização válida (latitude/longitude), inicialmente informada manualmente, e futuramente podendo ser obtida por geolocalização automática.  

- **RN04 – Classificação Obrigatória**  
  Toda denúncia deve ser categorizada obrigatoriamente por tipo de problema (buraco, iluminação, coleta de lixo, calçada, sinalização,etc).  

- **RN05 – Status do Problema**  
  Toda denúncia deve ter um status associado (aberta, em andamento, resolvida)

- **RN06 – Sistema de Mérito**  
  Usuários acumulam pontos de engajamento por ações válidas (registro de denúncia, contribuição em resolução, confirmação de status), que podem gerar níveis de verificacao ou outros reconhecimentos.  

- **RN07 – Conteúdo Inadequado**  
  Postagens consideradas ofensivas, duplicadas ou irrelevantes poderão ser reportadas e removidas após análise.  
