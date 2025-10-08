"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
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
import { deleteAboutProfileImageAction } from "@/features/profile/admin/actions";

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
  const isInitialMount = useRef(true);
  const previousInitialState = useRef(initialState);

  useEffect(() => {
    // Only update the form state on initial mount or when initialState actually changes
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setFormState(initialState);
      previousInitialState.current = initialState;
    } else {
      // Only update if initialState has actually changed (not due to user input)
      const previousStateString = JSON.stringify(previousInitialState.current);
      const currentStateString = JSON.stringify(initialState);
      
      if (previousStateString !== currentStateString) {
        setFormState(initialState);
        previousInitialState.current = initialState;
      }
    }
  }, [initialState]); // Only depend on initialState

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

  const handleInputChange = useCallback((field: keyof AboutFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const handleCounterChange = useCallback((field: "satisfiedClients" | "projectsCompleted" | "yearsOfExperience", value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const handleSkillsChange = useCallback((index: number, skillField: string, value: string) => {
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
  }, []);

  const handleExperienceChange = useCallback((index: number, expField: string, value: string) => {
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
  }, []);

  const handleExperienceWorkChange = useCallback((expIndex: number, workIndex: number, value: string) => {
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
  }, []);

  const handleEducationChange = useCallback((index: number, eduField: string, value: string) => {
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
  }, []);

  // Add/Remove functions for skills
  const handleAddSkill = useCallback(() => {
    setFormState((current) => ({
      ...current,
      skills: [...current.skills, { name: "" }],
    }));
  }, []);

  const handleRemoveSkill = useCallback((index: number) => {
    setFormState((current) => ({
      ...current,
      skills: current.skills.filter((_, i) => i !== index),
    }));
  }, []);

  // Add/Remove functions for experience
  const handleAddExperience = useCallback(() => {
    setFormState((current) => ({
      ...current,
      experiences: [...current.experiences, {
        position: "",
        company: "",
        companyLink: "",
        time: "",
        address: "",
        work: [""]
      }],
    }));
  }, []);

  const handleRemoveExperience = useCallback((index: number) => {
    setFormState((current) => ({
      ...current,
      experiences: current.experiences.filter((_, i) => i !== index),
    }));
  }, []);

  // Add/Remove functions for education
  const handleAddEducation = useCallback(() => {
    setFormState((current) => ({
      ...current,
      education: [...current.education, {
        type: "",
        time: "",
        place: "",
        info: ""
      }],
    }));
  }, []);

  const handleRemoveEducation = useCallback((index: number) => {
    setFormState((current) => ({
      ...current,
      education: current.education.filter((_, i) => i !== index),
    }));
  }, []);

  // Memoized function for removing experience
  const handleRemoveExperienceInline = useCallback((index: number) => {
    setFormState((current) => ({
      ...current,
      experiences: current.experiences.filter((_, i) => i !== index),
    }));
  }, []);

  // Memoized function for adding education
  const handleAddEducationInline = useCallback(() => {
    setFormState((current) => ({
      ...current,
      education: [...current.education, {
        type: "",
        time: "",
        place: "",
        info: ""
      }],
    }));
  }, []);

  // Memoized function for removing education
  const handleRemoveEducationInline = useCallback((index: number) => {
    setFormState((current) => ({
      ...current,
      education: current.education.filter((_, i) => i !== index),
    }));
  }, []);

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
        {/* Main About Content - Simplified */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About Page Content</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your about page content and profile image.</p>
          </div>

          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {(() => {
                  const imageSrc = formState.aboutProfileImagePath || fallbackProfileImagePath;
                  return imageSrc && imageSrc.trim() !== "" ? (
                    <Image
                      src={imageSrc}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      unoptimized
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 ring-2 ring-gray-200 dark:bg-gray-700 dark:ring-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setShowImageEditor(true)}
                  disabled={imageUploading}
                >
                  {imageUploading ? "Uploading..." : "Change Photo"}
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

            {/* Headline */}
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Page Headline</label>
              <div className="mt-2">
                <input
                  type="text"
                  id="headline"
                  value={formState.headline}
                  onChange={(event) => handleInputChange("headline", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="Enter your about page headline"
                />
              </div>
            </div>

            {/* About Text - Single textarea with paragraph support */}
            <div>
              <label htmlFor="aboutMeText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">About Me</label>
              <div className="mt-2">
                <textarea
                  id="aboutMeText"
                  rows={8}
                  value={formState.aboutMeText}
                  onChange={(event) => handleInputChange("aboutMeText", event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  placeholder="Write about yourself, your background, and what you do...

You can write multiple paragraphs by pressing Enter twice to create line breaks.

Each paragraph will be displayed separately on the public about page."
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use line breaks (Enter) to separate paragraphs. Each paragraph will be displayed separately on the public about page.
              </p>
            </div>

            {/* Statistics - Simplified */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="satisfiedClients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Satisfied Clients</label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="satisfiedClients"
                    value={formState.satisfiedClients}
                    onChange={(event) => handleCounterChange("satisfiedClients", event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="50+"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="projectsCompleted" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Projects Completed</label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="projectsCompleted"
                    value={formState.projectsCompleted}
                    onChange={(event) => handleCounterChange("projectsCompleted", event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="100+"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Years of Experience</label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="yearsOfExperience"
                    value={formState.yearsOfExperience}
                    onChange={(event) => handleCounterChange("yearsOfExperience", event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="5+"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Background - Simplified */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Background</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your skills, experience, and education in a simplified format.</p>
          </div>

          <div className="space-y-6">
            {/* Skills - Simplified as tags */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Add Skill
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {formState.skills.map((skill, index) => (
                  <div key={`skill-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(event) => handleSkillsChange(index, "name", event.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      placeholder={`Skill ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="rounded-md border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Enter your key skills and technologies.</p>
            </div>

            {/* Experience - Simplified */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Experience</label>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {formState.experiences.map((experience, index) => (
                  <div key={`experience-${index}`} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Experience #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperienceInline(index)}
                        className="rounded-md border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Position</label>
                        <input
                          type="text"
                          value={experience.position}
                          onChange={(event) => handleExperienceChange(index, "position", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., Senior Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Company</label>
                        <input
                          type="text"
                          value={experience.company}
                          onChange={(event) => handleExperienceChange(index, "company", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., Tech Company"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Period</label>
                        <input
                          type="text"
                          value={experience.time}
                          onChange={(event) => handleExperienceChange(index, "time", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., 2020 - 2023"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <input
                          type="text"
                          value={experience.address}
                          onChange={(event) => handleExperienceChange(index, "address", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., Remote"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <textarea
                        rows={2}
                        value={experience.work[0] || ""}
                        onChange={(event) => handleExperienceWorkChange(index, 0, event.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                        placeholder="Brief description of your role and achievements"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education - Simplified */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                <button
                  type="button"
                  onClick={handleAddEducationInline}
                  className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Add Education
                </button>
              </div>
              <div className="space-y-4">
                {formState.education.map((education, index) => (
                  <div key={`education-${index}`} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Education #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducationInline(index)}
                        className="rounded-md border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Degree</label>
                        <input
                          type="text"
                          value={education.type}
                          onChange={(event) => handleEducationChange(index, "type", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., Bachelor of Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Period</label>
                        <input
                          type="text"
                          value={education.time}
                          onChange={(event) => handleEducationChange(index, "time", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., 2018 - 2022"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Institution</label>
                        <input
                          type="text"
                          value={education.place}
                          onChange={(event) => handleEducationChange(index, "place", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., University Name"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Additional Information</label>
                        <input
                          type="text"
                          value={education.info}
                          onChange={(event) => handleEducationChange(index, "info", event.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                          placeholder="e.g., Graduated with honors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={handleRefresh}
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
