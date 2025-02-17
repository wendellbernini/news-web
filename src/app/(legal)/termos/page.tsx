export default function TermsPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Termos de Uso</h1>
        <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400">
          Leia atentamente os termos e condições de uso do NewsWeb
        </p>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e usar o NewsWeb, você concorda em cumprir estes Termos de
          Uso e todas as leis e regulamentos aplicáveis. Se você não concordar
          com algum destes termos, está proibido de usar ou acessar este site.
        </p>

        <h2>2. Uso do Serviço</h2>
        <p>
          O NewsWeb fornece um serviço de notícias online. Você concorda em usar
          este serviço apenas para propósitos legais e de uma maneira que não
          infrinja os direitos de terceiros.
        </p>

        <h2>3. Contas de Usuário</h2>
        <p>
          Para acessar determinadas funcionalidades do site, você precisará
          criar uma conta. Você é responsável por manter a confidencialidade de
          sua conta e senha e por restringir o acesso ao seu computador.
        </p>

        <h2>4. Conteúdo do Usuário</h2>
        <p>
          Ao postar comentários ou outro conteúdo no NewsWeb, você concede ao
          NewsWeb uma licença não exclusiva para usar, reproduzir, adaptar e
          publicar o conteúdo.
        </p>

        <h2>5. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo publicado no NewsWeb, incluindo textos, gráficos,
          logos e imagens, é protegido por direitos autorais e outras leis de
          propriedade intelectual.
        </p>

        <h2>6. Limitação de Responsabilidade</h2>
        <p>
          O NewsWeb não será responsável por quaisquer danos diretos, indiretos,
          incidentais, consequenciais ou punitivos resultantes do seu uso do
          site.
        </p>

        <h2>7. Privacidade</h2>
        <p>
          O uso de suas informações pessoais é governado por nossa Política de
          Privacidade, que pode ser encontrada{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">
            aqui
          </a>
          .
        </p>

        <h2>8. Modificações</h2>
        <p>
          O NewsWeb reserva-se o direito de modificar estes termos a qualquer
          momento. Continuando a usar o site após as alterações, você aceita os
          termos modificados.
        </p>

        <h2>9. Lei Aplicável</h2>
        <p>
          Estes termos serão regidos e interpretados de acordo com as leis do
          Brasil, sem considerar conflitos de disposições legais.
        </p>

        <h2>10. Contato</h2>
        <p>
          Se você tiver alguma dúvida sobre estes Termos de Uso, entre em
          contato conosco através da nossa{' '}
          <a href="/contato" className="text-primary-600 hover:underline">
            página de contato
          </a>
          .
        </p>

        <div className="mt-8 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/10">
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
