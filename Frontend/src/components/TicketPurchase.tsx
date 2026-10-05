import React, { useState } from 'react';
import { getCurrencySymbol } from '../utils/currency';

interface TicketPurchaseProps {
  eventId: string;
  ticketPrice: number;
  currency: string;
  isPremiumUser: boolean;
  onPurchase: (ticketData: any) => void;
}

export default function TicketPurchase({ 
  eventId, 
  ticketPrice, 
  currency, 
  isPremiumUser, 
  onPurchase 
}: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  
  const baseDiscount = 0.10; // 10% off for all users
  const premiumMonthlyDiscount = 0.50; // 50% off one ticket per month for premium users
  
  const calculatePrice = () => {
    let finalPrice = ticketPrice * quantity;
    
    // Apply 10% discount for all users
    finalPrice = finalPrice * (1 - baseDiscount);
    
    // Apply 50% off one ticket per month for premium users
    if (isPremiumUser && quantity >= 1) {
      const oneTicketDiscount = ticketPrice * premiumMonthlyDiscount;
      finalPrice = finalPrice - oneTicketDiscount;
    }
    
    return Math.max(0, finalPrice);
  };

  const finalPrice = calculatePrice();
  const savings = (ticketPrice * quantity) - finalPrice;
  const discountPercentage = isPremiumUser ? '10% + 50% off 1 ticket' : '10%';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Purchase Tickets</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-gray-600">Quantity:</label>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Original Price:</span>
            <span>{getCurrencySymbol(currency)}{(ticketPrice * quantity).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-purple-600">
            <span>Discount ({discountPercentage}):</span>
            <span>-{getCurrencySymbol(currency)}{savings.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2">
            <span>Total:</span>
            <span>{getCurrencySymbol(currency)}{finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {isPremiumUser && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">
              🎉 Premium Benefit: 50% off one ticket per month!
            </p>
          </div>
        )}

        <button
          onClick={() => onPurchase({
            eventId,
            quantity,
            originalPrice: ticketPrice * quantity,
            finalPrice,
            discount: savings,
            isPremiumUser
          })}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Purchase Tickets
        </button>
      </div>
    </div>
  );
}