interface EmailTemplateProps {
  userName: string;
  news: any[];
  baseUrl: string;
}

export const getNewsletterTemplate = ({
  userName,
  news,
  baseUrl,
}: EmailTemplateProps) => {
  // Garantir que a baseUrl não termina com barra
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const newsHtml = news
    .map(
      (item) => `
    <div style="margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
      <h2 style="margin: 0; color: #2c5282;">${item.title}</h2>
      <p style="margin: 10px 0; color: #4a5568;">${item.summary}</p>
      <a href="${cleanBaseUrl}/noticias/${item.slug}"
         style="display: inline-block;
                padding: 8px 16px;
                background-color: #2c5282;
                color: white;
                text-decoration: none;
                border-radius: 4px;">
        Ler mais
      </a>
    </div>
  `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${cleanBaseUrl}/images/logo.png" alt="Rio de Fato" style="max-width: 200px;">
      </div>

      <h1 style="color: #2c5282; margin-bottom: 20px;">Olá, ${userName}!</h1>

      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
        Aqui estão as últimas notícias selecionadas especialmente para você:
      </p>

      <div style="margin: 30px 0;">
        ${newsHtml}
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #718096; font-size: 14px;">
          Para gerenciar suas preferências de newsletter ou cancelar a inscrição,
          <a href="${cleanBaseUrl}/perfil/newsletter" style="color: #2c5282; text-decoration: none;">clique aqui</a>.
        </p>
      </div>
    </div>
  `;
};
