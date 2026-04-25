



import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { authService, saveAuthData } from "../services/api";
import "../main.css";

const buildFormData = (user = {}) => ({
  name: user.name || "",
  email: user.email || "",
  exam: user.exam || "",
  targetDate: user.targetDate ? String(user.targetDate).slice(0, 10) : "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const normalizeText = (value) => String(value || "").trim();

const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const getFallbackUser = () => ({
  name: localStorage.getItem("name") || "",
  email: localStorage.getItem("email") || "",
  exam: localStorage.getItem("exam") || "",
  targetDate: localStorage.getItem("targetDate") || ""
});

const getDaysLeftData = (value) => {
  if (!value) {
    return {
      label: "No target date selected yet",
      tone: "muted",
      daysLeft: null
    };
  }

  const target = new Date(`${value}T12:00:00`);

  if (Number.isNaN(target.getTime())) {
    return {
      label: "Enter a valid target date",
      tone: "danger",
      daysLeft: null
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = Math.ceil((target - today) / 86400000);

  if (diff < 0) {
    const daysAgo = Math.abs(diff);

    return {
      label: `Target date passed ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`,
      tone: "danger",
      daysLeft: diff
    };
  }

  if (diff === 0) {
    return {
      label: "Target date is today",
      tone: "warning",
      daysLeft: 0
    };
  }

  return {
    label: `${diff} day${diff === 1 ? "" : "s"} left`,
    tone: diff <= 14 ? "warning" : "success",
    daysLeft: diff
  };
};

const getProfileCompletion = (data) => {
  let completed = 0;

  if (normalizeText(data.name)) completed += 1;
  if (normalizeEmail(data.email)) completed += 1;
  if (normalizeText(data.exam)) completed += 1;
  if (data.targetDate) completed += 1;

  return Math.round((completed / 4) * 100);
};

const getPasswordStrength = (value) => {
  const password = String(value || "");

  if (!password) {
    return {
      label: "No new password entered",
      tone: "muted"
    };
  }

  let score = 0;

  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return {
      label: "Weak password",
      tone: "danger"
    };
  }

  if (score <= 3) {
    return {
      label: "Medium password",
      tone: "warning"
    };
  }

  return {
    label: "Strong password",
    tone: "success"
  };
};

const mapServerMessageToFieldErrors = (message) => {
  const text = String(message || "").toLowerCase();
  const nextErrors = {};

  if (text.includes("name")) {
    nextErrors.name = message;
  }

  if (text.includes("email")) {
    nextErrors.email = message;
  }

  if (text.includes("exam")) {
    nextErrors.exam = message;
  }

  if (text.includes("target date")) {
    nextErrors.targetDate = message;
  }

  if (text.includes("old password")) {
    nextErrors.oldPassword = message;
  }

  if (text.includes("new password")) {
    nextErrors.newPassword = message;
  }

  if (text.includes("password") && !nextErrors.confirmPassword) {
    nextErrors.confirmPassword = message;
  }

  return nextErrors;
};

function ProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(buildFormData());
  const [initialData, setInitialData] = useState(buildFormData());

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");

  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({
    text: "",
    tone: "muted"
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    next: false,
    confirm: false
  });

  const countdownData = useMemo(() => {
    return getDaysLeftData(formData.targetDate);
  }, [formData.targetDate]);

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(formData.newPassword);
  }, [formData.newPassword]);

  const profileCompletion = useMemo(() => {
    return getProfileCompletion(formData);
  }, [formData]);

  const personalChanged = useMemo(() => {
    return (
      normalizeText(formData.name) !== normalizeText(initialData.name) ||
      normalizeEmail(formData.email) !== normalizeEmail(initialData.email)
    );
  }, [formData, initialData]);

  const examChanged = useMemo(() => {
    return (
      normalizeText(formData.exam) !== normalizeText(initialData.exam) ||
      (formData.targetDate || "") !== (initialData.targetDate || "")
    );
  }, [formData, initialData]);

  const securityChanged = Boolean(
    formData.oldPassword || formData.newPassword || formData.confirmPassword
  );

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await authService.me();

      if (res.data.success) {
        const nextData = buildFormData(res.data.user);

        setFormData(nextData);
        setInitialData(nextData);
        saveAuthData({ user: res.data.user });
      }
    } catch (err) {
      console.error("Profile load failed:", err);

      const fallbackData = buildFormData(getFallbackUser());

      setFormData(fallbackData);
      setInitialData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const setFieldValue = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    if (banner.text) {
      setBanner({
        text: "",
        tone: "muted"
      });
    }
  };

  const handleChange = (e) => {
    setFieldValue(e.target.name, e.target.value);
  };

  const togglePasswordVisibility = (key) => {
    setShowPassword((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const validatePersonalInfo = () => {
    const nextErrors = {};
    const name = normalizeText(formData.name);
    const email = normalizeEmail(formData.email);

    if (!name) {
      nextErrors.name = "Name is required.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    } else if (name.length > 60) {
      nextErrors.name = "Name must be 60 characters or less.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    return nextErrors;
  };

  const validateExamDetails = () => {
    const nextErrors = {};
    const exam = normalizeText(formData.exam);

    if (exam.length > 80) {
      nextErrors.exam = "Exam name must be 80 characters or less.";
    }

    if (formData.targetDate && countdownData.tone === "danger") {
      nextErrors.targetDate = countdownData.label;
    }

    return nextErrors;
  };

  const validateSecurity = () => {
    const nextErrors = {};

    if (!formData.oldPassword) {
      nextErrors.oldPassword = "Old password is required.";
    }

    if (!formData.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 6) {
      nextErrors.newPassword = "New password must be at least 6 characters.";
    } else if (formData.newPassword === formData.oldPassword) {
      nextErrors.newPassword = "New password must be different from old password.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm the new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const buildPayloadForSection = (section) => {
    const payload = {
      name: normalizeText(initialData.name),
      email: normalizeEmail(initialData.email),
      exam: normalizeText(initialData.exam),
      targetDate: initialData.targetDate || null
    };

    if (section === "personal") {
      payload.name = normalizeText(formData.name);
      payload.email = normalizeEmail(formData.email);
    }

    if (section === "exam") {
      payload.exam = normalizeText(formData.exam);
      payload.targetDate = formData.targetDate || null;
    }

    if (section === "security") {
      payload.oldPassword = formData.oldPassword;
      payload.newPassword = formData.newPassword;
    }

    return payload;
  };

  const applySavedSectionState = (section, savedUser) => {
    const savedData = buildFormData(savedUser);

    if (section === "personal") {
      setFormData((prev) => ({
        ...prev,
        name: savedData.name,
        email: savedData.email
      }));

      setInitialData((prev) => ({
        ...prev,
        name: savedData.name,
        email: savedData.email
      }));
    }

    if (section === "exam") {
      setFormData((prev) => ({
        ...prev,
        exam: savedData.exam,
        targetDate: savedData.targetDate
      }));

      setInitialData((prev) => ({
        ...prev,
        exam: savedData.exam,
        targetDate: savedData.targetDate
      }));
    }

    if (section === "security") {
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

  const handleSectionReset = (section) => {
    if (section === "personal") {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name,
        email: initialData.email
      }));

      setErrors((prev) => ({
        ...prev,
        name: "",
        email: ""
      }));

      setBanner({
        text: "Personal information reset.",
        tone: "muted"
      });
    }

    if (section === "exam") {
      setFormData((prev) => ({
        ...prev,
        exam: initialData.exam,
        targetDate: initialData.targetDate
      }));

      setErrors((prev) => ({
        ...prev,
        exam: "",
        targetDate: ""
      }));

      setBanner({
        text: "Exam details reset.",
        tone: "muted"
      });
    }

    if (section === "security") {
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setErrors((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setShowPassword({
        old: false,
        next: false,
        confirm: false
      });

      setBanner({
        text: "Password fields cleared.",
        tone: "muted"
      });
    }
  };

  const handleSectionSave = async (section) => {
    let nextErrors = {};

    if (section === "personal") {
      nextErrors = validatePersonalInfo();

      if (!personalChanged) {
        setBanner({
          text: "No personal information changes to save.",
          tone: "muted"
        });
        return;
      }
    }

    if (section === "exam") {
      nextErrors = validateExamDetails();

      if (!examChanged) {
        setBanner({
          text: "No exam detail changes to save.",
          tone: "muted"
        });
        return;
      }
    }

    if (section === "security") {
      nextErrors = validateSecurity();

      if (!securityChanged) {
        setBanner({
          text: "No password changes to save.",
          tone: "muted"
        });
        return;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setBanner({
        text: "Please fix the highlighted fields.",
        tone: "danger"
      });
      return;
    }

    try {
      setSavingSection(section);
      setErrors({});
      setBanner({
        text: "",
        tone: "muted"
      });

      const payload = buildPayloadForSection(section);
      const res = await authService.updateProfile(payload);

      if (res.data.success) {
        applySavedSectionState(section, res.data.user);
        saveAuthData({ user: res.data.user });
        window.dispatchEvent(new Event("profileUpdated"));

        if (section === "personal") {
          setBanner({
            text: "Personal information saved successfully.",
            tone: "success"
          });
        }

        if (section === "exam") {
          setBanner({
            text: "Exam details saved successfully.",
            tone: "success"
          });
        }

        if (section === "security") {
          setBanner({
            text: "Password updated successfully.",
            tone: "success"
          });
        }
      }
    } catch (err) {
      console.error("Profile save failed:", err);

      const message = err.response?.data?.message || "Profile update failed.";
      const serverFieldErrors = mapServerMessageToFieldErrors(message);

      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors(serverFieldErrors);
      }

      setBanner({
        text: message,
        tone: "danger"
      });
    } finally {
      setSavingSection("");
    }
  };

  const firstLetter = formData.name
    ? formData.name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="profile-wrapper">
      <div className="profile-card-pro profile-page-card">
        <div className="profile-back">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
          </button>
        </div>

        {loading ? (
          <div className="profile-loading-state">Loading profile...</div>
        ) : (
          <div className="profile-page-grid">
            <div className="profile-summary-panel">
              <div className="profile-header">
                <div className="profile-avatar-pro">{firstLetter}</div>
                <h2>Profile Settings</h2>
                <p>Manage your account details</p>
              </div>

              <div className="profile-summary-grid">
                <div className="profile-summary-item">
                  <span>Profile Completion</span>
                  <strong>{profileCompletion}%</strong>
                </div>

                <div className="profile-summary-item">
                  <span>Exam Goal</span>
                  <strong>{formData.exam || "Not set yet"}</strong>
                </div>

                <div className="profile-summary-item">
                  <span>Target Countdown</span>
                  <strong>{countdownData.label}</strong>
                </div>

                <div className="profile-summary-item">
                  <span>Password Status</span>
                  <strong>
                    {securityChanged ? passwordStrength.label : "Unchanged"}
                  </strong>
                </div>
              </div>

              {banner.text && (
                <div className={`profile-banner ${banner.tone}`}>
                  {banner.text}
                </div>
              )}
            </div>

            <div className="profile-editor-panel">
              <div className="profile-section">
                <h3 className="profile-section-title">Personal Information</h3>

                <div className="profile-form-pro">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      maxLength={60}
                      autoComplete="name"
                    />
                    {errors.name && <small className="form-error">{errors.name}</small>}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                    {errors.email && <small className="form-error">{errors.email}</small>}
                  </div>
                </div>

                <div className="profile-actions-pro profile-actions-row">
                  <button
                    type="button"
                    className="profile-reset-btn"
                    onClick={() => handleSectionReset("personal")}
                    disabled={!personalChanged || savingSection === "personal"}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    className="save-btn-pro"
                    onClick={() => handleSectionSave("personal")}
                    disabled={!personalChanged || Boolean(savingSection)}
                  >
                    {savingSection === "personal" ? "Saving..." : "Save Personal Info"}
                  </button>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="profile-section-title">Exam Details</h3>

                <div className="profile-form-pro">
                  <div className="form-group">
                    <label>Exam</label>
                    <input
                      type="text"
                      name="exam"
                      value={formData.exam}
                      onChange={handleChange}
                      placeholder="Example: JEE, NEET, Semester Exam"
                      maxLength={80}
                    />
                    {errors.exam && <small className="form-error">{errors.exam}</small>}
                  </div>

                  <div className="form-group">
                    <label>Target Date</label>
                    <input
                      type="date"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleChange}
                    />
                    <small className={`form-help ${countdownData.tone}`}>
                      {countdownData.label}
                    </small>
                    {errors.targetDate && (
                      <small className="form-error">{errors.targetDate}</small>
                    )}
                  </div>
                </div>

                <div className="profile-actions-pro profile-actions-row">
                  <button
                    type="button"
                    className="profile-reset-btn"
                    onClick={() => handleSectionReset("exam")}
                    disabled={!examChanged || savingSection === "exam"}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    className="save-btn-pro"
                    onClick={() => handleSectionSave("exam")}
                    disabled={!examChanged || Boolean(savingSection)}
                  >
                    {savingSection === "exam" ? "Saving..." : "Save Exam Details"}
                  </button>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="profile-section-title">Security</h3>
                <p className="profile-section-note">
                  Fill password fields only if you want to change your password.
                </p>

                <div className="profile-form-pro">
                  <div className="form-group">
                    <label>Old Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword.old ? "text" : "password"}
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        placeholder="Required only for password change"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility("old")}
                      >
                        {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <small className="form-error">{errors.oldPassword}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword.next ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility("next")}
                      >
                        {showPassword.next ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <small className={`form-help ${passwordStrength.tone}`}>
                      {passwordStrength.label}
                    </small>
                    {errors.newPassword && (
                      <small className="form-error">{errors.newPassword}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <small className="form-error">{errors.confirmPassword}</small>
                    )}
                  </div>
                </div>

                <div className="profile-actions-pro profile-actions-row">
                  <button
                    type="button"
                    className="profile-reset-btn"
                    onClick={() => handleSectionReset("security")}
                    disabled={!securityChanged || savingSection === "security"}
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    className="save-btn-pro"
                    onClick={() => handleSectionSave("security")}
                    disabled={!securityChanged || Boolean(savingSection)}
                  >
                    {savingSection === "security" ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
