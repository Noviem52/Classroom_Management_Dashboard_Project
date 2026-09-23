declare global {
  interface Window {
    cloudinary: any;
  }
}

export type BannerUploadResult = {
  banner_url: string;
  banner_cld_pub_id: string;
};

/**
 * Opens the Cloudinary upload widget.
 * Resolves with the uploaded image info, or with `null` if the user closes the widget
 * without uploading. Rejects on a real upload error.
 */
export function openBannerUpload(): Promise<BannerUploadResult | null> {
  return new Promise((resolve, reject) => {
    if (!window.cloudinary?.createUploadWidget) {
      reject(new Error("Cloudinary widget script did not load. Check your internet connection or index.html."));
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      reject(new Error("Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in client/.env"));
      return;
    }

    let finished = false;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url"],
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5_000_000, // 5 MB
      },
      (error: any, result: any) => {
        if (error) {
          if (!finished) {
            finished = true;
            reject(new Error(error?.statusText || error?.message || "Upload failed"));
          }
          return;
        }

        if (result?.event === "success") {
          finished = true;
          resolve({
            banner_url: result.info.secure_url,
            banner_cld_pub_id: result.info.public_id,
          });
          widget.close();
        }

        if (result?.event === "close" && !finished) {
          finished = true;
          resolve(null); // user closed without uploading
        }
      }
    );

    widget.open();
  });
}