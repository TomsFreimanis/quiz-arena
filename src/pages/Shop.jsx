import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { purchaseItem } from "../services/firebase";

export default function Shop() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const items = [
    { id: "science", name: "Zinātne", price: 100 },
    { id: "history", name: "Vēsture", price: 150 },
    { id: "hard_mode", name: "Grūtā režīma atslēga", price: 250 },
  ];

  if (!user) return <p className="text-center mt-10">Pieslēdzies, lai redzētu veikalu.</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">🛒 Veikals</h2>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b py-3"
        >
          <span>{item.name}</span>
          <button
            onClick={() => purchaseItem(user.uid, item)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Pirkt ({item.price}🪙)
          </button>
        </div>
      ))}
    </div>
  );
}
