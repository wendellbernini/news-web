import { Metadata } from 'next';
import Image from 'next/image';
import { RootLayout } from '@/components/layout/RootLayout';
import { Newspaper, Users, Globe, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre | NewsWeb',
  description: 'Conheça mais sobre o NewsWeb e nossa missão de informar',
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
      'Notícias relevantes sobre diversos temas que impactam nossa sociedade.',
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
            <h1 className="text-4xl font-bold">Sobre o NewsWeb</h1>
            <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400">
              Um portal de notícias moderno e confiável, comprometido com a
              qualidade da informação e a experiência do leitor.
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
              O NewsWeb nasceu com a missão de fornecer informação de qualidade
              de forma acessível e moderna. Acreditamos no poder do jornalismo
              para transformar a sociedade e na importância de manter nossos
              leitores bem informados sobre os acontecimentos mais relevantes.
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
            <a
              href="/contato"
              className="inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
