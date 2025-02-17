export default function PrivacyPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Política de Privacidade</h1>
        <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400">
          Como tratamos e protegemos suas informações pessoais
        </p>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h2>1. Informações que Coletamos</h2>
        <p>
          Coletamos informações que você nos fornece diretamente ao criar uma
          conta ou interagir com nosso site, incluindo:
        </p>
        <ul>
          <li>Nome e endereço de e-mail</li>
          <li>Foto de perfil (quando fornecida)</li>
          <li>Comentários e interações no site</li>
          <li>Preferências de notícias e categorias</li>
        </ul>

        <h2>2. Como Usamos suas Informações</h2>
        <p>Utilizamos suas informações para:</p>
        <ul>
          <li>Fornecer e personalizar nossos serviços</li>
          <li>Enviar atualizações e newsletters (com seu consentimento)</li>
          <li>Melhorar nossa plataforma</li>
          <li>Responder a suas solicitações e comentários</li>
        </ul>

        <h2>3. Compartilhamento de Informações</h2>
        <p>
          Não vendemos suas informações pessoais. Compartilhamos suas
          informações apenas:
        </p>
        <ul>
          <li>Com seu consentimento explícito</li>
          <li>Para cumprir obrigações legais</li>
          <li>Com prestadores de serviços que nos auxiliam</li>
        </ul>

        <h2>4. Segurança</h2>
        <p>
          Implementamos medidas de segurança técnicas e organizacionais para
          proteger suas informações contra acesso não autorizado, alteração,
          divulgação ou destruição.
        </p>

        <h2>5. Cookies e Tecnologias Similares</h2>
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua
          experiência, entender como você usa nosso site e personalizar nosso
          conteúdo.
        </p>

        <h2>6. Seus Direitos</h2>
        <p>Você tem o direito de:</p>
        <ul>
          <li>Acessar suas informações pessoais</li>
          <li>Corrigir dados imprecisos</li>
          <li>Solicitar a exclusão de seus dados</li>
          <li>Retirar seu consentimento</li>
          <li>Receber seus dados em formato estruturado</li>
        </ul>

        <h2>7. Retenção de Dados</h2>
        <p>
          Mantemos suas informações apenas pelo tempo necessário para fornecer
          nossos serviços ou cumprir nossas obrigações legais.
        </p>

        <h2>8. Menores de Idade</h2>
        <p>
          Nossos serviços não são direcionados a menores de 13 anos. Não
          coletamos intencionalmente informações de crianças.
        </p>

        <h2>9. Alterações na Política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Notificaremos você
          sobre alterações significativas através de aviso em nosso site ou por
          e-mail.
        </p>

        <h2>10. Contato</h2>
        <p>
          Para questões sobre esta política ou seus dados pessoais, entre em
          contato através da nossa{' '}
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
