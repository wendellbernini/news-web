import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-secondary-200 bg-white dark:border-secondary-800 dark:bg-secondary-950">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Sobre</h3>
            <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-400">
              O NewsWeb é um portal de notícias moderno e confiável, trazendo as
              últimas informações sobre diversos assuntos.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Categorias</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/categorias/tecnologia"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias/esportes"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Esportes
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias/politica"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Política
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias/entretenimento"
                  className="text-sm text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
                >
                  Entretenimento
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Redes Sociais</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-600 hover:text-primary-600 dark:text-secondary-400"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-200 pt-8 dark:border-secondary-800">
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400">
            © {new Date().getFullYear()} NewsWeb. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
