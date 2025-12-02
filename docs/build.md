
---
### Requisitos 

- Docker  instalado.
- Docker Compose 
- Git 

---

### 1. Clone o repositório
```bash
git clone https://github.com/ifsc-arliones/projeto-daio
cd projeto-daio
```

### 2. Suba os containers 
```bash
docker compose -f docker-compose.dev.yml up --build
```

### 3. Acessos e endpoints
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`  
- PgAdmin: `http://localhost:5050`  
  - Login: `admin@corrigeaqui.com`  
  - Senha: `admin`

### 4. Conectar o pgAdmin ao Postgres
No pgAdmin → Add New Server:
- **General:** nome 
- **Connection:**
  - Host: `postgres`
  - Port: `5432`
  - Username: `postgres`
  - Password: `postgres`

### 5. Limpar docker (PC Escola)
No terminal, execute:
```bash
docker system prune -a --volumes -f
```

### 6. Comandos Úteis

```bash
docker-compose down -v --rmi all 
docker compose restart backend
docker compose exec backend bash
```

```bash
INSERT INTO users (name, email, password, verified, avatar)
VALUES (
  'Caio Eax',
  'caio@corrigeaqui.com',
  'senha123',  -- Em produção, isso deve ser um hash!
  true,
  '/avatars/caio.jpg'
);
```