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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Project</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a new project to your portfolio</p>
          </div>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Title *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Enter project title"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Type *
                </label>
                <div className="mt-2">
                  <select
                    name="type"
                    id="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Project">Project</option>
                    <option value="Featured Project">Featured Project</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Summary
              </label>
              <div className="mt-2">
                <textarea
                  name="summary"
                  id="summary"
                  rows={3}
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="Brief description of your project"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Image *
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600">
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

          </div>
        </div>

        {/* Project Links & Metadata */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Links & Metadata</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure project links, tags, and display settings.</p>
          </div>

          <div className="space-y-6">
            {/* Links */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Link *
                </label>
                <div className="mt-2">
                  <input
                    type="url"
                    name="link"
                    id="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="https://your-project.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  GitHub Repository *
                </label>
                <div className="mt-2">
                  <input
                    type="url"
                    name="github"
                    id="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
            </div>

            {/* Tags & Technologies */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., React, TypeScript, Tailwind CSS"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Comma-separated values
                </p>
              </div>

              <div>
                <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Technologies
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="technologies"
                    id="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Comma-separated values
                </p>
              </div>
            </div>

            {/* Display Settings */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Order
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    name="displayOrder"
                    id="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Feature this project
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>

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
