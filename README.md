# Blog Frontend (React + Vite)

A modern, fast, and responsive frontend for my personal portfolio and blog, built with React, Vite, and Framer Motion.

## ✨ Features

- **Custom UI/UX:** Clean, light-mode design with a purple accent theme.
- **Smooth Animations:** Page transitions, skeleton loaders, and an animated "API Wake Screen" for handling backend cold starts.
- **Dynamic Content:**
  - **Writing:** Blog posts with custom views (`inline`, `commandbar`, `drawer`), tags, and pagination.
  - **Projects:** Split-layout design showing project details and external links.
  - **Uses:** Data-driven list of my workspace, development, and productivity tools.
  - **Now:** A status page inspired by nownownow.com.
  - **Bookmarks:** Saved links and resources.

- **Admin Features:** In-line editing controls for the blog owner to create, update, and manage content seamlessly.

## 🚀 Future Roadmap

- **Gallery Page:** A dedicated page to display photos in a modern "bento" style grid.
- **Cloudinary Integration (UI):** 
  - Admin interface to upload images directly to Cloudinary.
  - Ability to upload gallery photos (displayed publicly) or hidden assets (specifically meant to be embedded in blog posts).
  - Image management dashboard linking uploaded images with their descriptions and URLs.

## 🛠 Tech Stack

- React 18
- Vite
- React Router v6
- Framer Motion
- React Bootstrap
- FontAwesome

## ⚙️ Configuration

The frontend uses environment variables (in `.env`) for configuration:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_EXTERNAL_LINK=https://apqdiaz.online

# Writing page controls
VITE_WRITING_CONTROL_STYLE=inline
VITE_WRITING_DEFAULT_VIEW=editorial
VITE_WRITING_DEFAULT_SORT=newest
VITE_WRITING_POSTS_PER_PAGE=5
```