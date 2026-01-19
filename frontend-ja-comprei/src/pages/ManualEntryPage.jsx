import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManualEntryPage({ onConfirm }) {
    const navigate = useNavigate();
    // Start with one empty row
    const [items, setItems] = useState([{ id: Date.now(), name: '', quantity: '' }]);

    // Auto-focus logic for new rows could range from complex to simple. 
    // For now, let's keep it simple.

    const handleAddItem = () => {
        setItems(prev => [...prev, { id: Date.now() + Math.random(), name: '', quantity: '' }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length === 1) {
            // If it's the last item, just clear it
            setItems([{ id: Date.now(), name: '', quantity: '' }]);
            return;
        }
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleChange = (id, field, value) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    const handleConfirm = () => {
        const validItems = items.filter(i => i.name.trim() !== '');
        if (validItems.length === 0) return;
        onConfirm(validItems);
    };

    return (
        <div className="min-h-screen bg-cream dark:bg-[#171b19] flex flex-col items-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md flex flex-col h-full gap-6">

                {/* Header */}
                <header className="flex items-center justify-between pt-4 pb-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white/10 shadow-sm text-charcoal dark:text-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-serif font-bold text-charcoal dark:text-gray-100">Entrada Manual</h1>
                    <div className="w-10"></div>
                </header>

                {/* Content */}
                <main className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="bg-white dark:bg-[#1c221f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-4 flex-1 overflow-hidden">

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-xs font-bold uppercase text-gray-400 w-2/3">Item</span>
                            <span className="text-xs font-bold uppercase text-gray-400 w-1/3 pl-2">Qtd.</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ex: Arroz"
                                            autoFocus={index === items.length - 1 && items.length > 1} // Auto focus on new row
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#171b19] border border-gray-200 dark:border-white/10 text-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sage transition-all"
                                        />
                                    </div>
                                    <div className="relative w-1/3 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={item.quantity}
                                            onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ex: 5kg"
                                            className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-[#171b19] border border-gray-200 dark:border-white/10 text-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sage transition-all text-center"
                                        />
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            tabIndex={-1}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddItem}
                                className="w-full py-3 flex items-center justify-center gap-2 text-sage font-bold hover:bg-sage/10 rounded-xl transition-colors border-2 border-dashed border-sage/30 mt-2"
                            >
                                <Plus size={20} />
                                Adicionar Item
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <button
                                onClick={handleConfirm}
                                disabled={items.filter(i => i.name.trim()).length === 0}
                                className="w-full h-14 bg-sage hover:bg-[#6a9480] text-white font-bold rounded-xl shadow-lg shadow-sage/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                Salvar Lista
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
