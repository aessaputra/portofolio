"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AboutImageEditor from "@/features/about/admin/AboutImageEditor";
import ConfirmationDialog from "@/shared/ui/ConfirmationDialog";
import {
  aboutContentToFormState,
  formStateToAboutContentInput,
  type AboutFormState,
} from "@/features/about/admin/types";
import { updateAboutContentAction } from "@/features/about/admin/actions";
import { deleteAboutProfileImageAction } from "@/features/about/admin/image-actions";

const NOTIFICATION_TIMEOUT = 5000;

type NotificationState = {
  message: string;
  type: "success" | "error";
} | null;

type AboutClientProps = {
  initialState: AboutFormState;
  fallbackProfileImagePath: string;
};

export default function AboutClient({
  initialState,
  fallbackProfileImagePath,
}: AboutClientProps) {
  const [formState, setFormState] = useState<AboutFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, NOTIFICATION_TIMEOUT);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = formStateToAboutContentInput(formState);
      const updated = await updateAboutContentAction(payload);
      setFormState(aboutContentToFormState(updated));
      showNotification("About content updated successfully!", "success");
      startRefresh(() => router.refresh());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to update about content: ${message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AboutFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCounterChange = (field: "satisfiedClients" | "projectsCompleted" | "yearsOfExperience", value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSkillsChange = (index: number, skillField: string, value: string) => {
    setFormState((current) => {
      const updatedSkills = current.skills.map((skill, i) =>
        i === index
          ? {
              ...skill,
              [skillField]: value,
            }
          : skill
      );
      return {
        ...current,
        skills: updatedSkills,
      };
    });
  };

  const handleExperienceChange = (index: number, expField: string, value: string) => {
    setFormState((current) => {
      const updatedExperiences = current.experiences.map((experience, i) =>
        i === index
          ? {
              ...experience,
              [expField]: value,
            }
          : experience
      );
      return {
        ...current,
        experiences: updatedExperiences,
      };
    });
  };

  const handleExperienceWorkChange = (expIndex: number, workIndex: number, value: string) => {
    setFormState((current) => {
      const updatedExperiences = current.experiences.map((experience, i) => {
        if (i !== expIndex) return experience;
        const work = [...experience.work];
        if (work[workIndex] !== undefined) {
          work[workIndex] = value;
        }
        return {
          ...experience,
          work,
        };
      });
      return {
        ...current,
        experiences: updatedExperiences,
      };
    });
  };

  const handleEducationChange = (index: number, eduField: string, value: string) => {
    setFormState((current) => {
      const updatedEducation = current.education.map((education, i) =>
        i === index
          ? {
              ...education,
              [eduField]: value,
            }
          : education
      );
      return {
        ...current,
        education: updatedEducation,
      };
    });
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      setImageUploading(true);
      setFormState((current) => ({
        ...current,
        aboutProfileImagePath: imageUrl,
      }));
      showNotification("About page image updated successfully!", "success");
      setShowImageEditor(false);
      // Refresh data from server to ensure consistency
      startRefresh(() => router.refresh());
    } catch (error) {
      console.error("Error updating about page image:", error);
      showNotification("Error updating about page image", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setImageDeleting(true);
      const formData = new FormData();
      formData.append("imageUrl", formState.aboutProfileImagePath);
      await deleteAboutProfileImageAction(formData);
      setFormState((current) => ({
        ...current,
        aboutProfileImagePath: fallbackProfileImagePath,
      }));
      showNotification("About page image deleted successfully!", "success");
      // Refresh data from server to ensure consistency
      startRefresh(() => router.refresh());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Error deleting about page image: ${message}`, "error");
    } finally {
      setImageDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleRefresh = () => {
    startRefresh(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            About Page Content Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Edit and manage your about page content
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-3 sm:mt-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isRefreshing}
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

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
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              About Content Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Update the content that appears on your about page.
            </p>
          </div>

          <div className="space-y-6 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="headline" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  value={formState.headline}
                  onChange={(event) => handleInputChange("headline", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter headline"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="aboutMeText1" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  About Me - Paragraph 1
                </label>
                <textarea
                  id="aboutMeText1"
                  rows={4}
                  value={formState.aboutMeText1}
                  onChange={(event) => handleInputChange("aboutMeText1", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="aboutMeText2" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  About Me - Paragraph 2
                </label>
                <textarea
                  id="aboutMeText2"
                  rows={4}
                  value={formState.aboutMeText2}
                  onChange={(event) => handleInputChange("aboutMeText2", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="aboutMeText3" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  About Me - Paragraph 3
                </label>
                <textarea
                  id="aboutMeText3"
                  rows={4}
                  value={formState.aboutMeText3}
                  onChange={(event) => handleInputChange("aboutMeText3", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 sm:col-span-2">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <Image
                    className="h-16 w-16 rounded-full object-cover"
                    src={formState.aboutProfileImagePath || fallbackProfileImagePath}
                    alt="Profile"
                    width={64}
                    height={64}
                    unoptimized
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImageEditor(true)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={imageUploading}
                  >
                    {imageUploading ? "Uploading..." : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    disabled={imageDeleting}
                  >
                    {imageDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="satisfiedClients" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Satisfied Clients
                </label>
                <input
                  type="text"
                  id="satisfiedClients"
                  value={formState.satisfiedClients}
                  onChange={(event) => handleCounterChange("satisfiedClients", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="projectsCompleted" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Projects Completed
                </label>
                <input
                  type="text"
                  id="projectsCompleted"
                  value={formState.projectsCompleted}
                  onChange={(event) => handleCounterChange("projectsCompleted", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years of Experience
                </label>
                <input
                  type="text"
                  id="yearsOfExperience"
                  value={formState.yearsOfExperience}
                  onChange={(event) => handleCounterChange("yearsOfExperience", event.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional sections (skills, experience, education) remain unchanged */}
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <header className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills Cloud</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update the label and positioning for each skill token.
              </p>
            </header>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {formState.skills.map((skill, index) => (
                <div key={`${skill.name}-${index}`} className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Skill {index + 1}</h3>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Label
                      </label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(event) => handleSkillsChange(index, "name", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                          Axis X
                        </label>
                        <input
                          type="text"
                          value={skill.x}
                          onChange={(event) => handleSkillsChange(index, "x", event.target.value)}
                          className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                          Axis Y
                        </label>
                        <input
                          type="text"
                          value={skill.y}
                          onChange={(event) => handleSkillsChange(index, "y", event.target.value)}
                          className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <header className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Experience Timeline</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update each experience block. Work entries render as bullet points.
              </p>
            </header>
            <div className="space-y-6">
              {formState.experiences.map((experience, index) => (
                <div key={`${experience.company}-${index}`} className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Position
                      </label>
                      <input
                        type="text"
                        value={experience.position}
                        onChange={(event) => handleExperienceChange(index, "position", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Company
                      </label>
                      <input
                        type="text"
                        value={experience.company}
                        onChange={(event) => handleExperienceChange(index, "company", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Company URL
                      </label>
                      <input
                        type="url"
                        value={experience.companyLink}
                        onChange={(event) => handleExperienceChange(index, "companyLink", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Time Period
                      </label>
                      <input
                        type="text"
                        value={experience.time}
                        onChange={(event) => handleExperienceChange(index, "time", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </label>
                      <input
                        type="text"
                        value={experience.address}
                        onChange={(event) => handleExperienceChange(index, "address", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {experience.work.map((entry, workIndex) => (
                      <div key={`${experience.company}-work-${workIndex}`}>
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                          Bullet {workIndex + 1}
                        </label>
                        <textarea
                          rows={2}
                          value={entry}
                          onChange={(event) =>
                            handleExperienceWorkChange(index, workIndex, event.target.value)
                          }
                          className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <header className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control the education entries shown on the public page.
              </p>
            </header>
            <div className="space-y-6">
              {formState.education.map((education, index) => (
                <div key={`${education.place}-${index}`} className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Program
                      </label>
                      <input
                        type="text"
                        value={education.type}
                        onChange={(event) => handleEducationChange(index, "type", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Dates
                      </label>
                      <input
                        type="text"
                        value={education.time}
                        onChange={(event) => handleEducationChange(index, "time", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={education.place}
                        onChange={(event) => handleEducationChange(index, "place", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={education.info}
                        onChange={(event) => handleEducationChange(index, "info", event.target.value)}
                        className="block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end">
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
        <AboutImageEditor
          currentImageUrl={formState.aboutProfileImagePath}
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
