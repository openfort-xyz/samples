# Aave Sample

Aquest exemple mostra com integrar Openfort amb Aave per crear una aplicació de DeFi amb funcionalitats de lending i borrowing.

## Estructura del Projecte

```
samples/aave/
├── frontend/          # Aplicació React amb Vite
├── backend/           # Servidor Express.js
└── README.md         # Aquest fitxer
```

## Requisits Previs

- Node.js (versió 16 o superior)
- npm o yarn
- Compte d'Openfort amb API keys configurades

## Configuració i Instal·lació

### 1. Instal·lar Dependències

Instal·la les dependències tant per al frontend com per al backend:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Variables d'Entorn

#### Backend (.env)

Copia el fitxer `.env.example` a `.env` i omple les variables necessàries:

```bash
cd backend
cp .env.example .env
```

Edita el fitxer `.env` amb els teus valors:

```env
# Openfort Shield Configuration
NEXT_PUBLIC_SHIELD_API_KEY=your_shield_api_key
NEXTAUTH_SHIELD_SECRET_KEY=your_shield_secret_key
NEXTAUTH_SHIELD_ENCRYPTION_SHARE=your_encryption_share

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

#### Frontend (.env)

Copia el fitxer `.env.example` a `.env` i omple les variables necessàries:

```bash
cd ../frontend
cp .env.example .env
```

Edita el fitxer `.env` amb els teus valors:

```env
# Openfort Configuration
VITE_OPENFORT_PUBLISHABLE_KEY=your_publishable_key
VITE_OPENFORT_SHIELD_PUBLIC_KEY=your_shield_public_key
VITE_BACKEND_URL=http://localhost:3001
VITE_OPENFORT_POLICY_ID=your_policy_id
```

## Executar l'Aplicació

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

El servidor backend s'executarà a `http://localhost:3001`

### 2. Iniciar el Frontend

En una nova terminal:

```bash
cd frontend
npm run dev
```

L'aplicació frontend s'executarà a `http://localhost:5173`

## Funcionalitats

- **Connexió de Wallet**: Integració amb Openfort Shield per a l'autenticació
- **Interacció amb Aave**: Operacions de lending i borrowing
- **Gestió de Tokens**: Visualització de balanços i transaccions
- **Interface d'Usuari**: Interface moderna amb React i Tailwind CSS

## Desenvolupament

### Scripts Disponibles

#### Backend
- `npm start`: Inicia el servidor en mode producció
- `npm run dev`: Inicia el servidor amb nodemon (mode desenvolupament)

#### Frontend
- `npm run dev`: Inicia el servidor de desenvolupament
- `npm run build`: Construeix l'aplicació per a producció
- `npm run lint`: Executa el linter
- `npm run preview`: Previsualitza la build de producció

## Troubleshooting

1. **Error de CORS**: Assegura't que `CORS_ORIGIN` al backend coincideixi amb la URL del frontend
2. **Variables d'entorn**: Verifica que totes les variables d'entorn estiguin configurades correctament
3. **Ports ocupats**: Si els ports 3001 o 5173 estan ocupats, canvia'ls als fitxers de configuració

## Recursos Addicionals

- [Documentació d'Openfort](https://docs.openfort.xyz)
- [Documentació d'Aave](https://docs.aave.com)
- [React + Vite](https://vitejs.dev/guide/)