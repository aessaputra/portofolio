"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Project } from "@/entities/projects";
import {
  deleteProjectAction,
  listProjectsAction,
} from "@/features/projects/admin/actions";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [, startTransition] = useTransition();

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadProjects = useCallback(() => {
    setLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const data = await listProjectsAction();
        setProjects(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to fetch projects:", error);
        showNotification(`Failed to fetch projects: ${message}`, "error");
        setError(message);
      } finally {
        setLoading(false);
      }
    });
  }, [showNotification, startTransition]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await deleteProjectAction(id);
      setProjects((current) => current.filter((project) => project.id !== id));
      showNotification("Project deleted successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to delete project: ${message}`, "error");
    }
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/admin/projects/${projectId}`);
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

      {/* Projects Management Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
        <div className="mb-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Projects Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your portfolio projects</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/admin/projects/new"
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Project
              </Link>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                Loading projects...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <button
              onClick={loadProjects}
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  No projects found.
                </div>
                <Link
                  href="/admin/projects/new"
                  className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer dark:border-gray-700 dark:bg-[var(--color-gray-800)]"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    {/* Project Image */}
                    <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                      {project.imageUrl && project.imageUrl.trim() !== "" ? (
                        <Image
                          className="h-full w-full object-cover"
                          src={project.imageUrl}
                          alt={project.imageAlt}
                          width={400}
                          height={192}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Project Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {project.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.featured
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-[var(--color-gray-dark)]/30 dark:text-gray-300"
                          }`}
                        >
                          {project.featured ? "Featured" : "Standard"}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                          {project.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 overflow-hidden">
                        {project.summary || "No description available."}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {new Date(project.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-[var(--color-gray-800)] dark:text-gray-300 dark:hover:bg-gray-700"
                            title="Edit project"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="inline-flex items-center rounded-lg border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-[var(--color-gray-800)] dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete project"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
