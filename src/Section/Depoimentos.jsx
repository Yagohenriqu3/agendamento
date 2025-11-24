import React from 'react';

export default function Depoimentos() {
  return (
    <section className=" py-16 px-4 md:px-16 mb-30">
      {/* Título da seção */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#6EC1E4] mb-4">
          Clientes Satisfeitas com Nossos Resultados
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Veja o que nossas clientes dizem sobre os resultados visíveis dos nossos tratamentos estéticos.
        </p>
      </div>

      {/* Depoimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Depoimento 1 */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <p className="text-gray-700 italic mb-4">
            “Após os tratamentos faciais da clínica, minha pele nunca esteve tão bonita. Atendimento incrível!”
          </p>
          <span className="block text-[#6EC1E4] font-semibold">– Ana S.</span>
        </div>

        {/* Depoimento 2 */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <p className="text-gray-700 italic mb-4">
            “Os procedimentos corporais realmente transformaram meu corpo e minha autoestima. Recomendo de olhos fechados!”
          </p>
          <span className="block text-[#6EC1E4] font-semibold">– Marina L.</span>
        </div>
      </div>
    </section>
  );
}
