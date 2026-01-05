# Student Portfolio Dashboard & Public Site 🎓💻

A full-stack portfolio platform for students to **manage their own content** (profile, projects, experience, awards) via a private dashboard and expose a polished, **public-facing portfolio** for recruiters and peers.

Built with **React**, **Redux**, **Node/Express**, and **MySQL**, this project was developed as an HCI capstone focused on **UX/UI, content control, and clean information architecture**.

---

## 🧱 Tech Stack

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Redux](https://img.shields.io/badge/State-Redux-764ABC?logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/API-Express-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4?logo=axios&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)

![Status](https://img.shields.io/badge/Status-Active-success)

---

## ✨ Core Features

### 1. Private Dashboard (Student View) 🔐

Accessible after login (Redux holds the authenticated `auth.user` object), the dashboard lets the student manage all portfolio content:

- **Dashboaard Landing Page**
  - Navigation cards to the Profile, Projects, Experiences and Awards pages.
<br>
  <img width="1918" height="860" alt="image" src="https://github.com/user-attachments/assets/756672a0-e358-4a4b-887a-42e850b2b6a8" />
<br>
<br>

- **Profile**
  - Bio
  - GitHub URL
  - LinkedIn URL
  - Resume upload (stored as a **Base64 data URL**)
  - Profile picture upload (also stored as Base64)
<br>
  <img width="1918" height="867" alt="image" src="https://github.com/user-attachments/assets/1be8bcb2-74f3-4309-9d96-709649dd6aef" />
<br>
<br>

- **Projects**
  - Title
  - Short summary and detailed description
  - Tech stack and tags
  - Live URL
  - **Publish / Unpublish toggle** (controls what appears on the public site)
<br>
  <img width="1918" height="867" alt="image" src="https://github.com/user-attachments/assets/912ceb8d-5b4d-4cf5-8e00-6cea7e9e98ff" />
  <img width="1918" height="570" alt="image" src="https://github.com/user-attachments/assets/6ebb0e04-521d-46c6-a938-07b471770e1b" />
<br>
<br>

- **Experience**
  - Company name
  - Position title
  - Description
  - **Publish / Unpublish toggle**
<br>
  <img width="1918" height="832" alt="image" src="https://github.com/user-attachments/assets/31fb2b50-4637-41db-8501-2eead7e4535f" />
<br>
<br>

- **Awards**
  - Award title
  - Issuer
  - Issued date
  - Description
  - **Publish / Unpublish toggle**
<br>
  <img width="1918" height="867" alt="image" src="https://github.com/user-attachments/assets/3c41e8ac-eaf7-437d-8a13-491228814a8c" />
<br>

Each section uses **Axios** to talk to the Node/Express backend, which persists data in **MySQL**.

---

### 2. Public Portfolio Page 🌐

A separate React page shows a **read-only, public version** of the portfolio for a specific student.

- Reads data via `/public/...` routes using a configured `PUBLIC_EMAIL`.
- Only shows rows where `is_published = 1`, so the student can keep drafts hidden.
- Clean, UX-focused layout:
  - **Header** with profile photo, name, tagline, GitHub & LinkedIn links.
  - **Experience carousel**:
    - Experience cards in a horizontally scrollable row.
    - Left/right arrow buttons to scroll by a fixed pixel amount.
  - **Projects carousel**:
    - Similar scrollable row of project cards.
    - Cards expand slightly (`scale-105`) on hover for a tactile feel.
  - **Awards strip**:
    - Award titles displayed in a marquee/slide-in style, one-by-one.
  - **About Me section**:
    - Student bio slides in from the side using CSS animations.
   
<img width="1918" height="865" alt="image" src="https://github.com/user-attachments/assets/f1972359-43ee-4874-8693-260d4aaaca0b" />
<img width="1918" height="697" alt="image" src="https://github.com/user-attachments/assets/935c6199-c06a-4142-becd-0ce0fa79e2bd" />
<img width="1918" height="797" alt="image" src="https://github.com/user-attachments/assets/725b06f9-51c5-4e46-8ce6-c8da0fb20a84" />
<img width="1918" height="752" alt="image" src="https://github.com/user-attachments/assets/dd0157ab-2f31-4605-bfdc-8497f260bfa3" />





The public page is focused on being **simple, scannable, and recruiter-friendly**.

---

### 3. Public vs Private Routing 🧭

The backend exposes two sets of routes:

#### Private Dashboard Routes (used by the logged-in student)

Examples:

- `GET /profile?email=...`
- `POST /profile`
- `GET /experiences?email=...`
- `POST /experiences`
- `PATCH /experiences/:id/publish`
- `GET /projects?email=...`
- `POST /projects`
- `PATCH /projects/:id/publish`
- `GET /awards?email=...`
- `POST /awards`
- `PATCH /awards/:id/publish`

These routes:

1. Expect an `email` value in the request (usually `authUser.email` from Redux).
2. Look up `user_id` in the `users` table using that email.
3. Return **all** records for that user (published or not) so the student can manage everything.
4. Allow toggling `is_published` via `PATCH` routes.

> Note: In this version, “private” is enforced by the **frontend** (only the dashboard calls these). A production version would add proper auth middleware.

#### Public Portfolio Routes (used by visitors)

Examples:

- `GET /public/profile?email=...`
- `GET /public/projects?email=...`
- `GET /public/experiences?email=...`
- `GET /public/awards?email=...`

These routes:

1. Take a public `email` for **whose portfolio** to show.
2. Find that user’s `user_id`.
3. Return **only rows where `is_published = 1`**.
4. Omit drafts/unpublished items from the public view.

---

## 🧠 Data Model Overview

Core tables involved:

- `users`
  - `id`, `email`, `profile_name`, etc.
- `profiles`
  - `user_id`, `bio`, `resume_url`, `github_url`, `linkedin_url`, `profile_picture_url`, timestamps.
- `projects`
  - `user_id`, `title`, `short_summary`, `description_md`, `tech_stack`, `live_url`, `is_published`, timestamps.
- `experiences`
  - `user_id`, `company_name`, `position_title`, `description`, `is_published`, timestamps.
- `awards`
  - `user_id`, `title`, `issuer`, `issued_date`, `description`, `is_published`, timestamps.
- Optional: `tags`, `project_tags`
  - Many-to-many relation between projects and tags.

Images (profile picture) and documents (resume) are stored as **Base64 data URLs** directly in the `profiles` table. This simplifies early development (no separate file hosting) at the cost of DB size.

---

## 🧩 Frontend Highlights

- **React functional components** with hooks:
  - `useState` for form fields and local UI state.
  - `useEffect` for loading data on mount (e.g., `useEffect(() => { axios.get(...) }, [])`).
  - `useRef` for scrollable carousels (experience/projects).
- **Redux**:
  - `useSelector((state) => state.auth.user)` to get the logged-in user’s `email` and `profileName`.
- **Axios**:
  - `axios.get()` with query params (`{ params: { email } }`).
  - `axios.post()` for creating/updating records.
  - `axios.patch()` for toggling publish status.
- **Tailwind CSS**:
  - Layout utilities (`flex`, `grid`, `gap`, `mx-auto`, `px-8`, etc.).
  - Responsive design classes (`md:`, `lg:`).
  - Custom colors for brand feel (e.g. `bg-[#7f97a3]`, `text-[#8d9b6a]`).
- **Animations**:
  - Slide-in classes for header image and text.
  - Bio text sliding in using a custom CSS animation.
  - Hover scale effect on `ProjectCard`.

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

Install frontend dependencies:

```bash
cd client   # or whatever your frontend folder is named
npm install
```


Install backend dependencies:

```bash
cd ../server  # or your backend folder
npm install
```

### 2. Configure Database

Create a MySQL database and update your backend config:

```bash
// in server/index.js or db config file
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',
  database: 'portfolio_db',
});
```

Run your table creation SQL (users, profiles, projects, experiences, awards, tags, project_tags, etc.).

Make sure you have at least one user row with the email you want to use as the portfolio owner.


### 3. Set the Public Portfolio Email (Frontend)

In the public React app, there is a constant similar to:
```bash
const PUBLIC_EMAIL = 'youremail@gmail.com';
```

Change this to the email of the user whose portfolio should be shown publicly.

### 4. Run Backend

From the server directory:
```bash
node index.js
```

This should start the Express server on http://localhost:8080 (or whatever port you configured).

### 5. Run Frontend

From the client (React) directory:
```bash
npm run dev   
```
Then open the URL printed to the console (e.g. http://localhost:5173 or http://localhost:3000).

---

## 🧪 Example Flows
### A. Updating Profile on the Dashboard

#### 1. Log in as a user (Redux sets auth.user).
#### 2. Go to /profile.
#### 3. Fill in:

- Bio

- GitHub URL

- LinkedIn URL

- Upload profile picture and resume

#### 4. Click Save Profile → POST /profile:

- Backend finds `user_id` by email.

- Inserts or updates a row in profiles.

- Public portfolio now uses this profile in /public/profile?email=....

### B. Adding an Experience

#### 1. On /experience, fill in:
- Company name
- Position title
- Description


#### 2. Click Save Experience → `POST /experiences`.
#### 3. Experience is created with `is_published = 0` by default (hidden from public).
#### 4. Click Publish → `PATCH /experiences/:id/publish { isPublished: true }`.
#### 5. Public portfolio (`/public/experiences`) now includes it.

---

## 🔮 Future Improvements

### Some planned or potential enhancements:

**Real authentication & authorization**

- Use JWT or session cookies.

- Add middleware to protect private routes and verify the logged-in user matches the requested email.

**Custom handles instead of email in URL**

- e.g. `/public/lami-ux` instead of relying on query `email`.

**Cloud-native file storage**

- Move away from Base64 in the DB.

- Use S3/Cloudinary/etc. and store only URLs in MySQL.

**Multi-student support**

- Admin dashboard listing all students.

- Each student configurable with their own public portfolio link.

**Themes & customization**

- Multiple color themes/layouts switchable from the dashboard.

**Better accessibility**

- ARIA labels for carousels and buttons.

- Keyboard-friendly navigation for the scrollable sections.

**Deployment**

- Deploy backend to Render/Railway/AWS.

- Deploy frontend to Netlify/Vercel.

- Use environment variables instead of hard-coded URLs/emails.
