# Cocktaily — Server

> REST API backend for **Cocktaily**, a social platform for cocktail enthusiasts. Built with Express.js, MySQL, and Socket.IO, featuring recipe moderation, live streaming infrastructure, real-time chat, and push notification delivery.

---

## What is Cocktaily?

Cocktaily is a social app where users share and discover cocktail recipes with video demonstrations. This repository contains the backend that powers **full account management**, a **community interaction layer** (likes, comments), **live streaming sessions**, **admin-moderated recipe approval**, and **real-time statistics** — exposed through a versioned REST API with Socket.IO for real-time features.

---

## Features

### Recipes
- Create, retrieve, and delete cocktail recipes
- Filter approved recipes by alcohol type, name, preparation time, or non-alcoholic flag
- Admin moderation queue: approve or reject pending submissions
- Push notification sent to recipe author on approval or rejection

### Likes & Comments
- Like/unlike recipes with per-user uniqueness enforcement
- Comment on recipes with author attribution

### Live Streaming
- Create and manage live streaming sessions with a generated stream key
- Real-time in-session chat via Socket.IO with message persistence
- Nginx RTMP server with FFmpeg transcoding to adaptive HLS (240p – 720p)

### Statistics
- Monthly user registration chart
- Users grouped by role
- Top recipe creators
- Most popular alcohol types
- Most liked recipes

### Accounts & Auth
- User registration with email verification (6-digit code, 10-minute expiry)
- JWT authentication (1-hour tokens, auto-renewed within 5-second expiry window)
- Role-based access control: `user` and `admin`
- Password hashing with bcrypt
- Profile editing: photo, bio, and personal details

### Push Notifications
- Firebase Cloud Messaging integration
- Device registration/unregistration endpoints for iOS and Android

---

## Architecture

```
api/
├── server.js                  # Entry point — HTTP server + Socket.IO
├── app.js                     # Express setup: CORS, Firebase, Sequelize
├── config/
│   ├── config.json            # Sequelize database config (MySQL)
│   └── claimTypes.js          # JWT claim type constants
├── routes/                    # Express route definitions (12 route groups)
├── controllers/               # Business logic handlers
├── models/                    # Sequelize ORM models (11 models)
├── migrations/                # Database schema migrations
├── seeders/                   # Database seed scripts
├── middleware/
│   └── auth.middleware.js     # JWT validation + role enforcement
├── services/
│   ├── jwtoken.service.js     # JWT generation/verification
│   └── mailer.service.js      # Email via Nodemailer (Gmail SMTP)
├── socket/                    # Socket.IO live-chat handlers
├── tests/                     # Jest + Supertest test suite
└── uploads/                   # User-uploaded files (runtime volume)

files/
└── nginx.conf                 # Nginx RTMP + HLS adaptive streaming config

.github/workflows/
└── build-and-push.yml         # CI/CD: build Docker image and push to Docker Hub

provision-*.yml                # Ansible playbooks for VM provisioning
Vagrantfile                    # 3-VM local environment (MySQL, Nginx, API)
uml/
└── modelo.plantuml            # Entity-relationship diagram (PlantUML)
```

The project follows a layered MVC structure:
- **Routes** declare endpoints and apply middleware
- **Controllers** handle request/response and call models directly
- **Models** (Sequelize) encapsulate data access and associations
- **Services** provide reusable utilities (JWT, email)
- **Middleware** enforces authentication and authorization per route

---

## API Reference

All endpoints are prefixed with `/api/v1/`.

### Auth
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/time` | Admin | Check token remaining time |

### Users
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/users` | Public | Register new user |
| GET | `/users/:id` | Auth | Get user profile |
| PUT | `/users/:id` | Auth | Update user profile |
| PATCH | `/users/:id/change-password` | Auth | Change password |
| DELETE | `/users/:id` | Admin | Delete user account |
| GET | `/users/username/:username` | Auth | Get user by username |

### Cocktails
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/cocktails` | Auth | Submit new recipe |
| GET | `/cocktails` | Public | List approved recipes (filterable) |
| GET | `/cocktails/:id` | Public | Get recipe details |
| GET | `/cocktails/full/:id` | Auth | Get full recipe with all relations |
| GET | `/cocktails/pending` | Admin | Pending moderation queue |
| PATCH | `/cocktails/accept/:id` | Admin | Approve recipe |
| PATCH | `/cocktails/reject/:id` | Admin | Reject recipe with reason |
| DELETE | `/cocktails/:id` | Admin | Delete recipe |

### Comments
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/comments/:cocktailId` | Auth | Add comment |
| GET | `/comments/:cocktailId` | Public | List comments for a recipe |
| DELETE | `/comments/:commentId` | Auth | Delete comment |

