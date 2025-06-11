# InstaGrid Previewer

InstaGrid Previewer is an offline-capable web application built with Next.js and Tailwind CSS that allows users to easily arrange and preview their Instagram grid layouts. It provides features like image upload via drag-and-drop, interactive reordering, image cropping, and exporting the final grid as a high-quality image.

## Features

- **Image Upload:** Drag-and-drop images or select from your file system.
- **Instagram-style Grid:** Displays images in a 3-column grid, similar to Instagram.
- **Drag-to-Rearrange:** Effortlessly reorder images within the grid using intuitive drag-and-drop functionality (powered by `dnd-kit`).
- **Image Cropping:** Crop images to specific aspect ratios (1:1, 4:5, 1.91:1) with a dedicated cropping tool (`react-easy-crop`).
- **Live Preview:** See your grid instantly update as you add, rearrange, or crop images.
- **Mobile Mockup Frame:** Preview your grid within a mobile phone frame to see how it looks on a device.
- **Light/Dark Mode:** Toggle between light and dark themes.
- **High-Quality Export:** Export your entire grid as a single, clear image (PNG or JPEG), matching the displayed cropped view. The export filename includes a timestamp for uniqueness.
- **Offline Capability (PWA Ready):** Designed to work offline using a service worker (though image persistence to local storage was removed to handle large images).

## Technologies Used

- **Framework:** Next.js
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Drag & Drop:** `@dnd-kit`
- **Image Cropping:** `react-easy-crop`
- **Image Export:** `html2canvas`
- **UI Components:** Shadcn UI

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites

Make sure you have the following installed:

- **Node.js:** (LTS version recommended)
- **pnpm:** If you don't have pnpm installed, you can install it via npm:
  ```bash
  npm install -g pnpm
  ```

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/instagrid-previewer.git
    cd instagrid-previewer
    ```

    (Replace `YOUR_USERNAME/instagrid-previewer.git` with the actual URL of your GitHub repository once you've pushed it).

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Running Locally

To start the development server:

```bash
pnpm dev
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal) in your browser to view the application.

### Building for Production

To build the application for production:

```bash
pnpm build
```

This command optimizes the project for deployment, creating an optimized build in the `.next` folder.

### Starting Production Server (Local)

To run the production build locally:

```bash
pnpm start
```

## Deployment

This application is designed to be easily deployable to platforms like [Vercel](https://vercel.com/) (recommended for Next.js projects) or Netlify due to its static export capabilities.

**To deploy to Vercel:**

1.  Ensure your project is pushed to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Go to [vercel.com](https://vercel.com/) and log in.
3.  Click "New Project" and import your Git repository.
4.  Vercel will automatically detect the Next.js framework and configure the build settings.
5.  Click "Deploy". Your app will be live within minutes.
