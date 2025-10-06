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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Headline</label>
              <input
                type="text"
                value={formState.headline}
                onChange={(event) => handleInputChange("headline", event.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Subheadline</label>
              <textarea
                value={formState.subheadline}
                onChange={(event) => handleInputChange("subheadline", event.target.value)}
                className="h-32 w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Resume URL</label>
              <input
                type="url"
                value={formState.resumeUrl}
                onChange={(event) => handleInputChange("resumeUrl", event.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Contact Email</label>
              <input
                type="email"
                value={formState.contactEmail}
                onChange={(event) => handleInputChange("contactEmail", event.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={formState.profileImagePath || fallbackProfileImagePath}
                alt="Profile"
                width={96}
                height={96}
                className="h-24 w-24 rounded-lg object-cover"
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
              <div className="space-y-2">
                <button
                  type="button"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                  onClick={() => setShowImageEditor(true)}
                  disabled={imageUploading}
                >
                  {imageUploading ? "Uploading..." : "Change Image"}
                </button>
                <button
                  type="button"
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={imageDeleting}
                >
                  {imageDeleting ? "Deleting..." : "Delete Image"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block font-medium">GitHub URL</label>
                <input
                  type="url"
                  value={formState.githubUrl}
                  onChange={(event) => handleInputChange("githubUrl", event.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">LinkedIn URL</label>
                <input
                  type="url"
                  value={formState.linkedinUrl}
                  onChange={(event) => handleInputChange("linkedinUrl", event.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">X URL</label>
                <input
                  type="url"
                  value={formState.xUrl}
                  onChange={(event) => handleInputChange("xUrl", event.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={formState.showHireMe}
                  onChange={(event) => handleInputChange("showHireMe", event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Show &quot;Hire Me&quot; badge
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            onClick={() =>
              startRefreshing(() => {
                router.refresh();
              })
            }
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="submit"
            className="rounded bg-dark px-6 py-3 text-light hover:bg-dark/80 disabled:opacity-50"
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
