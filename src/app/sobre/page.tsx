import { Metadata } from 'next';
import Image from 'next/image';
import { RootLayout } from '@/components/layout/RootLayout';
import { Newspaper, Users, Globe, Shield } from 'lucide-react';
import { SITE_NAME, SITE_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Sobre | ${SITE_NAME}`,
  description: `Conheça mais sobre o ${SITE_NAME} e nossa missão de informar`,
};

const features = [
  {
    icon: Newspaper,
    title: 'Jornalismo de Qualidade',
    description:
      'Comprometidos com a verdade e a precisão em todas as nossas reportagens.',
  },
  {
    icon: Users,
    title: 'Comunidade Engajada',
    description:
      'Uma plataforma que valoriza a participação e o diálogo com nossos leitores.',
  },
  {
    icon: Globe,
    title: 'Cobertura Abrangente',
    description:
      'Notícias relevantes sobre o Rio de Janeiro e temas que impactam nossa cidade.',
  },
  {
    icon: Shield,
    title: 'Compromisso com a Ética',
    description:
      'Seguimos rigorosos padrões éticos e princípios jornalísticos.',
  },
];

export default function AboutPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold">Sobre o {SITE_NAME}</h1>
            <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400">
              {SITE_INFO.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border border-secondary-200 p-6 dark:border-secondary-800"
              >
                <feature.icon className="mb-4 h-8 w-8 text-primary-600" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="mb-16 rounded-lg bg-primary-50 p-8 dark:bg-primary-900/10">
            <h2 className="mb-4 text-2xl font-bold">Nossa Missão</h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              {SITE_INFO.mission}
            </p>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold">Nossa Equipe</h2>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((member) => (
                <div key={member} className="text-center">
                  <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                    <Image
                      src={`/images/team-member-${member}.jpg`}
                      alt="Membro da equipe"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">Nome do Membro</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Cargo
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Entre em Contato</h2>
            <p className="mb-6 text-secondary-600 dark:text-secondary-400">
              Tem alguma dúvida ou sugestão? Gostaríamos muito de ouvir você.
            </p>
            <div className="space-y-2 text-secondary-600 dark:text-secondary-400">
              <p>Email: {SITE_INFO.email}</p>
              <p>Telefone: {SITE_INFO.phone}</p>
              <p>Endereço: {SITE_INFO.address}</p>
            </div>
            <a
              href="/contato"
              className="mt-6 inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
