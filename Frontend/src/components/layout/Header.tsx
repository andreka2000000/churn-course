import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Code2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-secondary shrink-0">
      <Link to="/" className="flex items-center gap-2 font-semibold text-white">
        <Code2 size={20} className="text-accent" />
        Учи IT · Прогноз оттока
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <UserIcon size={16} />
              {user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-danger transition"
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-sm transition"
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}