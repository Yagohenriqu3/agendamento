import React from 'react';

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-r from-[#6EC1E4] to-[#58A3C4] py-20 px-4 md:px-16 text-center rounded-lg shadow-lg">
      {/* Título */}
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Agende Sua Avaliação e Transforme Sua Autoestima Hoje
      </h2>

      {/* Texto */}
      <p className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-8">
        Entre em contato agora e descubra como nossos tratamentos estéticos avançados podem realçar sua beleza natural. Atendimento personalizado, seguro e com resultados reais.
      </p>

      {/* Botão */}
      <a
        href="#"
        className="inline-block bg-white text-[#6EC1E4] font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
      >
        Agendar Agora
      </a>
    </section>
  );
}
