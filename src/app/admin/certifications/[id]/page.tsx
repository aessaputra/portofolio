"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import CertificateImageEditor from "@/app/admin/components/CertificateImageEditor";

interface Certification {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description?: string;
  tags: string[];
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface EditCertification {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  tags: string;
  featured: boolean;
  displayOrder: number;
}

export default function EditCertificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [certification, setCertification] = useState<Certification | null>(null);
  const [editCertification, setEditCertification] = useState<EditCertification>({
    title: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    imageAlt: "",
    description: "",
    tags: "",
    featured: false,
    displayOrder: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  
  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(() => {
    fetchCertification();
  }, [id]);

  const fetchCertification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/certifications");
      
      if (response.ok) {
        const certifications = await response.json();
        const foundCertification = certifications.find((c: Certification) => c.id === parseInt(id));
        
        if (foundCertification) {
          setCertification(foundCertification);
          setEditCertification({
            title: foundCertification.title,
            issuer: foundCertification.issuer,
            issueDate: foundCertification.issueDate,
            expiryDate: foundCertification.expiryDate || "",
            credentialId: foundCertification.credentialId || "",
            credentialUrl: foundCertification.credentialUrl,
            imageUrl: foundCertification.imageUrl,
            imageAlt: foundCertification.imageAlt,
            description: foundCertification.description || "",
            tags: foundCertification.tags.join(", "),
            featured: foundCertification.featured,
            displayOrder: foundCertification.displayOrder,
          });
        } else {
          setError("Certification not found");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch certification");
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const openImageEditor = () => {
    setShowImageEditor(true);
  };

  const handleImageSave = (imageUrl: string) => {
    setEditCertification({
      ...editCertification,
      imageUrl,
      imageAlt: editCertification.imageAlt || editCertification.title
    });
    setShowImageEditor(false);
    showNotification("Image updated successfully", "success");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setEditCertification({
      ...editCertification,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editCertification.title || !editCertification.issuer || !editCertification.issueDate || 
        !editCertification.credentialUrl || !editCertification.imageUrl || !editCertification.imageAlt) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSaving(true);
      
      // Parse tags from comma-separated string to array
      const tagsArray = editCertification.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const response = await fetch("/api/admin/certifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(id),
          ...editCertification,
          tags: tagsArray,
        }),
      });

      if (response.ok) {
        showNotification("Certification updated successfully", "success");
        setTimeout(() => {
          router.push("/admin/certifications");
        }, 1500);
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update certification: ${errorData.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      showNotification("Error updating certification", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchCertification}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Certification not found</div>
        <button
          onClick={() => router.push("/admin/certifications")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Certifications
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Certification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update certification information
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-md ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editCertification.title}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., AWS Certified Solutions Architect"
                  required
                />
              </div>

              {/* Issuer */}
              <div>
                <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issuer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  value={editCertification.issuer}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., Amazon Web Services"
                  required
                />
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={editCertification.displayOrder}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="0"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="issueDate"
                  name="issueDate"
                  value={editCertification.issueDate}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., January 2023"
                  required
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={editCertification.expiryDate}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., January 2026 (leave empty if no expiry)"
                />
              </div>

              {/* Credential ID */}
              <div>
                <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  id="credentialId"
                  name="credentialId"
                  value={editCertification.credentialId}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., AWS-ASA-12345678"
                />
              </div>

              {/* Credential URL */}
              <div className="sm:col-span-2">
                <label htmlFor="credentialUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credential URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="credentialUrl"
                  name="credentialUrl"
                  value={editCertification.credentialUrl}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="https://example.com/certificate-verification"
                  required
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certificate Image <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={editCertification.imageUrl}
                    onChange={handleInputChange}
                    className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="https://example.com/certificate-image.jpg"
                    required
                  />
                  <button
                    type="button"
                    onClick={openImageEditor}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Edit Image
                  </button>
                </div>
                {editCertification.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                    <div className="h-32 w-32 relative">
                      <Image
                        src={editCertification.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Alt Text */}
              <div className="sm:col-span-2">
                <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="imageAlt"
                  name="imageAlt"
                  value={editCertification.imageAlt}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="Description of the certificate image for accessibility"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={editCertification.description}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="Brief description of the certification and what it represents"
                />
              </div>

              {/* Tags */}
              <div className="sm:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={editCertification.tags}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="e.g., Cloud, AWS, Architecture (comma separated)"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter tags separated by commas
                </p>
              </div>

              {/* Featured */}
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={editCertification.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Feature this certification on the main page
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Update Certification"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <CertificateImageEditor
          currentImageUrl={editCertification.imageUrl}
          certificationId={parseInt(id)}
          onImageSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </>
  );
}