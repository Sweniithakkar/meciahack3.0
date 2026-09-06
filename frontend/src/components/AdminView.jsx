import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function AdminView({ currentUser, onNavigateHome }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected User detail modal state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const isAdmin = currentUser && currentUser.role === 'admin';

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, actRes, docsRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminUsers(),
        apiService.getAdminActivity(),
        apiService.getAdminDocuments(),
      ]);
      setStats(statsRes);
      setUsers(usersRes || []);
      setActivity(actRes || []);
      setDocuments(docsRes || []);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError(err.message || 'Access Denied or Failed to fetch admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleOpenUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    setDetailError(null);
    setUserDetail(null);
    try {
      const data = await apiService.getAdminUserById(userId);
      setUserDetail(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setDetailError(err.message || 'Failed to load user details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseUserDetail = () => {
    setSelectedUserId(null);
    setUserDetail(null);
    setDetailError(null);
  };

  // Access Denied State for non-admin users attempting to open Admin view
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-6V7a4 4 0 118 0v4m-8 0h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#01162B]">HTTP 403 — Admin Authorization Required</h2>
        <p className="text-sm text-[#00385A] max-w-md mx-auto leading-relaxed">
          Access to the Legal Lens Admin Console is restricted strictly to authorized administrative accounts.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#01162B] text-white text-sm font-semibold rounded-xl hover:bg-[#002447] transition-all shadow-md cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // User Filtering Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.id).includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredActivity = activity.filter(a =>
    a.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(d =>
    d.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-[#D2DBEB]/80">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
              Admin Privilege
            </span>
            <span className="text-xs text-[#00385A] font-medium">Logged in as {currentUser.email}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#01162B] tracking-tight mt-2">
            Legal Lens Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-[#00385A] mt-1">
            System-wide user directory, document telemetry, and security audit logs.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#01162B] text-white text-xs font-semibold rounded-xl hover:bg-[#002447] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchData} className="underline text-red-800 font-bold ml-2 cursor-pointer">Retry</button>
        </div>
      )}

      {/* Analytics Metric Cards (OVERVIEW) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D2DBEB]/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#00385A]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#01162B]">
              {loading ? '...' : stats?.total_users ?? users.length}
            </span>
            <p className="text-[11px] text-[#00385A] font-medium mt-0.5">Registered User Accounts</p>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D2DBEB]/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#00385A]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#01162B]">
              {loading ? '...' : stats?.active_users ?? users.filter(u => u.status === 'Active').length}
            </span>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Active & Verified Accounts</p>
          </div>
        </div>

        {/* Card 3: Total Documents */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D2DBEB]/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#00385A]">
            <span className="text-xs font-bold uppercase tracking-wider">Documents Uploaded</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#01162B]">
              {loading ? '...' : stats?.total_documents ?? documents.length}
            </span>
            <p className="text-[11px] text-[#00385A] font-medium mt-0.5">Total Uploaded PDFs</p>
          </div>
        </div>

        {/* Card 4: Total Analyses */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D2DBEB]/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#00385A]">
            <span className="text-xs font-bold uppercase tracking-wider">Analyses Performed</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#01162B]">
              {loading ? '...' : stats?.total_analyses ?? documents.length}
            </span>
            <p className="text-[11px] text-[#00385A] font-medium mt-0.5">Completed AI Pipeline Runs</p>
          </div>
        </div>

      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#D2DBEB]/80 p-6 space-y-6">
        
        {/* Navigation Tabs & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#01162B] text-white shadow-sm' : 'text-[#00385A] hover:bg-slate-200'
              }`}
            >
              User Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'activity' ? 'bg-[#01162B] text-white shadow-sm' : 'text-[#00385A] hover:bg-slate-200'
              }`}
            >
              System Activity Log ({activity.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'documents' ? 'bg-[#01162B] text-white shadow-sm' : 'text-[#00385A] hover:bg-slate-200'
              }`}
            >
              Document Store ({documents.length})
            </button>
          </div>

          {/* Controls: Search, Role Filter, Status Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-slate-50 text-[#01162B] focus:outline-none focus:border-[#01162B] flex-1 sm:w-48"
            />

            {activeTab === 'overview' && (
              <>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-slate-50 text-[#01162B] focus:outline-none focus:border-[#01162B] cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-slate-50 text-[#01162B] focus:outline-none focus:border-[#01162B] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </>
            )}

          </div>

        </div>

        {/* Tab 1: USER MANAGEMENT DIRECTORY */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-[#00385A] space-y-3">
                <div className="h-6 w-6 border-2 border-[#01162B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Loading user directory from database...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#01162B]">
                <thead className="bg-slate-50 text-[#00385A] uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">User ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4">Docs Uploaded</th>
                    <th className="py-3 px-4">Analyses Run</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        No user accounts match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr 
                        key={u.id} 
                        onClick={() => handleOpenUserDetail(u.id)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono text-gray-500 font-semibold">#{u.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#01162B] group-hover:text-[#00385A]">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-4 text-[#00385A] font-mono">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{u.document_count ?? 0} docs</td>
                        <td className="py-3.5 px-4 font-semibold">{u.analysis_count ?? 0} runs</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUserDetail(u.id);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-[#01162B] hover:text-white text-[#01162B] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: SYSTEM ACTIVITY AUDIT LOG */}
        {activeTab === 'activity' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-[#00385A] space-y-3">
                <div className="h-6 w-6 border-2 border-[#01162B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Loading system audit logs...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#01162B]">
                <thead className="bg-slate-50 text-[#00385A] uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                    <th className="py-3 px-4">Associated User</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 rounded-r-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">No activity logs recorded yet.</td>
                    </tr>
                  ) : (
                    filteredActivity.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-400">#{a.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#01162B]">{a.user_name || 'System / Guest'}</div>
                          {a.user_email && <div className="text-[10px] text-gray-400 font-mono">{a.user_email}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                            a.action === 'USER_REGISTER' ? 'bg-blue-100 text-blue-800' :
                            a.action === 'USER_LOGIN' ? 'bg-emerald-100 text-emerald-800' :
                            a.action === 'DOCUMENT_ANALYZE' ? 'bg-purple-100 text-purple-800' :
                            a.action === 'DOCUMENT_DELETE' ? 'bg-red-100 text-red-800' :
                            a.action === 'RAG_QUESTION' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {a.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#00385A] max-w-xs truncate" title={a.details}>{a.details || '-'}</td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {a.created_at ? new Date(a.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: DOCUMENT STORE ANALYTICS */}
        {activeTab === 'documents' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-[#00385A] space-y-3">
                <div className="h-6 w-6 border-2 border-[#01162B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Loading document store telemetry...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#01162B]">
                <thead className="bg-slate-50 text-[#00385A] uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Document ID</th>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl">Upload Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">No stored documents found.</td>
                    </tr>
                  ) : (
                    filteredDocuments.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-400 font-semibold">{d.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#01162B] max-w-xs truncate" title={d.filename}>
                          {d.filename}
                        </td>
                        <td className="py-3 px-4 text-[#00385A]">
                          {d.user_name ? (
                            <div>
                              <div className="font-semibold">{d.user_name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{d.user_email}</div>
                            </div>
                          ) : (
                            <span className="font-mono">{d.user_email || `User #${d.user_id}`}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">{d.file_size || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            {d.status || 'Document analyzed'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{d.upload_date || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* USER DETAILS INSPECTOR MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={handleCloseUserDetail}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#D2DBEB] max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#01162B] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase rounded-full border border-amber-400/30">
                    User Details Inspector
                  </span>
                  <span className="text-xs text-slate-300 font-mono">User #{selectedUserId}</span>
                </div>
                <h3 className="text-lg font-extrabold mt-1">
                  {userDetail?.user?.name || `User #${selectedUserId}`}
                </h3>
              </div>

              <button
                onClick={handleCloseUserDetail}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close user modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#01162B]">
              
              {loadingDetail ? (
                <div className="py-16 text-center text-[#00385A] space-y-3">
                  <div className="h-8 w-8 border-3 border-[#01162B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Fetching user profile, documents & activity history...</p>
                </div>
              ) : detailError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">
                  ⚠️ {detailError}
                </div>
              ) : userDetail ? (
                <>
                  {/* User Profile Information */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Full Name</span>
                      <span className="font-semibold text-sm text-[#01162B]">{userDetail.user.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="font-mono text-[#00385A] font-semibold">{userDetail.user.email}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Role</span>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        userDetail.user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {userDetail.user.role || 'user'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Account Status</span>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        userDetail.user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {userDetail.user.status || 'Active'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Registration Date</span>
                      <span className="font-mono text-gray-600">
                        {userDetail.user.created_at ? new Date(userDetail.user.created_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Last Activity</span>
                      <span className="font-mono text-gray-600">
                        {userDetail.user.last_activity ? new Date(userDetail.user.last_activity).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Documents</span>
                      <span className="font-bold text-sm text-[#01162B]">{userDetail.documents?.length ?? 0}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Activity Logs</span>
                      <span className="font-bold text-sm text-[#01162B]">{userDetail.activity?.length ?? 0}</span>
                    </div>
                  </div>

                  {/* Section 1: Documents Uploaded By User */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#01162B] flex items-center justify-between">
                      <span>Uploaded Documents ({userDetail.documents?.length || 0})</span>
                    </h4>

                    {userDetail.documents?.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 font-medium">
                        No documents uploaded by this user yet.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-gray-600 text-[10px] uppercase font-bold">
                            <tr>
                              <th className="py-2 px-3">Doc ID</th>
                              <th className="py-2 px-3">Filename</th>
                              <th className="py-2 px-3">Size</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3">Upload Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userDetail.documents.map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-gray-400">{d.id}</td>
                                <td className="py-2 px-3 font-semibold text-[#01162B]">{d.filename}</td>
                                <td className="py-2 px-3 font-mono text-gray-500">{d.file_size || 'N/A'}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                                    {d.status || 'Analyzed'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-mono text-gray-500 text-[11px]">{d.upload_date || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Section 2: User Activity History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#01162B]">
                      Recent Activity History ({userDetail.activity?.length || 0})
                    </h4>

                    {userDetail.activity?.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 font-medium">
                        No recorded activity logs for this user.
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-gray-600 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                              <th className="py-2 px-3">Log ID</th>
                              <th className="py-2 px-3">Event Action</th>
                              <th className="py-2 px-3">Details</th>
                              <th className="py-2 px-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userDetail.activity.map((l) => (
                              <tr key={l.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-gray-400">#{l.id}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold rounded-md">
                                    {l.action}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-[#00385A]">{l.details || '-'}</td>
                                <td className="py-2 px-3 font-mono text-gray-500 text-[11px]">
                                  {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseUserDetail}
                className="px-5 py-2 bg-[#01162B] text-white text-xs font-semibold rounded-xl hover:bg-[#002447] transition-all shadow-sm cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
