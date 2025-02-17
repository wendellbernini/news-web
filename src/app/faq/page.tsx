import { Metadata } from 'next';
import { RootLayout } from '@/components/layout/RootLayout';
import { Accordion } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | NewsWeb',
  description:
    'Encontre respostas para as perguntas mais comuns sobre o NewsWeb',
};

const faqItems = [
  {
    question: 'Como faço para criar uma conta no NewsWeb?',
    answer:
      'Você pode criar uma conta facilmente clicando no botão "Entrar" no topo da página e escolhendo entre fazer login com sua conta Google ou criar uma nova conta com seu e-mail.',
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
    question: 'Como posso entrar em contato com a equipe do NewsWeb?',
    answer:
      'Você pode entrar em contato conosco através da nossa página de contato ou enviando um e-mail diretamente para contato@newsweb.com.',
  },
  {
    question: 'O NewsWeb é gratuito?',
    answer:
      'Sim, o NewsWeb é completamente gratuito para todos os usuários. Não há custos para ler, comentar ou interagir com as notícias.',
  },
  {
    question: 'Como posso sugerir uma pauta?',
    answer:
      'Sugestões de pauta podem ser enviadas através do nosso formulário de contato. Nossa equipe editorial avalia todas as sugestões recebidas.',
  },
];

export default function FAQPage() {
  return (
    <RootLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Perguntas Frequentes</h1>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400">
              Encontre respostas para as perguntas mais comuns sobre o NewsWeb
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
    </RootLayout>
  );
}
