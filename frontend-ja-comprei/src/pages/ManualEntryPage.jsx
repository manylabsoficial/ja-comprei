import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Keyboard, Plus, Save, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ManualEntryPage({ onConfirm }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [items, setItems] = useState(() => location.state?.initialItems?.length
        ? location.state.initialItems
        : [{ id: Date.now(), name: '', quantity: '' }]);

    const validItems = items.filter((item) => item.name.trim());
    const addItem = () => setItems((current) => [...current, { id: Date.now() + Math.random(), name: '', quantity: '' }]);
    const removeItem = (id) => setItems((current) => current.length === 1
        ? [{ id: Date.now(), name: '', quantity: '' }]
        : current.filter((item) => item.id !== id));
    const changeItem = (id, field, value) => setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
    const confirm = () => validItems.length && onConfirm(validItems);

    return (
        <div className="min-h-screen bg-surface-base px-5 pb-28 pt-5 text-text-primary lg:min-h-0 lg:px-8 lg:pb-10 lg:pt-8 2xl:px-12">
            <div className="mx-auto max-w-[1320px]">
                <header className="mb-6 flex items-center gap-4 lg:hidden">
                    <button onClick={() => navigate('/dashboard')} className="flex size-10 items-center justify-center rounded-full border border-border-subtle bg-surface-raised"><ArrowLeft size={20} /></button>
                    <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-gold-500">Nova leitura</p><h1 className="text-lg font-extrabold">Entrada manual</h1></div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)] xl:gap-10">
                    <aside className="hidden rounded-[26px] border border-border-subtle bg-surface-raised p-6 lg:sticky lg:top-28 lg:block lg:h-fit lg:p-7">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500"><Keyboard size={23} /></span>
                        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-gold-500">Entrada precisa</p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em]">Monte sua despensa item por item</h2>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">Use quando souber exatamente o que tem em casa ou quiser complementar uma leitura.</p>
                        <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-sunken p-4">
                            <div className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={17} className="text-gold-500" /> Dica rápida</div>
                            <p className="mt-2 text-xs leading-5 text-text-tertiary">Pressione Enter em qualquer campo para criar a próxima linha.</p>
                        </div>
                    </aside>

                    <main className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-raised lg:rounded-[28px]">
                        <div className="flex flex-col gap-2 border-b border-border-subtle px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-500">Itens da sua cozinha</p>
                                <h2 className="mt-1 text-xl font-extrabold">O que você tem disponível?</h2>
                            </div>
                            <span className="text-xs font-semibold text-text-tertiary">{validItems.length} {validItems.length === 1 ? 'item preenchido' : 'itens preenchidos'} · Enter adiciona outra linha</span>
                        </div>

                        <div className="px-4 py-5 sm:px-7 sm:py-6">
                            <div className="hidden grid-cols-[minmax(0,1fr)_180px_44px] gap-3 px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-text-tertiary sm:grid">
                                <span>Ingrediente</span><span>Quantidade</span><span className="sr-only">Ações</span>
                            </div>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="grid gap-2 rounded-2xl border border-border-subtle bg-surface-sunken p-3 sm:grid-cols-[minmax(0,1fr)_180px_44px] sm:items-center sm:gap-3 sm:bg-transparent sm:p-0 sm:border-0">
                                        <label className="block">
                                            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary sm:hidden">Ingrediente</span>
                                            <input
                                                value={item.name}
                                                onChange={(event) => changeItem(item.id, 'name', event.target.value)}
                                                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addItem(); } }}
                                                placeholder="Ex.: arroz, tomate, ovos"
                                                autoFocus={index === items.length - 1 && items.length > 1}
                                                className="h-12 w-full rounded-xl border border-border-default bg-surface-sunken px-4 text-sm font-semibold outline-none transition placeholder:text-text-tertiary focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary sm:hidden">Quantidade</span>
                                            <input
                                                value={item.quantity}
                                                onChange={(event) => changeItem(item.id, 'quantity', event.target.value)}
                                                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addItem(); } }}
                                                placeholder="Ex.: 500 g"
                                                className="h-12 w-full rounded-xl border border-border-default bg-surface-sunken px-4 text-sm font-semibold outline-none transition placeholder:text-text-tertiary focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                                            />
                                        </label>
                                        <button onClick={() => removeItem(item.id)} className="flex size-11 items-center justify-center justify-self-end rounded-xl text-text-tertiary transition hover:bg-danger/10 hover:text-danger" aria-label={`Remover item ${index + 1}`}><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={addItem} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-default text-sm font-extrabold text-text-secondary transition hover:border-border-gold hover:bg-gold-500/5 hover:text-gold-400">
                                <Plus size={18} /> Adicionar outro item
                            </button>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-border-subtle bg-surface-sunken/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <button onClick={() => navigate('/dashboard')} className="h-12 rounded-xl px-5 text-sm font-bold text-text-tertiary transition hover:text-text-primary">Cancelar</button>
                            <button onClick={confirm} disabled={!validItems.length} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 text-sm font-extrabold text-on-gold shadow-lg shadow-gold-500/15 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40">
                                <Save size={18} /> Revisar ingredientes
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
