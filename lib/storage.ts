interface StoredImage {
  id: string;
  url: string;
}

const STORAGE_KEY = "instagrid-images";

export const storage = {
  saveImages: (images: StoredImage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error("Error saving images to localStorage:", error);
    }
  },

  loadImages: (): StoredImage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading images from localStorage:", error);
      return [];
    }
  },

  clearImages: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing images from localStorage:", error);
    }
  },
}; 