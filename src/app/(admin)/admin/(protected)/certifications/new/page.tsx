"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CertificateImageEditor from "@/features/certifications/admin/components/CertificateImageEditor";
import { resolveR2Url } from "@/shared/lib/r2UrlManager";
import {
  CertificationFormState,
  createEmptyCertificationFormState,
  formStateToCertificationInput,
} from "@/features/certifications/admin/types";
import { createCertificationAction } from "@/features/certifications/admin/actions";

export default function NewCertificationPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCertification, setNewCertification] = useState<CertificationFormState>(
    createEmptyCertificationFormState()
  );
  
  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const isCheckbox = type === "checkbox";
    const isNumericField = name === "displayOrder";

    let nextValue: string | number | boolean = value;
    if (isCheckbox) {
      nextValue = (event.target as HTMLInputElement).checked;
    } else if (isNumericField) {
      const parsedValue = Number(value);
      nextValue = value === "" || Number.isNaN(parsedValue) ? 0 : parsedValue;
    }

    setNewCertification((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCertification.title || !newCertification.issuer || !newCertification.issueDate || 
        !newCertification.credentialUrl || !newCertification.imageUrl || !newCertification.imageAlt) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = formStateToCertificationInput(newCertification);
      await createCertificationAction(payload);

      showNotification("Certification created successfully", "success");
      setTimeout(() => {
        router.push("/admin/certifications");
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to create certification: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const openImageEditor = () => {
    setShowImageEditor(true);
  };

  const handleImageSave = (imageUrl: string) => {
    const normalizedImageUrl = resolveR2Url(imageUrl);
    setNewCertification((current) => ({
      ...current,
      imageUrl: normalizedImageUrl,
      imageAlt: current.imageAlt || current.title,
    }));
    setShowImageEditor(false);
    showNotification("Image uploaded successfully", "success");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Certification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new professional certification
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
                  value={newCertification.title}
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
                  value={newCertification.issuer}
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
                  value={newCertification.displayOrder}
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
                  value={newCertification.issueDate}
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
                  value={newCertification.expiryDate}
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
                  value={newCertification.credentialId}
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
                  value={newCertification.credentialUrl}
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
                    value={newCertification.imageUrl}
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
                    Upload Image
                  </button>
                </div>
                {newCertification.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                    <div
                      className="relative w-48 overflow-hidden rounded-md"
                      style={{ aspectRatio: "3 / 2" }}
                    >
                      <Image
                        src={resolveR2Url(newCertification.imageUrl)}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
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
                  value={newCertification.imageAlt}
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
                  value={newCertification.description}
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
                  value={newCertification.tags}
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
                    checked={newCertification.featured}
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
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Certification"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <CertificateImageEditor
          currentImageUrl={newCertification.imageUrl}
          onImageSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </>
  );
}
