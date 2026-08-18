import "./Profile.css";

function Profile() {
  return (
    <div className="profile-page">

      {/* Header */}
      <section className="profile-page-header">
        <div>
          <p className="profile-eyebrow">ACCOUNT</p>

          <h2>My Profile</h2>

          <p>
            Manage your personal information and account settings.
          </p>
        </div>
      </section>


      {/* Profile overview */}
      <section className="profile-overview">

        <div className="profile-main">

          <div className="profile-large-avatar">
            SA
          </div>

          <div className="profile-main-info">
            <h3>Super Admin</h3>

            <p>admin@valetparking.com</p>

            <div className="profile-status">
              <span></span>
              Active account
            </div>
          </div>

        </div>

        <div className="profile-role">
          <span>APPLICATION ROLE</span>
          <strong>Super Admin</strong>
        </div>

      </section>


      {/* Main grid */}
      <section className="profile-grid">

        {/* Personal Information */}

        <div className="profile-panel">

          <div className="profile-panel-header">
            <div>
              <h3>Personal Information</h3>
              <p>Your basic account information</p>
            </div>

            <button className="profile-edit-button">
              Edit
            </button>
          </div>


          <div className="profile-fields">

            <div className="profile-field">
              <span>FULL NAME</span>
              <strong>Super Admin</strong>
            </div>

            <div className="profile-field">
              <span>EMAIL ADDRESS</span>
              <strong>admin@valetparking.com</strong>
            </div>

            <div className="profile-field">
              <span>ROLE</span>
              <strong>Super Admin</strong>
            </div>

            <div className="profile-field">
              <span>ACCOUNT STATUS</span>

              <strong className="active-field">
                <span></span>
                Active
              </strong>
            </div>

          </div>

        </div>


        {/* Account Information */}

        <div className="profile-panel">

          <div className="profile-panel-header">
            <div>
              <h3>Account Information</h3>
              <p>Details about your system account</p>
            </div>
          </div>


          <div className="profile-fields">

            <div className="profile-field">
              <span>ACCOUNT ID</span>
              <strong>ADM-001</strong>
            </div>

            <div className="profile-field">
              <span>CREATED DATE</span>
              <strong>August 01, 2026</strong>
            </div>

            <div className="profile-field">
              <span>LAST LOGIN</span>
              <strong>Today, 09:42 AM</strong>
            </div>

            <div className="profile-field">
              <span>ACCESS LEVEL</span>
              <strong>Full System Access</strong>
            </div>

          </div>

        </div>

      </section>


      {/* Security */}

      <section className="profile-security">

        <div className="profile-panel-header">

          <div>
            <h3>Security</h3>

            <p>
              Manage your password and account security.
            </p>
          </div>

        </div>


        <div className="security-options">

          <div className="security-option">

            <div className="security-icon">
              *
            </div>

            <div>
              <strong>Password</strong>

              <span>
                Last changed more than 30 days ago
              </span>
            </div>

            <button>
              Change Password
            </button>

          </div>


          <div className="security-option">

            <div className="security-icon">
              ✓
            </div>

            <div>
              <strong>Account Security</strong>

              <span>
                Your account is protected and active
              </span>
            </div>

            <span className="security-active">
              Protected
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Profile;