### Likes
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/likes/:cocktailId` | Auth | Like a recipe |
| DELETE | `/likes/:cocktailId` | Auth | Unlike a recipe |
| GET | `/likes/:cocktailId/hasLiked` | Auth | Check if current user has liked |

### Live Sessions
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/livesession` | Auth | Create a live session |
| GET | `/livesession` | Public | List active sessions |
| PUT | `/livesession/:id` | Auth | End / update a session |

### Email Verification
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/verification/send` | Public | Send 6-digit code to email |
| POST | `/verification/verify` | Public | Verify code (10-min expiry) |

### Devices (Push Notifications)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/devices` | Auth | Register FCM device token |
| DELETE | `/devices/:deviceId` | Auth | Unregister device |

### Statistics
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/stats/users/month` | Auth | Users registered per month |
| GET | `/stats/users/per-rol` | Auth | Users grouped by role |
| GET | `/stats/liquors/popular` | Auth | Most used alcohol types |
| GET | `/stats/users/top-creators` | Auth | Top recipe creators |
| GET | `/stats/recipe/likes` | Auth | Most liked recipes |

### Health
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/health` | Public | Server health check |

---

## Data Models

| Model | Key Fields |
|-------|-----------|
| **User** | username, email, password\_hash, profile\_picture\_path, bio, role, is\_verified |
| **Cocktail** | name, creation\_steps, preparation\_time, video\_url, image\_url, is\_non\_alcoholic, alcohol\_type, status, user\_id, moderated\_by |
| **Ingredient** | name |
| **CocktailIngredient** | cocktail\_id, ingredient\_id, quantity |
| **Comment** | user\_id, cocktail\_id, text |
| **Like** | user\_id, cocktail\_id |
| **LiveSession** | user\_id, title, stream\_key, url, started\_at, ended\_at |
| **ChatMessage** | session\_id, user\_id, message |
| **DeviceRegistration** | user\_id, device\_id, registration\_token, platform |
| **VerificationRequest** | email, code, expiresAt |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 23 |
| Framework | Express.js 5 |
| Database | MySQL 8 |
| ORM | Sequelize 6 |
| Real-time | Socket.IO 4 |
| Authentication | JWT (jsonwebtoken) |
| Push notifications | Firebase Admin SDK |
| Email | Nodemailer (Gmail SMTP) |
| File upload | Multer |
| Password hashing | bcrypt |
| Video streaming | Nginx RTMP + FFmpeg (HLS) |
| Testing | Jest + Supertest |
| Containerization | Docker |
| Provisioning | Vagrant + Ansible |

---

## Environment Setup

Create a `.env` file inside `api/`:

```
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
SERVICE_ACCOUNT_PATH=path/to/firebase-service-account.json
TRANSMISION_IP=your_streaming_server_ip
NODE_TLS_REJECT_UNAUTHORIZED=0   # disable for local/dev only
PORT=3000
```

Database connection is configured in `api/config/config.json`.

---

## Running Locally

### With Vagrant (full infrastructure)

```bash
vagrant up          # starts MySQL, Nginx RTMP, and API VMs
ansible-playbook provision-mysql.yml
ansible-playbook provision-nginxRMTP.yml
ansible-playbook provision-api.yml
```

### With Docker

```bash
cd api
docker build -t cocktaily-api .
docker run -p 3000:3000 --env-file .env cocktaily-api
```

### Bare Node.js

```bash
cd api
npm install
npx sequelize-cli db:migrate
node server.js
```

---

## Testing

```bash
cd api
npm test
```

Uses Jest with Supertest for integration-level endpoint testing.

---

## CI/CD

Pushing to `main` triggers a GitHub Actions workflow that:
1. Injects secrets into a `.env` file
2. Builds the Docker image
3. Pushes `aquileze/cocktaily-api:latest` to Docker Hub

---

## Streaming Infrastructure

Live sessions use an Nginx RTMP server that:
- Accepts an RTMP stream at `rtmp://<server>:1935/stream/<streamKey>`
- Transcodes via FFmpeg to five HLS variants (240p, 360p, 480p, 720p, source)
- Serves HLS playlists over HTTP for adaptive bitrate playback on the client

---

## Team

- [@carimvch33](https://github.com/carimvch33)
- [@AquilezE](https://github.com/AquilezE)
- [@marco1gk](https://github.com/marco1gk)
