"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CertificateImageEditor from "@/features/certifications/admin/components/CertificateImageEditor";
import { resolveR2Url } from "@/shared/lib/r2UrlManager";
import ConfirmationDialog from "@/shared/ui/ConfirmationDialog";
import type { Certification } from "@/entities/certifications";
import {
  deleteCertificationAction,
  listCertificationsAction,
} from "@/features/certifications/admin/actions";

export default function AdminCertificationsPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  
  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageEditorCertificationId, setImageEditorCertificationId] = useState<number | null>(null);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [certificationToDelete, setCertificationToDelete] = useState<Certification | null>(null);

  const [, startTransition] = useTransition();

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadCertifications = useCallback(() => {
    setLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const data = await listCertificationsAction();
        setCertifications(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to fetch certifications:", error);
        showNotification(`Failed to fetch certifications: ${message}`, "error");
        setError(message);
      } finally {
        setLoading(false);
      }
    });
  }, [showNotification, startTransition]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const handleDeleteCertification = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    try {
      await deleteCertificationAction(id);
      setCertifications((current) => current.filter((cert) => cert.id !== id));
      showNotification("Certification deleted successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to delete certification: ${message}`, "error");
    }
  };

  const handleCertificationClick = (certificationId: number) => {
    router.push(`/admin/certifications/${certificationId}`);
  };

  const handleImageEdit = (certification: Certification) => {
    setCurrentImageUrl(certification.imageUrl);
    setImageEditorCertificationId(certification.id);
    setShowImageEditor(true);
  };

  const handleImageSave = async (imageUrl: string) => {
    if (!imageEditorCertificationId) return;

    try {
      // Update the certification with new image URL
      setCertifications((current) =>
        current.map((cert) =>
          cert.id === imageEditorCertificationId
            ? { ...cert, imageUrl }
            : cert
        )
      );
      setShowImageEditor(false);
      setImageEditorCertificationId(null);
      setCurrentImageUrl("");
    } catch (error) {
      console.error("Failed to update certification image:", error);
      showNotification("Failed to update certification image", "error");
    }

    showNotification("Image updated successfully", "success");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`rounded-md p-4 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Certifications Management Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Certifications Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your professional certifications</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/admin/certifications/new"
                  className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Certification
                </Link>
              </div>
            </div>
          </div>

          {/* Certifications List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
                <div className="text-lg text-gray-700 dark:text-gray-300">
                  Loading certifications...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <button
                onClick={loadCertifications}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {certifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    No certifications found.
                  </div>
                  <Link
                    href="/admin/certifications/new"
                    className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Add your first certification
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certifications.map((certification) => {
                    const imageSrc = resolveR2Url(certification.imageUrl);
                    // Check if certification is expired or expiring soon
                    const isExpired = certification.expiryDate ? new Date(certification.expiryDate) < new Date() : false;
                    const isExpiringSoon = certification.expiryDate ?
                      new Date(certification.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                      new Date(certification.expiryDate) >= new Date() : false;
                    
                    return (
                      <div
                        key={certification.id}
                        className={`rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer dark:bg-gray-800 ${
                          isExpired ? 'border-red-300 dark:border-red-700' :
                          isExpiringSoon ? 'border-yellow-300 dark:border-yellow-700' :
                          'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => handleCertificationClick(certification.id)}
                      >
                        {/* Certification Image */}
                        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                          <Image
                            className="h-full w-full object-cover"
                            src={imageSrc}
                            alt={certification.imageAlt}
                            width={400}
                            height={192}
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/400x192?text=Certificate+Image";
                            }}
                          />
                          <div className="absolute top-2 right-2 flex flex-col space-y-1">
                            {certification.featured && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                <svg className="-ml-0.5 mr-1 h-2 w-2 text-green-800 dark:text-green-300" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                Featured
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                                <svg className="-ml-0.5 mr-1 h-2 w-2 text-red-800 dark:text-red-300" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                Expired
                              </span>
                            )}
                            {isExpiringSoon && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                                <svg className="-ml-0.5 mr-1 h-2 w-2 text-yellow-800 dark:text-yellow-300" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                Expiring Soon
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Certification Content */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {certification.title}
                            </h3>
                          </div>
                          
                          <div className="mb-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                              {certification.issuer}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 overflow-hidden">
                            {certification.description || "No description available."}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Issued: {new Date(certification.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageEdit(certification);
                                }}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                title="Edit image"
                              >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCertification(certification.id);
                                }}
                                className="inline-flex items-center rounded-lg border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Delete certification"
                              >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <CertificateImageEditor
          currentImageUrl={currentImageUrl}
          onCancel={() => {
            setShowImageEditor(false);
            setImageEditorCertificationId(null);
            setCurrentImageUrl("");
          }}
          onImageSave={handleImageSave}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && certificationToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Certification"
          message={`Are you sure you want to delete "${certificationToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive
          onCancel={() => {
            setShowDeleteDialog(false);
            setCertificationToDelete(null);
          }}
          onConfirm={() => {
            if (certificationToDelete) {
              handleDeleteCertification(certificationToDelete.id);
              setShowDeleteDialog(false);
              setCertificationToDelete(null);
            }
          }}
        />
      )}
    </>
  );
}