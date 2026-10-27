import { useState } from "react";
import { Mail, Send } from "lucide-react";

export function Footer() {
  const [contactsOpen, setContactsOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p className="text-ui-text text-center sm:text-left">
          © 2026 &lt;/&gt; Учи IT. ML-курс «Прогноз оттока клиентов телеком-оператора».
        </p>
        <nav className="flex items-center gap-4">
          <a
            href="https://github.com/andreka2000000"
            className="text-ui-text hover:text-accent transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={() => setContactsOpen((v) => !v)}
            className="text-ui-text hover:text-accent transition-colors"
          >
            Контакты
          </button>
        </nav>
      </div>

      {contactsOpen && (
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-6">
            <a
              href="mailto:andreka_524570@mail.ru"
              aria-label="Написать на email"
              title="Email"
              className="text-ui-text hover:text-accent transition-colors"
            >
              <Mail size={22} />
            </a>
            <a
              href="https://t.me/@kal1nka_a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Telegram"
              title="Telegram"
              className="text-ui-text hover:text-accent transition-colors"
            >
              <Send size={22} />
            </a>
          </div>
        </div>
      )}
    </footer>
  );
}