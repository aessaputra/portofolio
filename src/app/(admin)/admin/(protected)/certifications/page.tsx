"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import CertificateImageEditor from "@/features/certifications/admin/components/CertificateImageEditor";
import { resolveR2PublicUrl } from "@/shared/lib/r2PublicUrl";
import ConfirmationDialog from "@/shared/ui/ConfirmationDialog";
import type { Certification } from "@/entities/certifications";
import {
  deleteCertificationAction,
  listCertificationsAction,
} from "@/features/certifications/admin/actions";

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIssuer, setFilterIssuer] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [filterExpiryStatus, setFilterExpiryStatus] = useState("all");
  const [sortBy, setSortBy] = useState("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageEditorCertificationId, setImageEditorCertificationId] = useState<number | null>(null);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [certificationToDelete, setCertificationToDelete] = useState<Certification | null>(null);

  const [, startTransition] = useTransition();

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadCertifications = useCallback(() => {
    setLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const data = await listCertificationsAction();
        setCertifications(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to fetch certifications:", error);
        showNotification(`Failed to fetch certifications: ${message}`, "error");
        setError(message);
      } finally {
        setLoading(false);
      }
    });
  }, [showNotification, startTransition]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const applyFiltersAndSorting = useCallback(() => {
    let result = [...certifications];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cert =>
        cert.title.toLowerCase().includes(term) ||
        cert.issuer.toLowerCase().includes(term) ||
        (cert.description?.toLowerCase().includes(term) ?? false) ||
        cert.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply issuer filter
    if (filterIssuer !== "all") {
      result = result.filter(cert => cert.issuer === filterIssuer);
    }
    
    // Apply featured filter
    if (filterFeatured !== "all") {
      const isFeatured = filterFeatured === "featured";
      result = result.filter(cert => cert.featured === isFeatured);
    }
    
    // Apply expiry status filter
    if (filterExpiryStatus !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day
      
      if (filterExpiryStatus === "expired") {
        result = result.filter(cert => {
          if (!cert.expiryDate) return false;
          const expiryDate = new Date(cert.expiryDate);
          return expiryDate < today;
        });
      } else if (filterExpiryStatus === "valid") {
        result = result.filter(cert => {
          if (!cert.expiryDate) return true; // No expiry date means it's valid
          const expiryDate = new Date(cert.expiryDate);
          return expiryDate >= today;
        });
      } else if (filterExpiryStatus === "expiring-soon") {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        result = result.filter(cert => {
          if (!cert.expiryDate) return false;
          const expiryDate = new Date(cert.expiryDate);
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        });
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "issuer":
          aValue = a.issuer.toLowerCase();
          bValue = b.issuer.toLowerCase();
          break;
        case "issueDate":
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case "expiryDate":
          aValue = a.expiryDate ? new Date(a.expiryDate) : new Date('9999-12-31');
          bValue = b.expiryDate ? new Date(b.expiryDate) : new Date('9999-12-31');
          break;
        case "displayOrder":
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredCertifications(result);
  }, [certifications, searchTerm, filterIssuer, filterFeatured, filterExpiryStatus, sortBy, sortOrder]);

  // Apply filters and sorting when certifications or filter criteria change
  useEffect(() => {
    if (certifications.length > 0) {
      applyFiltersAndSorting();
    } else {
      setFilteredCertifications([]);
    }
  }, [certifications, applyFiltersAndSorting]);

  // Get unique issuers for filter dropdown
  const getUniqueIssuers = () => {
    const issuers = Array.from(new Set(certifications.map(cert => cert.issuer)));
    return issuers.sort();
  };

  const handleDeleteCertification = async (id: number) => {
    setCertificationToDelete(certifications.find(cert => cert.id === id) || null);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCertification = async () => {
    if (!certificationToDelete) return;

    try {
      await deleteCertificationAction(certificationToDelete.id);
      setCertifications((current) =>
        current.filter((certification) => certification.id !== certificationToDelete.id)
      );
      showNotification("Certification deleted successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showNotification(`Failed to delete certification: ${message}`, "error");
    } finally {
      setShowDeleteDialog(false);
      setCertificationToDelete(null);
    }
  };

  const cancelDeleteCertification = () => {
    setShowDeleteDialog(false);
    setCertificationToDelete(null);
  };

  const openImageEditor = (imageUrl: string, certificationId: number) => {
    setCurrentImageUrl(resolveR2PublicUrl(imageUrl));
    setImageEditorCertificationId(certificationId);
    setShowImageEditor(true);
  };

  const handleImageSave = (imageUrl: string) => {
    setShowImageEditor(false);
    const normalizedImageUrl = resolveR2PublicUrl(imageUrl);
    setCurrentImageUrl(normalizedImageUrl);

    if (imageEditorCertificationId !== null) {
      setCertifications((current) =>
        current.map((certification) =>
          certification.id === imageEditorCertificationId
            ? { ...certification, imageUrl: normalizedImageUrl }
            : certification
        )
      );
      setImageEditorCertificationId(null);
    }

    showNotification("Image updated successfully", "success");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Certifications Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your professional certifications
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Link
              href="/admin/certifications/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Certification
            </Link>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  placeholder="Search by title, issuer, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Issuer Filter */}
            <div>
              <label htmlFor="issuer-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issuer
              </label>
              <select
                id="issuer-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filterIssuer}
                onChange={(e) => setFilterIssuer(e.target.value)}
              >
                <option value="all">All Issuers</option>
                {getUniqueIssuers().map(issuer => (
                  <option key={issuer} value={issuer}>{issuer}</option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label htmlFor="featured-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="featured-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
              >
                <option value="all">All Certifications</option>
                <option value="featured">Featured Only</option>
                <option value="standard">Standard Only</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort-by"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="displayOrder">Display Order</option>
                  <option value="title">Title</option>
                  <option value="issuer">Issuer</option>
                  <option value="issueDate">Issue Date</option>
                  <option value="expiryDate">Expiry Date</option>
                </select>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? (
                <>
                  <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Hide Advanced Filters
                </>
              ) : (
                <>
                  <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Show Advanced Filters
                </>
              )}
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expiry Status Filter */}
                <div>
                  <label htmlFor="expiry-status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Status
                  </label>
                  <select
                    id="expiry-status-filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={filterExpiryStatus}
                    onChange={(e) => setFilterExpiryStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="valid">Valid</option>
                    <option value="expiring-soon">Expiring Soon (30 days)</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterIssuer("all");
                      setFilterFeatured("all");
                      setFilterExpiryStatus("all");
                      setSortBy("displayOrder");
                      setSortOrder("asc");
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
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

        {/* Certifications Cards */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-lg text-gray-700 dark:text-gray-300">
                  Loading certifications...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <button
              onClick={loadCertifications}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {filteredCertifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    {certifications.length === 0
                      ? "No certifications found."
                      : "No certifications match your search criteria."}
                  </div>
                  <Link
                    href="/admin/certifications/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add your first certification
                  </Link>
                </div>
              ) : (
                <>
                  {/* Results count and view toggle */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{filteredCertifications.length}</span> of{" "}
                      <span className="font-medium">{certifications.length}</span> certifications
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
                      <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                          type="button"
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-gray-200 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:bg-blue-600 dark:border-gray-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:bg-blue-600"
                        >
                          Grid
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:bg-blue-600 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-blue-500 dark:focus:bg-blue-600"
                        >
                          List
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Certifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredCertifications.map((certification) => {
                      const imageSrc = resolveR2PublicUrl(certification.imageUrl);
                      // Check if certification is expired or expiring soon
                      const isExpired = certification.expiryDate ? new Date(certification.expiryDate) < new Date() : false;
                      const isExpiringSoon = certification.expiryDate ?
                        new Date(certification.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                        new Date(certification.expiryDate) >= new Date() : false;
                      
                      return (
                        <div
                          key={certification.id}
                          className={`bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border ${
                            isExpired ? 'border-red-300 dark:border-red-700' :
                            isExpiringSoon ? 'border-yellow-300 dark:border-yellow-700' :
                            'border-gray-200 dark:border-gray-600'
                          } transform hover:-translate-y-1`}
                        >
                          {/* Certification Image */}
                          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600 group">
                            <Image
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={imageSrc}
                              alt={certification.imageAlt}
                              width={400}
                              height={192}
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/400x192?text=Certificate+Image";
                              }}
                            />
                            <div className="absolute top-2 right-2 flex flex-col space-y-1">
                              {certification.featured && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-800 dark:text-green-300" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Featured
                                </span>
                              )}
                              {isExpired && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-800 dark:text-red-300" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Expired
                                </span>
                              )}
                              {isExpiringSoon && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-800 dark:text-yellow-300" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  Expiring Soon
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Certification Content */}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {certification.title}
                              </h3>
                            </div>
                            
                            <div className="mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {certification.issuer}
                              </span>
                            </div>
                            
                            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              <div className="flex items-center">
                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Issued: {certification.issueDate}</span>
                              </div>
                              {certification.expiryDate && (
                                <div className={`flex items-center ${isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Expires: {certification.expiryDate}</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 overflow-hidden">
                              {certification.description || "No description available."}
                            </p>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Updated: {new Date(certification.updatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              
                              <div className="flex space-x-1">
                                <Link
                                  href={`/admin/certifications/${certification.id}`}
                                  className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  title="Edit certification"
                                >
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </Link>
                                <button
                  onClick={() => openImageEditor(certification.imageUrl, certification.id)}
                                  className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  title="Edit certificate image"
                                >
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteCertification(certification.id)}
                                  className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  title="Delete certification"
                                >
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <CertificateImageEditor
          currentImageUrl={currentImageUrl}
          certificationId={imageEditorCertificationId ?? undefined}
          onImageSave={handleImageSave}
          onCancel={() => {
            setShowImageEditor(false);
            setImageEditorCertificationId(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${certificationToDelete?.title}"? This action cannot be undone and will also delete the associated certificate image.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteCertification}
        onCancel={cancelDeleteCertification}
        isDestructive={true}
      />
    </>
  );
}
