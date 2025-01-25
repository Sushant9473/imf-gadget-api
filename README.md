# 🚀 IMF Gadget API | Phoenix IMF Assignment

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-informational)
![JWT](https://img.shields.io/badge/JWT-Auth-orange)
![Swagger](https://img.shields.io/badge/Swagger-Docs-brightgreen)

**A secure API for managing classified gadgets**  
*"Your mission, should you choose to accept it..."* 💼🔫

---

## Live Documentation

### [🔗 Swagger UI](https://imf-gadget-api-zy90.onrender.com/api-docs/) - Hosted the backend on Render

## 🌟 Key Features

- 🔒 **JWT Authentication** (Register/Login)
- 🛠️ **Gadget Management** (CRUD Operations)
- 💣 **Self-Destruct Sequence** with Random Confirmation Code
- 🎲 **Mission Success Probability** (Random % for Each Gadget)
- 🕰️ **Soft Deletes** (Decommission Timestamp)
- 🔍 **Status Filtering** (`/gadgets?status=Deployed`)
- 📚 **Auto-Generated Swagger Documentation**

---

## 📡 API Endpoints

| Endpoint                       | Method  | Description                        |
|--------------------------------|---------|------------------------------------|
| `/auth/register`               | POST    | Create new agent account          |
| `/auth/login`                  | POST    | Get JWT token                     |
| `/gadgets`                     | GET     | List all gadgets + success %      |
| `/gadgets`                     | POST    | Add new gadget                    |
| `/gadgets/{id}`                | PATCH   | Update gadget details             |
| `/gadgets/{id}`                | DELETE  | Decommission gadget               |
| `/gadgets/{id}/self-destruct`  | POST    | Initiate self-destruct sequence   |


## 🛠️ Tech Stack

| **Technology**       | **Purpose**                     |
|-----------------------|---------------------------------|
| <img src="https://img.icons8.com/color/48/nodejs.png" width="20"> Node.js | Runtime Environment |
| <img src="https://img.icons8.com/color/48/express-js.png" width="20"> Express | Web Framework |
| <img src="https://prismalens.vercel.app/header-logo-dark.svg" width="20"> Prisma | ORM |
| <img src="https://img.icons8.com/color/48/postgreesql.png" width="20"> PostgreSQL | Database |
| <img src="https://jwt.io/img/pic_logo.svg" width="20"> JWT | Authentication |
| <img src="https://img.icons8.com/clouds/48/000000/render.png" width="20"> Render | Deployment |

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/imf-gadget-api.git
cd imf-gadget-api
npm install
```

### 2. Configure Environment
```bash
# Create .env file in the root directory
DATABASE_URL="postgresql://user:pass@localhost:5432/imf_gadgets?schema=public"
ACCESS_TOKEN_SECRET="your_super_secret_key_here"
```

### 3. Database Setup
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Server
```bash
npm start
```

Server running on http://localhost:3000 🚨
