// src/components/AddHabitModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';

const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { addHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colors[5]); // по умолчанию фиолетовый

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || name.length > 50) return;  // Добавлена валидация длины
    addHabit({ name: name.trim(), description: description.trim(), color });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Новая привычка</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Название привычки (Например: Пить воду утром)"
            className="w-full p-4 bg-gray-900/50 rounded-xl border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />

          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Описание (необязательно)"
            className="w-full p-4 bg-gray-900/50 rounded-xl border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Выберите цвет</p>
            <div className="flex gap-3 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-12 h-12 rounded-full ${c} ${color === c ? 'ring-4 ring-offset-2 ring-gray-800' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Создать привычку
        </button>
      </div>
    </div>
  );
}