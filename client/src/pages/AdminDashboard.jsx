import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { adminService, clearAuthData } from "../services/api";
import "../main.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const getErrorMessage = (err, fallback) => {
    console.error(fallback, err);
    return err.response?.data?.message || err.message || fallback;
  };

  const loadAdminData = async (searchText = "") => {
    try {
      setLoading(true);
      setMessage("");

      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(searchText)
      ]);

      setStats(statsRes.data?.stats || {});
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const changeRole = async (user) => {
    const nextRole = user.role === "admin" ? "student" : "admin";

    try {
      await adminService.updateUserRole(user.id, nextRole);
      await loadAdminData(search);
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to update role"));
    }
  };

  const toggleBlock = async (user) => {
    const nextStatus = !user.isBlocked;

    try {
      await api.put(`/admin/users/${user.id}/block`, {
        isBlocked: nextStatus
      });

      await loadAdminData(search);
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to update user status"));
    }
  };

  const removeUser = async (user) => {
    const ok = window.confirm(`Delete ${user.email}?`);

    if (!ok) return;

    try {
      await adminService.deleteUser(user.id);
      await loadAdminData(search);
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to delete user"));
    }
  };

  const logout = () => {
    clearAuthData();
    navigate("/admin-login", { replace: true });
  };

  const searchUsers = (e) => {
    e.preventDefault();
    loadAdminData(search);
  };

  const clearSearch = () => {
    setSearch("");
    loadAdminData("");
  };

  return (
    <div className="admin-console admin-dashboard-ui">
      <div className="admin-hero-bar">
        <div>
          <span className="admin-eyebrow">Admin Console</span>
          <h1>Admin Dashboard</h1>
          <p>Manage users, roles, access, and student activity.</p>
        </div>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </div>

      {message && <div className="admin-alert">{message}</div>}

      <div className="admin-stats-grid">
        <div className="admin-stat-card blue">
          <span>Total Users</span>
          <strong>{stats.totalUsers || 0}</strong>
        </div>

        <div className="admin-stat-card green">
          <span>Students</span>
          <strong>{stats.totalStudents || 0}</strong>
        </div>

        <div className="admin-stat-card violet">
          <span>Admins</span>
          <strong>{stats.totalAdmins || 0}</strong>
        </div>

        <div className="admin-stat-card amber">
          <span>Blocked</span>
          <strong>{stats.totalBlocked || 0}</strong>
        </div>

        <div className="admin-stat-card cyan">
          <span>MCQ Attempts</span>
          <strong>{stats.totalMcqAttempts || 0}</strong>
        </div>

        <div className="admin-stat-card rose">
          <span>Study Logs</span>
          <strong>{stats.totalStudyLogs || 0}</strong>
        </div>
      </div>

      <div className="admin-users-card">
        <div className="admin-users-head">
          <div>
            <h2>Users</h2>
            <p>{users.length} users shown</p>
          </div>

          <form onSubmit={searchUsers} className="admin-search modern">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, exam"
            />

            {search && (
              <button type="button" className="admin-clear-btn" onClick={clearSearch}>
                Clear
              </button>
            )}

            <button type="submit">Search</button>
          </form>
        </div>

        {loading ? (
          <p className="admin-muted">Loading users...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Exam</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name || "-"}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.exam || "-"}</td>
                    <td>
                      <span className={`admin-role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          user.isBlocked ? "blocked" : "active"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="admin-action-row">
                        <button
                          className="admin-small-btn view"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          View
                        </button>

                        <button
                          className="admin-small-btn"
                          onClick={() => changeRole(user)}
                        >
                          {user.role === "admin" ? "Make Student" : "Make Admin"}
                        </button>

                        <button
                          className="admin-small-btn warning"
                          disabled={user.role === "admin"}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>

                        <button
                          className="admin-small-btn danger"
                          onClick={() => removeUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!users.length && <p className="admin-muted">No users found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
