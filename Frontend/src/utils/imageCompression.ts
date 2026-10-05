export const compressImage = (file: File, maxSizeKB: number = 2048): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      let quality = 0.9;
      
      // Resize if too large
      const maxDimension = 800;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const compress = () => {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else if (quality > 0.1) {
            quality -= 0.1;
            compress();
          } else {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', quality);
      };
      
      compress();
    };
    
    img.src = URL.createObjectURL(file);
  });
};