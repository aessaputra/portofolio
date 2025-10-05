"use client";

import { useEffect, useState } from "react";
import { db } from "@/db/client";
import { aboutContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileImageEditor from "@/app/admin/components/ProfileImageEditor";
import ConfirmationDialog from "@/app/admin/components/ConfirmationDialog";

interface AboutContent {
  id: number;
  headline: string;
  aboutMeText1: string;
  aboutMeText2: string;
  aboutMeText3: string;
  profileImagePath: string;
  satisfiedClients: string;
  projectsCompleted: string;
  yearsOfExperience: string;
  skills: Array<{ name: string; x: string; y: string }>;
  experiences: Array<{
    position: string;
    company: string;
    companyLink: string;
    time: string;
    address: string;
    work: string[];
  }>;
  education: Array<{
    type: string;
    time: string;
    place: string;
    info: string;
  }>;
  updatedAt: Date;
}

export default function AdminAbout() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/about-content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        showNotification('Failed to fetch about content', 'error');
      }
    } catch (error) {
      showNotification('Error fetching about content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/about-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        showNotification('About content updated successfully!', 'success');
      } else {
        showNotification('Failed to update about content', 'error');
      }
    } catch (error) {
      showNotification('Error updating about content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AboutContent, value: string) => {
    if (content) {
      setContent({
        ...content,
        [field]: value,
      });
    }
  };

  const handleSkillsChange = (index: number, skillField: string, value: string) => {
    if (content) {
      const updatedSkills = [...content.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [skillField]: value,
      };
      setContent({
        ...content,
        skills: updatedSkills,
      });
    }
  };

  const handleExperienceChange = (index: number, expField: string, value: string) => {
    if (content) {
      const updatedExperiences = [...content.experiences];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [expField]: value,
      };
      setContent({
        ...content,
        experiences: updatedExperiences,
      });
    }
  };

  const handleExperienceWorkChange = (expIndex: number, workIndex: number, value: string) => {
    if (content) {
      const updatedExperiences = [...content.experiences];
      updatedExperiences[expIndex].work[workIndex] = value;
      setContent({
        ...content,
        experiences: updatedExperiences,
      });
    }
  };

  const handleEducationChange = (index: number, eduField: string, value: string) => {
    if (content) {
      const updatedEducation = [...content.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [eduField]: value,
      };
      setContent({
        ...content,
        education: updatedEducation,
      });
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!content) return;

    try {
      setImageUploading(true);
      
      // The ProfileImageEditor component now handles the upload directly
      // and returns the URL of the uploaded image
      setContent({
        ...content,
        profileImagePath: imageUrl,
      });
      showNotification('Profile image updated successfully!', 'success');
      setShowImageEditor(false);
    } catch (error) {
      console.error('Error updating profile image:', error);
      showNotification('Error updating profile image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!content) return;

    try {
      setImageDeleting(true);
      
      const deleteResponse = await fetch('/api/admin/profile-image/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: content.profileImagePath }),
      });
      
      if (deleteResponse.ok) {
        setContent({
          ...content,
          profileImagePath: '/images/profile/developer-pic-2.jpg', // Default image
        });
        showNotification('Profile image deleted successfully!', 'success');
        setShowDeleteConfirmation(false);
      } else {
        const errorData = await deleteResponse.json();
        showNotification(errorData.error || 'Failed to delete image', 'error');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('Error deleting image', 'error');
    } finally {
      setImageDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading about content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            About Page Content Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edit and manage your about page content
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            type="button"
            onClick={fetchContent}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
      {content && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                About Content Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Update the content that appears on your about page.
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    id="headline"
                    value={content.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="Enter headline"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="aboutMeText1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About Me - Paragraph 1
                  </label>
                  <textarea
                    id="aboutMeText1"
                    rows={4}
                    value={content.aboutMeText1}
                    onChange={(e) => handleInputChange('aboutMeText1', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="Enter first paragraph about yourself"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="aboutMeText2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About Me - Paragraph 2
                  </label>
                  <textarea
                    id="aboutMeText2"
                    rows={4}
                    value={content.aboutMeText2}
                    onChange={(e) => handleInputChange('aboutMeText2', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="Enter second paragraph about yourself"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="aboutMeText3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About Me - Paragraph 3
                  </label>
                  <textarea
                    id="aboutMeText3"
                    rows={4}
                    value={content.aboutMeText3}
                    onChange={(e) => handleInputChange('aboutMeText3', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="Enter third paragraph about yourself"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {content.profileImagePath ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src={content.profileImagePath}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowImageEditor(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:text-red-400 dark:border-gray-600 dark:hover:bg-red-900/20"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="satisfiedClients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Satisfied Clients
                  </label>
                  <input
                    type="text"
                    id="satisfiedClients"
                    value={content.satisfiedClients}
                    onChange={(e) => handleInputChange('satisfiedClients', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label htmlFor="projectsCompleted" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Projects Completed
                  </label>
                  <input
                    type="text"
                    id="projectsCompleted"
                    value={content.projectsCompleted}
                    onChange={(e) => handleInputChange('projectsCompleted', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    id="yearsOfExperience"
                    value={content.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    placeholder="4"
                  />
                </div>

                {/* Skills Section */}
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Skills</h3>
                  <div className="space-y-4">
                    {content.skills.map((skill, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Skill Name
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleSkillsChange(index, 'name', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            X Position
                          </label>
                          <input
                            type="text"
                            value={skill.x}
                            onChange={(e) => handleSkillsChange(index, 'x', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Y Position
                          </label>
                          <input
                            type="text"
                            value={skill.y}
                            onChange={(e) => handleSkillsChange(index, 'y', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Section */}
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Experience</h3>
                  <div className="space-y-4">
                    {content.experiences.map((experience, expIndex) => (
                      <div key={expIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Position
                            </label>
                            <input
                              type="text"
                              value={experience.position}
                              onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              value={experience.company}
                              onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Company Link
                            </label>
                            <input
                              type="text"
                              value={experience.companyLink}
                              onChange={(e) => handleExperienceChange(expIndex, 'companyLink', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Time
                            </label>
                            <input
                              type="text"
                              value={experience.time}
                              onChange={(e) => handleExperienceChange(expIndex, 'time', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              value={experience.address}
                              onChange={(e) => handleExperienceChange(expIndex, 'address', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Work Description
                          </label>
                          <div className="space-y-2">
                            {experience.work.map((workItem, workIndex) => (
                              <div key={workIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={workItem}
                                  onChange={(e) => handleExperienceWorkChange(expIndex, workIndex, e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Section */}
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Education</h3>
                  <div className="space-y-4">
                    {content.education.map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Type
                            </label>
                            <input
                              type="text"
                              value={edu.type}
                              onChange={(e) => handleEducationChange(index, 'type', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Time
                            </label>
                            <input
                              type="text"
                              value={edu.time}
                              onChange={(e) => handleEducationChange(index, 'time', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Place
                            </label>
                            <input
                              type="text"
                              value={edu.place}
                              onChange={(e) => handleEducationChange(index, 'place', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Info
                            </label>
                            <input
                              type="text"
                              value={edu.info}
                              onChange={(e) => handleEducationChange(index, 'info', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={fetchContent}
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
                <>
                  <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Profile Image Editor Modal */}
      {showImageEditor && content && (
        <ProfileImageEditor
          currentImageUrl={content.profileImagePath}
          onImageSave={handleImageUpload}
          onCancel={() => setShowImageEditor(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          title="Delete Profile Image"
          message="Are you sure you want to delete your profile image? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleImageDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
          isDestructive={true}
        />
      )}
    </div>
  );
}