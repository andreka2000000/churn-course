import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-bold text-accent mb-4">404</div>
      <h1 className="text-xl font-semibold text-white mb-2">Страница не найдена</h1>
      <p className="text-gray-400 mb-6">
        Похоже, вы забрели не туда
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}