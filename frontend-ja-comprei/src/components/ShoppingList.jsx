import { ArrowLeft, Check, Edit2, PlusCircle, UtensilsCrossed, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { saveShoppingList } from '../services/recipeService';

export default function ShoppingList({ ingredients, onGenerate, onAddIngredient, onBack }) {
    const { user } = useRecipes();
    const [items, setItems] = useState(ingredients.map(i => ({ ...i, checked: true })));
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // Item being edited
    const [isSaving, setIsSaving] = useState(false);
    const [isSaveDrawerOpen, setIsSaveDrawerOpen] = useState(false);

    const toggleItem = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleEditItem = (updatedItem) => {
        setItems(items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        ));
        setEditingItem(null);
    };

    const handleGenerateClick = () => {
        const selectedItems = items.filter(i => i.checked);
        onGenerate(selectedItems);
    };

    const handleOpenSaveDrawer = () => {
        if (!user) {
            alert('Você precisa estar logado para salvar listas.');
            return;
        }

        const validItems = items.filter(i => i.name && i.name.trim() !== '');
        if (validItems.length === 0) {
            alert('A lista está vazia.');
            return;
        }

        setIsSaveDrawerOpen(true);
    };

    const handleConfirmSaveList = async (listTitle) => {
        const validItems = items.filter(i => i.name && i.name.trim() !== '');
        setIsSaveDrawerOpen(false);
        setIsSaving(true);
        try {
            await saveShoppingList(user.id, listTitle, validItems);
            alert('Lista salva com sucesso!');
        } catch (error) {
            alert('Erro ao salvar lista. Tente novamente.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col mx-auto shadow-2xl bg-surface-base transition-colors duration-200 font-sans text-text-primary md:max-w-7xl md:px-0">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between bg-surface-base/90 px-6 py-5 backdrop-blur-md md:rounded-t-3xl border-b border-border-subtle">
                <button onClick={onBack} className="group flex size-10 items-center justify-center rounded-full bg-surface-raised shadow-sm transition-transform hover:scale-105 active:scale-95 text-text-primary">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold tracking-tight">
                    Sua despensa
                </h1>
                <button
                    onClick={handleOpenSaveDrawer}
                    disabled={isSaving || items.length === 0}
                    className="group flex size-10 items-center justify-center rounded-full bg-surface-raised shadow-sm transition-transform hover:scale-105 active:scale-95 text-gold-500 disabled:opacity-50"
                    title="Salvar Lista"
                >
                    <Save size={20} className={isSaving ? 'animate-pulse' : ''} />
                </button>
            </header>

            {/* Main Content List */}
            <main className="flex-1 px-4 pb-32 pt-2 md:px-8">
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                    {/* Helper Text */}
                    <p className="mb-2 px-2 text-sm font-medium text-text-tertiary">
                        {items.length > 0 ? `${items.length} itens · ${items.filter(i => i.checked).length} selecionados` : 'Nenhum item na lista'}
                    </p>

                    {items.map((item) => (
                        <div key={item.id} className={`group relative flex items-center justify-between gap-4 rounded-[1.5rem] bg-surface-raised p-4 shadow-sm border border-border-subtle transition-all hover:border-border-strong ${!item.checked ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-4">
                                {/* Custom Checkbox */}
                                <div className="relative flex size-6 items-center justify-center cursor-pointer" onClick={() => toggleItem(item.id)}>
                                    <div className={`peer h-6 w-6 rounded-md border-2 transition-all ${item.checked ? 'border-gold-500 bg-gold-500' : 'border-border-default'}`}></div>
                                    {item.checked && <Check size={16} className="absolute text-on-gold pointer-events-none" />}
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-base font-semibold">{item.name}</span>
                                    <span className="text-xs font-medium text-text-tertiary">{item.quantity}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="flex size-9 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary transition-colors hover:bg-surface-hover hover:text-gold-500"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="flex size-9 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Item Button */}
                    <button
                        onClick={() => setIsAddItemOpen(true)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-border-default p-4 text-text-tertiary transition-colors hover:border-gold-500 hover:text-gold-500"
                    >
                        <PlusCircle size={20} />
                        <span className="text-sm font-semibold">Adicionar item manualmente</span>
                    </button>
                </div>
            </main>

            {/* Generate Button — pílula dourada fixa (safe-area) */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe pt-4 bg-gradient-to-t from-surface-base via-surface-base/95 to-transparent">
                <div className="flex justify-center w-full max-w-7xl mx-auto pb-4">
                    <button
                        onClick={handleGenerateClick}
                        disabled={items.filter(i => i.checked).length === 0}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gold-500 text-on-gold shadow-lg shadow-gold-500/30 transition-all hover:bg-gold-600 active:scale-95 md:w-auto md:px-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UtensilsCrossed size={24} className="fill-current" />
                        <span className="text-lg font-bold">Sugerir Receitas</span>
                    </button>
                </div>
            </div>

            {/* Add Item Drawer */}
            {isAddItemOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsAddItemOpen(false)}
                    ></div>

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] bg-surface-overlay p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
                        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border-default"></div>

                        <h2 className="mb-6 text-xl font-bold text-text-primary">Adicionar Novo Item</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const name = formData.get('name');
                                const quantity = formData.get('quantity');

                                if (name) {
                                    const newItem = {
                                        id: Date.now(),
                                        name,
                                        quantity: quantity || '1 un',
                                        checked: true
                                    };
                                    setItems(prev => [...prev, newItem]);
                                    if (onAddIngredient) onAddIngredient(newItem);
                                    setIsAddItemOpen(false);
                                }
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-tertiary">Nome do Item</label>
                                <input
                                    name="name"
                                    autoFocus
                                    placeholder="Ex: Leite Integral"
                                    className="w-full rounded-xl bg-surface-sunken p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-gold-500"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-tertiary">Quantidade</label>
                                <input
                                    name="quantity"
                                    placeholder="Ex: 1 litro"
                                    className="w-full rounded-xl bg-surface-sunken p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-gold-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 shadow-lg shadow-gold-500/30 p-4 text-center font-bold text-on-gold transition-all hover:bg-gold-600 active:scale-95"
                            >
                                <span className="text-sm font-bold">Adicionar à Lista</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Item Drawer */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setEditingItem(null)}
                    ></div>

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] bg-surface-overlay p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
                        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border-default"></div>

                        <h2 className="mb-6 text-xl font-bold text-text-primary">Editar Item</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const name = formData.get('name');
                                const quantity = formData.get('quantity');

                                if (name) {
                                    handleEditItem({
                                        ...editingItem,
                                        name,
                                        quantity: quantity || '1 un'
                                    });
                                }
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-tertiary">Nome do Item</label>
                                <input
                                    name="name"
                                    autoFocus
                                    defaultValue={editingItem.name}
                                    placeholder="Ex: Leite Integral"
                                    className="w-full rounded-xl bg-surface-sunken p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-gold-500"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-tertiary">Quantidade</label>
                                <input
                                    name="quantity"
                                    defaultValue={editingItem.quantity}
                                    placeholder="Ex: 1 litro"
                                    className="w-full rounded-xl bg-surface-sunken p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-gold-500"
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-surface-hover p-4 text-center font-bold text-text-secondary transition-all hover:bg-surface-sunken active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gold-500 shadow-lg shadow-gold-500/30 p-4 text-center font-bold text-on-gold transition-all hover:bg-gold-600 active:scale-95"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save List Drawer — substitui o prompt() nativo */}
            {isSaveDrawerOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSaveDrawerOpen(false)}
                    ></div>

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] bg-surface-overlay p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
                        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border-default"></div>

                        <h2 className="mb-6 text-xl font-bold text-text-primary">Dê um nome para sua lista</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const listTitle = formData.get('listTitle');
                                if (listTitle && listTitle.trim() !== '') {
                                    handleConfirmSaveList(listTitle.trim());
                                }
                            }}
                            className="flex flex-col gap-4"
                        >
                            <input
                                name="listTitle"
                                autoFocus
                                defaultValue={`Lista ${new Date().toLocaleDateString('pt-BR')}`}
                                placeholder="Ex: Compras da semana"
                                className="w-full rounded-xl bg-surface-sunken p-4 text-base font-semibold outline-none focus:ring-2 focus:ring-gold-500"
                                required
                            />

                            <button
                                type="submit"
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 shadow-lg shadow-gold-500/30 p-4 text-center font-bold text-on-gold transition-all hover:bg-gold-600 active:scale-95"
                            >
                                <span className="text-sm font-bold">Salvar Lista</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

