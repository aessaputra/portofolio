"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import NextImage from "next/image";
import { Button } from "@/shared/ui/button";
import {
  deleteCertificationImageAction,
  uploadCertificationImageAction,
} from "@/features/certifications/admin/actions";
import { resolveR2PublicUrl } from "@/shared/lib/r2PublicUrl";

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for certificates
const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const PROGRESS_INTERVAL = 200; // ms
const OPTIMAL_WIDTH = 1200; // Optimal width for certificate images
const OPTIMAL_HEIGHT = 800; // Optimal height for certificate images
const RECOMMENDED_ASPECT_RATIO = 3/2; // Recommended aspect ratio for certificate images

interface CertificateImageEditorProps {
  currentImageUrl: string;
  certificationId?: number;
  onImageSave: (imageUrl: string) => void;
  onCancel: () => void;
}

export default function CertificateImageEditor({
  currentImageUrl,
  certificationId,
  onImageSave,
  onCancel,
}: CertificateImageEditorProps) {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMetadata, setPreviewMetadata] = useState<{
    width: number;
    height: number;
    recommended: boolean;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const normalizedCurrentImageUrl = resolveR2PublicUrl(currentImageUrl);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl) {
      setPreviewMetadata(null);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const aspectRatio = width / height;
      const isAspectRatioRecommended = Math.abs(aspectRatio - RECOMMENDED_ASPECT_RATIO) < 0.2;

      setPreviewMetadata({ width, height, recommended: isAspectRatioRecommended });
    };
    image.src = previewUrl;
  }, [previewUrl]);

  // File validation helpers
  const isValidFileType = (file: File): boolean => {
    return VALID_IMAGE_TYPES.includes(file.type);
  };

  const isValidFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Image optimization function
  const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      setIsOptimizing(true);
      
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const aspectRatio = width / height;
        
        // Check if aspect ratio is close to recommended
        const aspectRatioDiff = Math.abs(aspectRatio - RECOMMENDED_ASPECT_RATIO);
        const isAspectRatioRecommended = aspectRatioDiff < 0.2;
        
        // Only resize if the image is larger than optimal dimensions
        if (width > OPTIMAL_WIDTH || height > OPTIMAL_HEIGHT) {
          if (width > height) {
            width = OPTIMAL_WIDTH;
            height = Math.round(width / aspectRatio);
          } else {
            height = OPTIMAL_HEIGHT;
            width = Math.round(height * aspectRatio);
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        if (ctx) {
          // Apply a slight sharpening filter for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determine optimal quality based on file size
          let quality = 0.85; // Default quality
          if (file.size > 5 * 1024 * 1024) { // If larger than 5MB
            quality = 0.75;
          } else if (file.size > 3 * 1024 * 1024) { // If larger than 3MB
            quality = 0.8;
          }
          
          // Convert to blob with optimized quality
          canvas.toBlob(
            (blob) => {
              setIsOptimizing(false);
              if (blob) {
                // Add aspect ratio info to the blob for later use
                (blob as any).aspectRatio = aspectRatio;
                (blob as any).isAspectRatioRecommended = isAspectRatioRecommended;
                resolve(blob);
              } else {
                reject(new Error('Failed to optimize image'));
              }
            },
            file.type,
            quality
          );
        } else {
          setIsOptimizing(false);
          reject(new Error('Failed to get canvas context'));
        }
      };
      
      img.onerror = () => {
        setIsOptimizing(false);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Event handlers
  const handleFileSelect = async (file: File) => {
    setError(null);
    setWarning(null);

    if (!isValidFileType(file)) {
      setError("Please select an image file (PNG, JPG, JPEG, or WebP)");
      return;
    }
    
    if (!isValidFileSize(file)) {
      setError("File size must be less than 10MB");
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setPreviewUrl(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload");
      return;
    }

    setError(null);
    setWarning(null);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Optimize image before upload
      let fileToUpload = selectedFile;
      let optimizationStats = null;
      
      if (selectedFile.size > 2 * 1024 * 1024) { // Only optimize if larger than 2MB
        try {
          const originalSize = selectedFile.size;
          const optimizedBlob = await optimizeImage(selectedFile);
          fileToUpload = new File([optimizedBlob], selectedFile.name, {
            type: selectedFile.type,
            lastModified: Date.now(),
          });
          
          const optimizedSize = fileToUpload.size;
          const reductionPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
          
          optimizationStats = {
            originalSize: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
            optimizedSize: (optimizedSize / 1024 / 1024).toFixed(2) + 'MB',
            reductionPercent: reductionPercent + '%'
          };
          
          console.log('Image optimization stats:', optimizationStats);
        } catch (optimizationError) {
          console.warn('Image optimization failed, uploading original:', optimizationError);
          // Continue with original file if optimization fails
        }
      }
      
      const formData = new FormData();
      formData.append("image", fileToUpload);
      if (certificationId) {
        formData.append("certificationId", certificationId.toString());
      }

      startTransition(() => {
        void (async () => {
          try {
            setUploadProgress(50);
            const result = await uploadCertificationImageAction(formData);
            if (result.warning) {
              setWarning(result.warning);
            }
            setUploadProgress(100);
            const resolvedUploadUrl = resolveR2PublicUrl(result.imageUrl);
            onImageSave(resolvedUploadUrl);

            const previousImageUrl = resolveR2PublicUrl(currentImageUrl);
            if (previousImageUrl && previousImageUrl !== resolvedUploadUrl) {
              const deleteFormData = new FormData();
              deleteFormData.append("imageUrl", previousImageUrl);
              await deleteCertificationImageAction(deleteFormData).catch((deleteError) => {
                console.error("Error deleting previous image:", deleteError);
                setWarning(
                  deleteError instanceof Error
                    ? deleteError.message
                    : "Previous image could not be removed."
                );
              });
            }
            clearSelection();
          } catch (actionError) {
            console.error("Error uploading image:", actionError);
            setError(actionError instanceof Error ? actionError.message : "An unknown error occurred");
          } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 500);
          }
        })();
      });
    } catch (error) {
      console.error("Error preparing image upload:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileSelect();
    }
  };

  // Render components
  const renderUploadArea = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Certificate Image
        </label>
        {selectedFile && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Clear selected image"
          >
            Clear
          </button>
        )}
      </div>
      <div
        className={`relative flex items-center justify-center w-full aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : isFocused
            ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
            : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload image area"
        aria-describedby="upload-description"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onSelectFile}
          aria-label="Select image file"
        />
        
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center p-6 text-center cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-105">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Click to upload</span> or drag and drop
            </p>
            <p id="upload-description" className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, JPEG, or WebP (MAX. 10MB)
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full group">
            <NextImage
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
              <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click to change
              </span>
            </div>
            {(isUploading || isOptimizing) && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-3">
                    <svg className="animate-spin h-full w-full text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-48 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mx-auto">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-white text-sm font-medium">
                    {isOptimizing ? (
                      "Optimizing image..."
                    ) : (
                      <>
                        {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : "Finalizing..."}
                      </>
                    )}
                  </p>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <p className="text-gray-300 text-xs mt-1">
                      Please don&apos;t close this window
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentImage = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Current Certificate Image
      </label>
      <div className="relative flex items-center justify-center w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        {normalizedCurrentImageUrl ? (
          <NextImage
            src={normalizedCurrentImageUrl}
            alt="Current certificate"
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              No certificate image set
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileDetails = () => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected File Details
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p className="break-words"><span className="font-medium">Name:</span> {selectedFile?.name}</p>
            <p><span className="font-medium">Size:</span> {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
            <p><span className="font-medium">Type:</span> {selectedFile?.type}</p>
            <p>
              <span className="font-medium">Dimensions:</span>
              {previewUrl ? (
                previewMetadata ? (
                  <span className="ml-1">
                    {previewMetadata.width} × {previewMetadata.height}px
                    <span
                      className={`ml-2 ${
                        previewMetadata.recommended
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {previewMetadata.recommended ? "(✓ Recommended)" : "(⚠ Not optimal)"}
                    </span>
                  </span>
                ) : (
                  <span className="ml-1">Loading...</span>
                )
              ) : (
                "Loading..."
              )}
            </p>
            <p><span className="font-medium">Recommended Aspect Ratio:</span> 3:2 (1.5)</p>
            {isOptimizing && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Optimizing image for web...</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
          aria-label="Clear selected image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Modal Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Certificate Image
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload a new certificate image. Recommended aspect ratio is 3:2.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isUploading || isOptimizing}
                className="px-4 py-2 text-sm font-medium h-10 w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Cancel image editing"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || isOptimizing}
                className="px-4 py-2 text-sm font-medium h-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload image"
              >
                {(isUploading || isOptimizing) ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isOptimizing ? "Optimizing..." : "Uploading..."}
                  </span>
                ) : (
                  "Save Image"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-gray-800">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {warning && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg" role="status">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l5.516 9.814C17.99 14.853 17.048 16 15.772 16H4.228c-1.276 0-2.218-1.147-1.487-3.087l5.516-9.814zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</span>
              </div>
            </div>
          )}

          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderUploadArea()}
            {renderCurrentImage()}
          </div>

          {selectedFile && renderFileDetails()}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Tip:</span> For best results, use a high-quality image with a 3:2 aspect ratio (1200x800px recommended). Images larger than 2MB will be automatically optimized. Supported formats: JPEG, PNG, WebP (max 10MB).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
