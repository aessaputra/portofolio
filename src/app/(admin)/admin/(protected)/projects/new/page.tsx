"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createEmptyProjectFormState,
  formStateToProjectInput,
  type ProjectFormState,
} from "@/features/projects/admin/types";
import {
  createProjectAction,
  deleteProjectImageAction,
  uploadProjectImageAction,
} from "@/features/projects/admin/actions";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteImageConfirmation, setShowDeleteImageConfirmation] = useState(false);
  
  const [formData, setFormData] = useState<ProjectFormState>(createEmptyProjectFormState());
  const [, startTransition] = useTransition();

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

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const payload = new FormData();
    payload.append("image", file);

    startTransition(() => {
      void (async () => {
        try {
          const result = await uploadProjectImageAction(payload);
          setFormData((prevFormData) => ({
            ...prevFormData,
            imageUrl: result.imageUrl,
            imageAlt: prevFormData.imageAlt || prevFormData.title || file.name,
          }));

          const successMessage = result.warning
            ? `Image uploaded successfully. ${result.warning}`
            : "Image uploaded successfully";

          showNotification(successMessage, "success");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error uploading image";
          showNotification(message, "error");
        } finally {
          setUploading(false);
        }
      })();
    });
  };

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;

    try {
      setUploading(true);
      const payload = new FormData();
      payload.append("imageUrl", formData.imageUrl);

      await deleteProjectImageAction(payload);

      setFormData((prevFormData) => ({
        ...prevFormData,
        imageUrl: "",
        imageAlt: "",
      }));
      showNotification("Image deleted successfully", "success");
      setShowDeleteImageConfirmation(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error deleting image";
      showNotification(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = formStateToProjectInput(formData);
      await createProjectAction(payload);

      showNotification("Project created successfully", "success");
      setTimeout(() => {
        router.push("/admin/projects");
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to create project: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Project
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add a new project to your portfolio
          </p>
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
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type *
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="Project">Project</option>
                <option value="Featured Project">Featured Project</option>
                <option value="Open Source">Open Source</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* Summary */}
            <div className="sm:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Summary
              </label>
              <textarea
                name="summary"
                id="summary"
                rows={2}
                value={formData.summary}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Editable Text */}
            <div className="sm:col-span-2">
              <label htmlFor="editableText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Editable Text
              </label>
              <input
                type="text"
                name="editableText"
                id="editableText"
                value={formData.editableText}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Image *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                <div className="space-y-1 text-center">
                  {formData.imageUrl ? (
                    <div className="flex flex-col items-center">
                      <Image
                        className="h-32 w-32 object-cover rounded-md"
                        src={formData.imageUrl}
                        alt={formData.imageAlt}
                        width={128}
                        height={128}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formData.imageAlt}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1 text-sm"
                        >
                          <span>{uploading ? "Uploading..." : "Replace"}</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageConfirmation(true)}
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500 px-3 py-1 text-sm"
                          disabled={uploading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>{uploading ? "Uploading..." : "Upload a file"}</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Link */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Link *
              </label>
              <input
                type="url"
                name="link"
                id="link"
                value={formData.link}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* GitHub */}
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub Repository *
              </label>
              <input
                type="url"
                name="github"
                id="github"
                value={formData.github}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., React, TypeScript, Tailwind CSS"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated values
              </p>
            </div>

            {/* Technologies */}
            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Technologies
              </label>
              <input
                type="text"
                name="technologies"
                id="technologies"
                value={formData.technologies}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, MongoDB"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated values
              </p>
            </div>

            {/* Display Order */}
            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                id="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Feature this project
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Image Confirmation Dialog */}
      {showDeleteImageConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Project Image
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this project image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteImageConfirmation(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImageDelete}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {uploading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
