import { useState } from "react";
import Button from "../ui/Button";
import "../styles/profileMenu.css";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="profile-container">
      <div
        className="profile-circle"
        onClick={() => setOpen(!open)}
      >
        👤
      </div>

      {open && (
        <div className="profile-menu">
          <p className="profile-title">My Profile</p>

          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}