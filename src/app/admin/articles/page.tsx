"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ArticleSource {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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
  const [editingSource, setEditingSource] = useState<ArticleSource | null>(null);
  const [newSource, setNewSource] = useState({
    name: "",
    url: "",
    enabled: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchArticleSources();
  }, []);

  const fetchArticleSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/articles");
      
      if (response.ok) {
        const data = await response.json();
        setArticleSources(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch article sources:", errorData.error || "Unknown error");
        showNotification(`Failed to fetch article sources: ${errorData.error || "Unknown error"}`, "error");
        setError(errorData.error || "Unknown error");
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      console.error("Error fetching article sources:", fetchError);
      showNotification(`Error fetching article sources: ${errorMessage}`, "error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      showNotification("Name and URL are required", "error");
      return;
    }

    try {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSource),
      });

      if (response.ok) {
        showNotification("Article source added successfully", "success");
        setNewSource({ name: "", url: "", enabled: true, displayOrder: 0 });
        setShowAddForm(false);
        fetchArticleSources();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to add article source: ${errorData.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      showNotification("Error adding article source", "error");
    }
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;

    try {
      const response = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingSource),
      });

      if (response.ok) {
        showNotification("Article source updated successfully", "success");
        setEditingSource(null);
        fetchArticleSources();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update article source: ${errorData.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      showNotification("Error updating article source", "error");
    }
  };

  const handleDeleteSource = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article source?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setArticleSources(articleSources.filter((source) => source.id !== id));
        showNotification("Article source deleted successfully", "success");
      } else {
        showNotification("Failed to delete article source", "error");
      }
    } catch (error) {
      showNotification("Error deleting article source", "error");
    }
  };

  const handleToggleEnabled = async (source: ArticleSource) => {
    const updatedSource = { ...source, enabled: !source.enabled };
    
    try {
      const response = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSource),
      });

      if (response.ok) {
        setArticleSources(
          articleSources.map((s) => (s.id === source.id ? updatedSource : s))
        );
        showNotification(
          `Article source ${updatedSource.enabled ? "enabled" : "disabled"} successfully`,
          "success"
        );
      } else {
        showNotification("Failed to update article source", "error");
      }
    } catch (error) {
      showNotification("Error updating article source", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Article Sources Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage WordPress article sources for your articles page
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Source
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

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add New Article Source
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="Enter source name"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="displayOrder"
                value={newSource.displayOrder}
                onChange={(e) => setNewSource({ ...newSource, displayOrder: parseInt(e.target.value) || 0 })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WordPress REST API URL
              </label>
              <input
                type="text"
                id="url"
                value={newSource.url}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="https://example.com/wp-json/wp/v2/posts?per_page=5"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Example: https://wordpress.org/news/wp-json/wp/v2/posts?per_page=5
              </p>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  id="enabled"
                  type="checkbox"
                  checked={newSource.enabled}
                  onChange={(e) => setNewSource({ ...newSource, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Enabled
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewSource({ name: "", url: "", enabled: true, displayOrder: 0 });
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSource}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Source
            </button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingSource && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Article Source
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="edit-name"
                value={editingSource.name}
                onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="Enter source name"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="edit-displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="edit-displayOrder"
                value={editingSource.displayOrder}
                onChange={(e) => setEditingSource({ ...editingSource, displayOrder: parseInt(e.target.value) || 0 })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WordPress REST API URL
              </label>
              <input
                type="text"
                id="edit-url"
                value={editingSource.url}
                onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="https://example.com/wp-json/wp/v2/posts?per_page=5"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  id="edit-enabled"
                  type="checkbox"
                  checked={editingSource.enabled}
                  onChange={(e) => setEditingSource({ ...editingSource, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Enabled
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditingSource(null)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateSource}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Source
            </button>
          </div>
        </div>
      )}

      {/* Article Sources List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                Loading article sources...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <button
              onClick={fetchArticleSources}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                          <button
                            onClick={() => handleToggleEnabled(source)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            {source.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => setEditingSource(source)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSource(source.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
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
  );
}