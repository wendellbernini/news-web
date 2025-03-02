import { Metadata } from 'next';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Accordion } from '@/components/ui/Accordion';
import { SITE_NAME, SITE_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Perguntas Frequentes | ${SITE_NAME}`,
  description: `Encontre respostas para as perguntas mais comuns sobre o ${SITE_NAME}`,
};

const faqItems = [
  {
    question: `Como faço para criar uma conta no ${SITE_NAME}?`,
    answer:
      'Para criar uma conta, clique no botão "Entrar" no canto superior direito e selecione "Criar conta". Você pode se cadastrar usando seu e-mail e senha ou sua conta do Google.',
  },
  {
    question: 'Como posso comentar em uma notícia?',
    answer:
      'Para comentar em uma notícia, você precisa estar logado em sua conta. Após fazer login, basta rolar até a seção de comentários no final da notícia e compartilhar sua opinião.',
  },
  {
    question: 'Como funciona o sistema de curtidas?',
    answer:
      'O sistema de curtidas permite que você demonstre seu interesse por uma notícia. Cada usuário pode curtir uma notícia apenas uma vez, e o número total de curtidas ajuda a destacar as notícias mais relevantes.',
  },
  {
    question: 'Como posso compartilhar uma notícia?',
    answer:
      'Cada notícia possui um botão de compartilhamento que permite enviar o link para várias redes sociais ou copiar o link diretamente para a área de transferência.',
  },
  {
    question: 'Como faço para receber notificações de novas notícias?',
    answer:
      'Você pode ativar as notificações do navegador para receber alertas quando publicarmos novas notícias. Além disso, você pode se inscrever em nossa newsletter para receber atualizações por e-mail.',
  },
  {
    question: `Como posso entrar em contato com a equipe do ${SITE_NAME}?`,
    answer: `Você pode entrar em contato conosco através da nossa página de contato ou enviando um e-mail diretamente para ${SITE_INFO.email}.`,
  },
  {
    question: `O ${SITE_NAME} é gratuito?`,
    answer: `Sim, o ${SITE_NAME} é completamente gratuito para todos os usuários. Não há custos para ler, comentar ou interagir com as notícias.`,
  },
  {
    question: 'Como posso sugerir uma pauta?',
    answer:
      'Sugestões de pauta podem ser enviadas através do nosso formulário de contato. Nossa equipe editorial avalia todas as sugestões recebidas.',
  },
];

export default function FAQPage() {
  return (
    <ClientLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Perguntas Frequentes</h1>
            <p className="mb-8 text-lg text-gray-600">
              Encontre respostas para as perguntas mais comuns sobre o{' '}
              {SITE_NAME}
            </p>
          </div>

          <Accordion items={faqItems} />

          <div className="mt-8 text-center">
            <p className="text-secondary-600 dark:text-secondary-400">
              Não encontrou o que procurava?{' '}
              <a
                href="/contato"
                className="text-primary-600 hover:underline dark:text-primary-400"
              >
                Entre em contato conosco
              </a>
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
