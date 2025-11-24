import React from 'react';

export default function Servicos() {
  return (
    <section className=" py-16 px-4 md:px-16 mb-20">
      {/* Título da seção */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#6EC1E4] mb-4">
          Nossos Tratamentos Estéticos
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Descubra nossos serviços completos para cuidados com a pele, corpo e bem-estar. Todos pensados para valorizar sua beleza natural.
        </p>
      </div>

      {/* Cards de serviços */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Estética Facial */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-[#6EC1E4] mb-4">Estética Facial</h3>
          <ul className="text-gray-600 space-y-2 list-disc list-inside">
            <li>Limpeza de pele profunda</li>
            <li>Rejuvenescimento facial</li>
            <li>Peeling</li>
            <li>Hidratação intensiva</li>
            <li>Tratamentos anti-idade</li>
          </ul>
        </div>

        {/* Estética Corporal */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-[#6EC1E4] mb-4">Estética Corporal</h3>
          <ul className="text-gray-600 space-y-2 list-disc list-inside">
            <li>Modelagem corporal</li>
            <li>Redução de medidas</li>
            <li>Tratamentos contra celulite</li>
            <li>Drenagem linfática</li>
            <li>Firmeza da pele</li>
          </ul>
        </div>

        {/* Bem-Estar e Relaxamento */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-[#6EC1E4] mb-4">Bem-Estar e Relaxamento</h3>
          <ul className="text-gray-600 space-y-2 list-disc list-inside">
            <li>Massagens terapêuticas</li>
            <li>Aromaterapia</li>
            <li>Cuidados exclusivos para relaxamento e energia renovada</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
