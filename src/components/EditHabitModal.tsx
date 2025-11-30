import { useState } from 'react';
import { X } from 'lucide-react';
import { useHabitStore, Habit } from '../store/habitStore';

const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
}

export default function EditHabitModal({ isOpen, onClose, habit }: Props) {
  const { editHabit, deleteHabit } = useHabitStore();
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [color, setColor] = useState(habit.color);

  if (!isOpen) return null;

  const handleSave = () => {
    editHabit(habit.id, { name, description, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Редактировать привычку</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Название привычки"
        />

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Описание (необязательно)"
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

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
          >
            Сохранить
          </button>
          <button
            onClick={() => {
              deleteHabit(habit.id);
              onClose();
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}