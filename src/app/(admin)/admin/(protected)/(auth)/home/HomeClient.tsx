"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import ProfileImageEditor from "@/features/profile/admin/ProfileImageEditor";
import ConfirmationDialog from "@/shared/ui/ConfirmationDialog";
import {
  formStateToHomeContentInput,
  homeContentToFormState,
  type HomeFormState,
} from "@/features/home/admin/types";
import { updateHomeContentAction } from "@/features/home/admin/actions";
import { deleteProfileImageAction } from "@/features/profile/admin/actions";

const NOTIFICATION_TIMEOUT = 5000;

type NotificationState = {
  message: string;
  type: "success" | "error";
} | null;

type HomeClientProps = {
  initialState: HomeFormState;
  fallbackProfileImagePath: string;
};

export default function HomeClient({
  initialState,
  fallbackProfileImagePath,
}: HomeClientProps) {
  const [formState, setFormState] = useState<HomeFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);
  const [isRefreshing, startRefreshing] = useTransition();
  const router = useRouter();
  const notificationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, NOTIFICATION_TIMEOUT);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = formStateToHomeContentInput(formState);
      const updated = await updateHomeContentAction(payload);
      setFormState(homeContentToFormState(updated));
      showNotification("Home content updated successfully!", "success");
      startRefreshing(() => router.refresh());
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to update home content: ${message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof HomeFormState,
    value: string | boolean
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setImageUploading(true);
      setFormState((current) => ({
        ...current,
        profileImagePath: imageUrl,
      }));
      showNotification("Profile image updated successfully!", "success");
      setShowImageEditor(false);
    } catch (error) {
      console.error("Error updating profile image:", error);
      showNotification("Error updating profile image", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setImageDeleting(true);
      const formData = new FormData();
      formData.append("imageUrl", formState.profileImagePath);
      formData.append("fallbackUrl", fallbackProfileImagePath);
      await deleteProfileImageAction(formData);
      setFormState((current) => ({
        ...current,
        profileImagePath: fallbackProfileImagePath,
      }));
      showNotification("Profile image deleted successfully!", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Error deleting profile image: ${message}`, "error");
    } finally {
      setImageDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Information Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This information will be displayed publicly so be careful what you share.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Headline</label>
                <div className="mt-2">
                  <input
                    id="headline"
                    type="text"
                    value={formState.headline}
                    onChange={(event) => handleInputChange("headline", event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Enter your professional headline"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">About</label>
                <div className="mt-2">
                  <textarea
                    id="subheadline"
                    value={formState.subheadline}
                    onChange={(event) => handleInputChange("subheadline", event.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Write a few sentences about yourself and your expertise."
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Write a compelling description of your professional background and skills.</p>
              </div>

              <div>
                <label htmlFor="logo-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo Text</label>
                <div className="mt-2">
                  <input
                    id="logo-text"
                    type="text"
                    value={formState.logoText}
                    onChange={(event) => handleInputChange("logoText", event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="Enter your brand name or initials"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This text will appear in the logo on your website. It will be converted to initials for display.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={formState.profileImagePath || fallbackProfileImagePath}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      unoptimized
                      onError={(e) => {
                        console.error('[HomeClient] Failed to load profile image:', {
                          src: formState.profileImagePath || fallbackProfileImagePath,
                          error: e,
                        });
                      }}
                      onLoad={() => {
                        console.log('[HomeClient] Successfully loaded profile image:', formState.profileImagePath || fallbackProfileImagePath);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setShowImageEditor(true)}
                      disabled={imageUploading}
                    >
                      {imageUploading ? "Uploading..." : "Change"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => setShowDeleteConfirmation(true)}
                      disabled={imageDeleting}
                    >
                      {imageDeleting ? "Deleting..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Provide your contact details and professional links.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="resume-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resume URL</label>
              <div className="mt-2">
                <input
                  id="resume-url"
                  type="url"
                  value={formState.resumeUrl}
                  onChange={(event) => handleInputChange("resumeUrl", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="https://your-resume.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
              <div className="mt-2">
                <input
                  id="contact-email"
                  type="email"
                  value={formState.contactEmail}
                  onChange={(event) => handleInputChange("contactEmail", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
              <div className="mt-2">
                <input
                  id="github-url"
                  type="url"
                  value={formState.githubUrl}
                  onChange={(event) => handleInputChange("githubUrl", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
              <div className="mt-2">
                <input
                  id="linkedin-url"
                  type="url"
                  value={formState.linkedinUrl}
                  onChange={(event) => handleInputChange("linkedinUrl", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="x-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">X (Twitter) URL</label>
              <div className="mt-2">
                <input
                  id="x-url"
                  type="url"
                  value={formState.xUrl}
                  onChange={(event) => handleInputChange("xUrl", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="https://x.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Preferences Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display Preferences</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure how your profile appears to visitors.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-5 items-center">
              <input
                id="show-hire-me"
                type="checkbox"
                checked={formState.showHireMe}
                onChange={(event) => handleInputChange("showHireMe", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="show-hire-me" className="font-medium text-gray-900 dark:text-white">Show "Hire Me" Badge</label>
              <p className="text-gray-500 dark:text-gray-400">Display a prominent "Hire Me" badge on your profile to indicate availability.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => startRefreshing(() => router.refresh())}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Cancel"}
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {showImageEditor && (
        <ProfileImageEditor
          currentImageUrl={formState.profileImagePath}
          onCancel={() => setShowImageEditor(false)}
          onImageSave={handleImageUpload}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          title="Delete Profile Image"
          message="Are you sure you want to delete the profile image?"
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive
          onCancel={() => setShowDeleteConfirmation(false)}
          onConfirm={handleImageDelete}
        />
      )}
    </div>
  );
}
