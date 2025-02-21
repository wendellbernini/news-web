require('dotenv').config();

// Script para testar o envio da newsletter
async function testNewsletter() {
  try {
    console.log('🚀 Iniciando teste da newsletter...');
    console.log('URL:', 'http://localhost:3000/api/newsletter');
    console.log('Token:', process.env.NEWSLETTER_SECRET_KEY);

    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEWSLETTER_SECRET_KEY}`,
      },
    });

    const text = await response.text();
    console.log('\n📊 Resultado:');
    console.log('Status:', response.status);
    console.log('Resposta:', text);

    try {
      const data = JSON.parse(text);
      console.log('JSON parseado:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('Não foi possível parsear como JSON');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Detalhes:', await error.response.text());
    }
  }
}

testNewsletter();
