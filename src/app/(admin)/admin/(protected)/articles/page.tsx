"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { ArticleSource } from "@/entities/articles";
import {
  articleSourceToFormState,
  createEmptyArticleSourceFormState,
  formStateToArticleSourceInput,
  type ArticleSourceFormState,
} from "@/features/articles/admin/types";
import {
  createArticleSourceAction,
  deleteArticleSourceAction,
  listArticleSourcesAction,
  updateArticleSourceAction,
} from "@/features/articles/admin/actions";

function sortArticleSources(sources: ArticleSource[]): ArticleSource[] {
  return [...sources].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

export default function AdminArticlesPage() {
  const [articleSources, setArticleSources] = useState<ArticleSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<ArticleSourceFormState | null>(null);
  const [newSource, setNewSource] = useState<ArticleSourceFormState>(
    createEmptyArticleSourceFormState()
  );
  const [, startTransition] = useTransition();

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadArticleSources = useCallback(() => {
    setLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const data = await listArticleSourcesAction();
        setArticleSources(sortArticleSources(data));
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
        console.error("Error fetching article sources:", fetchError);
        showNotification(`Failed to fetch article sources: ${errorMessage}`, "error");
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    });
  }, [showNotification, startTransition]);

  useEffect(() => {
    loadArticleSources();
  }, [loadArticleSources]);

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      showNotification("Name and URL are required", "error");
      return;
    }

    try {
      const payload = formStateToArticleSourceInput(newSource);
      const created = await createArticleSourceAction(payload);
      setArticleSources((current) =>
        sortArticleSources([
          ...current,
          created,
        ])
      );
      showNotification("Article source added successfully", "success");
      setNewSource(createEmptyArticleSourceFormState());
      setShowAddForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to add article source: ${message}`, "error");
    }
  };

  const handleUpdateSource = async () => {
    if (!editingSource?.id) {
      showNotification("Select an article source to update", "error");
      return;
    }

    try {
      const payload = formStateToArticleSourceInput(editingSource);
      const updated = await updateArticleSourceAction(editingSource.id, payload);
      setArticleSources((current) =>
        sortArticleSources(
          current.map((source) => (source.id === updated.id ? updated : source))
        )
      );
      showNotification("Article source updated successfully", "success");
      setEditingSource(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to update article source: ${message}`, "error");
    }
  };

  const handleDeleteSource = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article source?")) {
      return;
    }

    try {
      await deleteArticleSourceAction(id);
      setArticleSources((current) => current.filter((source) => source.id !== id));
      showNotification("Article source deleted successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to delete article source: ${message}`, "error");
    }
  };

  const handleToggleEnabled = async (source: ArticleSource) => {
    const toggledFormState = {
      ...articleSourceToFormState(source),
      enabled: !source.enabled,
    };

    try {
      const payload = formStateToArticleSourceInput(toggledFormState);
      const saved = await updateArticleSourceAction(source.id, payload);
      setArticleSources((current) =>
        sortArticleSources(
          current.map((item) => (item.id === saved.id ? saved : item))
        )
      );
      showNotification(
        `Article source ${saved.enabled ? "enabled" : "disabled"} successfully`,
        "success"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to update article source: ${message}`, "error");
    }
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

      {/* Articles Management Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
        <div className="mb-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Article Sources Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage WordPress article sources for your articles page</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Source
              </button>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Article Source</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure a new WordPress article source for your articles page.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="name"
                      value={newSource.name}
                      onChange={(e) =>
                        setNewSource((current) => ({ ...current, name: e.target.value }))
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      placeholder="Enter source name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Order
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      id="displayOrder"
                      value={newSource.displayOrder}
                      onChange={(e) =>
                        setNewSource((current) => ({
                          ...current,
                          displayOrder: Number.isNaN(Number(e.target.value))
                            ? 0
                            : Number(e.target.value),
                        }))
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  WordPress REST API URL
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="url"
                    value={newSource.url}
                    onChange={(e) =>
                      setNewSource((current) => ({ ...current, url: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="https://example.com/wp-json/wp/v2/posts?per_page=5"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Example: https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="enabled"
                    type="checkbox"
                    checked={newSource.enabled}
                    onChange={(e) =>
                      setNewSource((current) => ({ ...current, enabled: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable this source
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSource(createEmptyArticleSourceFormState());
                }}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSource}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Add Source
              </button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingSource && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Article Source</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update the configuration for this article source.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="edit-name"
                      value={editingSource.name}
                      onChange={(e) =>
                        setEditingSource((current) =>
                          current ? { ...current, name: e.target.value } : current
                        )
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      placeholder="Enter source name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Order
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      id="edit-displayOrder"
                      value={editingSource.displayOrder}
                      onChange={(e) =>
                        setEditingSource((current) => {
                          if (!current) return current;
                          const value = Number(e.target.value);
                          return {
                            ...current,
                            displayOrder: Number.isNaN(value) ? 0 : value,
                          };
                        })
                      }
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  WordPress REST API URL
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="edit-url"
                    value={editingSource.url}
                    onChange={(e) =>
                      setEditingSource((current) =>
                        current ? { ...current, url: e.target.value } : current
                      )
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="https://example.com/wp-json/wp/v2/posts?per_page=5"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Example: https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="edit-enabled"
                    type="checkbox"
                    checked={editingSource.enabled}
                    onChange={(e) =>
                      setEditingSource((current) =>
                        current ? { ...current, enabled: e.target.checked } : current
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="edit-enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable this source
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateSource}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Update Source
              </button>
            </div>
          </div>
        )}

        {/* Article Sources List */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--color-gray-dark)]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article Sources</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your WordPress article sources and their display order.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
                <div className="text-lg text-gray-700 dark:text-gray-300">
                  Loading article sources...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <button
                onClick={loadArticleSources}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {articleSources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    No article sources found.
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Add your first article source
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          URL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {articleSources.map((source) => (
                        <tr key={source.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{source.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {source.url}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                source.enabled
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {source.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {source.displayOrder}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleEnabled(source)}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                {source.enabled ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => setEditingSource(articleSourceToFormState(source))}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSource(source.id)}
                                className="inline-flex items-center rounded-lg border border-red-300 bg-white px-2 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
