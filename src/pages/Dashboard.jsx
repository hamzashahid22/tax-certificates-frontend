import { useState, useEffect } from "react";
import "./Dashboard.css";
import WorkspaceDialog from "../components/WorkspaceDialog";
import Navbar from "../components/Layout/Navbar";
import UserModal from "../components/UserModal";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCertificates,
  deleteCertificate,
} from "../services/api";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      showToast("Error fetching users", "error");
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await getCertificates();
      setCertificates(res.data);
    } catch {
      showToast("Error fetching certificates", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCertificates();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = async (id) => {

    try {
      await deleteUser(id);
      fetchUsers();
      fetchCertificates();
      showToast("User deleted successfully");
    } catch {
      showToast("Error deleting user", "error");
    }
  };

  const handleSaveUser = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        showToast("User updated successfully");
      } else {
        await createUser(data);
        showToast("User created successfully");
      }
      fetchUsers();
    } catch {
      showToast("Error saving user", "error");
    }
  };

  const handleDeleteCertificate = async (id) => {

    try {
      await deleteCertificate(id);
      fetchCertificates();
      showToast("Certificate deleted successfully");
    } catch {
      showToast("Error deleting certificate", "error");
    }
  };

  return (
    <>
      <Navbar onAddUser={handleAddUser} />

      <div className="dashboard-page">
        {/* Page Header */}
        <div className="dashboard-header">
          <div>
          <p className="dashboard-eyebrow">WORKSPACE OVERVIEW</p>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your users and tax certificates
          </p>
          </div>
          <div className="dashboard-date">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Total Certificates"
            value={certificates.length}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="This Month"
            value={certificates.filter(c => {
              const d = new Date(c.issueDate);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            color="emerald"
          />
        </div>

        {/* Users Table */}
        <section aria-labelledby="users-heading" className="dashboard-table-card">
            <div className="dashboard-table-heading"><div><h2 id="users-heading">Users <span className="dashboard-count">{users.length}</span></h2><p>Your registered customers and contact details.</p></div><span className="dashboard-table-label">CUSTOMER DIRECTORY</span></div>
            <div className="dashboard-table-scroll" tabIndex={0}>
              <table className="dashboard-table">
                <thead>
                  <tr >
                    <th scope="col">Name</th>
                    <th scope="col">Address</th>
                    <th scope="col">CNIC</th>
                    <th scope="col">Created At</th>
                    <th scope="col" className="dashboard-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody >
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">No users yet</p>
                          <p className="text-gray-400 text-sm mt-1">Click "Add User" to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="dashboard-address">{user.address}</td>
                        <td className="px-6 py-4">
                          <span className="dashboard-cnic">
                            {user.cnic}
                          </span>
                        </td>
                        <td className="dashboard-cell-date">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="dashboard-action dashboard-action-edit"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ kind: "user", id: user.id, name: user.name })}
                              className="dashboard-action dashboard-action-delete"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </section>

        {/* Certificates Table */}
        <section aria-labelledby="certificates-heading" className="dashboard-table-card">
            <div className="dashboard-table-heading"><div><h2 id="certificates-heading">Certificates <span className="dashboard-count">{certificates.length}</span></h2><p>Tax certificates and their recorded amounts.</p></div><span className="dashboard-table-label">CERTIFICATE REGISTER</span></div>
            <div className="dashboard-table-scroll" tabIndex={0}>
              <table className="dashboard-table">
                <thead>
                  <tr >
                    <th scope="col">S.No</th>
                    <th scope="col">Tax Year</th>
                    <th scope="col">Tax Amount</th>
                    <th scope="col">Issue Date</th>
                    <th scope="col">Value</th>
                    <th scope="col" className="dashboard-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody >
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">No certificates yet</p>
                          <p className="text-gray-400 text-sm mt-1">Click "Create Certificate" to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id} >
                        <td className="px-6 py-4">
                          <span className="dashboard-serial-number">
                            {cert.serialNumber || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="dashboard-year">
                            {cert.taxYear}
                          </span>
                        </td>
                        <td className="dashboard-amount">
                          Rs. {Number(cert.taxAmount).toLocaleString()}
                        </td>
                        <td className="dashboard-cell-date">
                          {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="dashboard-amount">
                          Rs. {Number(cert.value).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="dashboard-action dashboard-action-edit"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ kind: "certificate", id: cert.id, name: cert.taxYear })}
                              className="dashboard-action dashboard-action-delete"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </section>
      </div>

      <WorkspaceDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} busy={deleting} danger
        title={deleteTarget?.kind === "user" ? "Delete this user?" : "Delete this certificate?"}
        description="Please review before removing this record."
        actions={<><button className="workspace-button" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="workspace-button workspace-button-danger" disabled={deleting} onClick={async () => {
          setDeleting(true);
          try {
            if (deleteTarget.kind === "user") await handleDeleteUser(deleteTarget.id);
            else await handleDeleteCertificate(deleteTarget.id);
            setDeleteTarget(null);
          } finally { setDeleting(false); }
        }}>{deleting ? "Deleting�" : "Delete " + (deleteTarget?.kind || "record")}</button></>}>
        <p><strong>{deleteTarget?.name}</strong> will be permanently deleted.{deleteTarget?.kind === "user" ? " This also removes their associated certificates." : ""}</p>
      </WorkspaceDialog>

      {/* User Modal */}
      <UserModal
        elegant
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 flex items-center gap-2 ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>
          {toast.type === "error" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className={`dashboard-stat dashboard-stat-${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="dashboard-stat-value">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
