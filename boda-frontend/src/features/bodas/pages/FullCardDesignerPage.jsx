import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CardDesignerModal from '../components/CardDesignerModal';

export default function FullCardDesignerPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const bodaId = search.get('boda');

  // Build a minimal boda object for the modal
  const boda = { id: bodaId, nombre_pareja: '', fecha_boda: '', ciudad: '', subdominio: '' };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="mb-4 inline-block px-3 py-2 rounded border">Volver</button>
        <CardDesignerModal open={true} onClose={() => navigate(-1)} boda={boda} invitados={[]} />
      </div>
    </div>
  );
}
